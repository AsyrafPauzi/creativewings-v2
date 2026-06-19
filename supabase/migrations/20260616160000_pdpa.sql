-- PDPA (Personal Data Protection Act, Malaysia 2010) compliance scaffolding.
--
-- Adds:
--   * pdpa_policy_versions       — versioned, hashable copies of the public notice.
--   * pdpa_consents              — append-only consent log per user/version.
--   * profile consent flag columns (granular toggles).
--   * data_export_requests       — async user data exports (right to portability).
--   * account_deletion_requests  — 30-day grace period erasure flow.
--   * helper functions, triggers, RLS policies, and one seed policy version.

-- ----------------------------------------------------------------------------
-- 1. PDPA policy versions
-- ----------------------------------------------------------------------------
create table if not exists public.pdpa_policy_versions (
  id              uuid primary key default gen_random_uuid(),
  version         text not null unique,
  effective_from  timestamptz not null default now(),
  summary         text,
  body_md         text not null,
  content_hash    text not null,
  is_current      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists pdpa_versions_current_idx
  on public.pdpa_policy_versions(is_current) where is_current;

-- Only one row may be flagged is_current at a time.
create or replace function public.enforce_single_current_pdpa() returns trigger as $$
begin
  if new.is_current then
    update public.pdpa_policy_versions
       set is_current = false
     where id <> new.id and is_current;
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists pdpa_single_current on public.pdpa_policy_versions;
create trigger pdpa_single_current
  before insert or update on public.pdpa_policy_versions
  for each row execute function public.enforce_single_current_pdpa();

-- ----------------------------------------------------------------------------
-- 2. Granular consent flags on profiles
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists pdpa_version_accepted   text,
  add column if not exists consent_marketing       boolean not null default false,
  add column if not exists consent_analytics       boolean not null default true,
  add column if not exists consent_third_party     boolean not null default false,
  add column if not exists consent_public_profile  boolean not null default true,
  add column if not exists consent_updated_at      timestamptz;

-- ----------------------------------------------------------------------------
-- 3. Append-only consent audit log
-- ----------------------------------------------------------------------------
create table if not exists public.pdpa_consents (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  policy_version           text not null,
  event                    text not null check (event in (
    'accept_signup',
    'accept_update',
    'consent_change',
    'withdraw',
    'reaccept'
  )),
  consent_marketing        boolean,
  consent_analytics        boolean,
  consent_third_party      boolean,
  consent_public_profile   boolean,
  ip_address               inet,
  user_agent               text,
  created_at               timestamptz not null default now()
);

create index if not exists pdpa_consents_user_idx on public.pdpa_consents(user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. Data export requests (right to portability)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cw_export_status') then
    create type cw_export_status as enum ('pending','processing','ready','expired','failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'cw_export_format') then
    create type cw_export_format as enum ('json','csv_zip','pdf_report');
  end if;
end $$;

create table if not exists public.data_export_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  status        cw_export_status not null default 'pending',
  format        cw_export_format not null default 'json',
  file_path     text,
  file_size     bigint,
  expires_at    timestamptz,
  failed_reason text,
  requested_at  timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists data_export_user_idx on public.data_export_requests(user_id, requested_at desc);
create index if not exists data_export_status_idx on public.data_export_requests(status);

-- ----------------------------------------------------------------------------
-- 5. Account deletion requests (right to erasure, 30-day grace)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cw_deletion_status') then
    create type cw_deletion_status as enum (
      'scheduled','cancelled','processing','completed','failed'
    );
  end if;
end $$;

create table if not exists public.account_deletion_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  status          cw_deletion_status not null default 'scheduled',
  reason          text,
  scheduled_for   timestamptz not null default (now() + interval '30 days'),
  cancelled_at    timestamptz,
  completed_at    timestamptz,
  failed_reason   text,
  requested_ip    inet,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists deletion_status_idx on public.account_deletion_requests(status, scheduled_for);

create or replace function public.touch_deletion_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end $$ language plpgsql;

drop trigger if exists deletion_touch on public.account_deletion_requests;
create trigger deletion_touch
  before update on public.account_deletion_requests
  for each row execute function public.touch_deletion_updated_at();

-- ----------------------------------------------------------------------------
-- 6. RLS
-- ----------------------------------------------------------------------------
alter table public.pdpa_policy_versions       enable row level security;
alter table public.pdpa_consents              enable row level security;
alter table public.data_export_requests       enable row level security;
alter table public.account_deletion_requests  enable row level security;

-- Anyone can read policy versions (needed for the public /pdpa page)
drop policy if exists pdpa_versions_public_read on public.pdpa_policy_versions;
create policy pdpa_versions_public_read on public.pdpa_policy_versions
  for select using (true);

drop policy if exists pdpa_versions_admin_write on public.pdpa_policy_versions;
create policy pdpa_versions_admin_write on public.pdpa_policy_versions
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Consents: a user can read & insert their own; admins can read all.
drop policy if exists pdpa_consents_self_select on public.pdpa_consents;
create policy pdpa_consents_self_select on public.pdpa_consents
  for select using (auth.uid() = user_id);

drop policy if exists pdpa_consents_self_insert on public.pdpa_consents;
create policy pdpa_consents_self_insert on public.pdpa_consents
  for insert with check (auth.uid() = user_id);

drop policy if exists pdpa_consents_admin_select on public.pdpa_consents;
create policy pdpa_consents_admin_select on public.pdpa_consents
  for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Export requests: owner reads/inserts; admin reads/updates.
drop policy if exists data_export_self on public.data_export_requests;
create policy data_export_self on public.data_export_requests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists data_export_admin on public.data_export_requests;
create policy data_export_admin on public.data_export_requests
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Deletion requests: owner can read/insert/update (to cancel); admin sees all.
drop policy if exists deletion_self on public.account_deletion_requests;
create policy deletion_self on public.account_deletion_requests
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists deletion_admin on public.account_deletion_requests;
create policy deletion_admin on public.account_deletion_requests
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ----------------------------------------------------------------------------
-- 7. Seed the initial policy version
-- ----------------------------------------------------------------------------
insert into public.pdpa_policy_versions (version, summary, body_md, content_hash, is_current, effective_from)
values (
  '1.0.0',
  'Initial PDPA Notice for Creative Wings — covers identity, contact, guardian, submissions, payments and tech telemetry.',
  '# Privacy & PDPA Notice v1.0.0' || E'\n\n' ||
  'Effective 16 June 2026. This notice describes how Creative Wings handles your personal data under Malaysia''s Personal Data Protection Act 2010. The full text is rendered on /pdpa.',
  encode(sha256('cw-pdpa-v1.0.0'::bytea), 'hex'),
  true,
  now()
)
on conflict (version) do nothing;
