-- ============================================================================
-- Guardian ↔ student linking for minors
-- ============================================================================

-- ---- 1. is_minor flag on profiles ------------------------------------------
alter table public.profiles
  add column if not exists is_minor boolean not null default false;

-- Keep is_minor in sync with age_category whenever DOB changes.
create or replace function public.derive_age_category()
returns trigger
language plpgsql
as $$
declare yrs int;
begin
  if new.date_of_birth is not null then
    yrs := extract(year from age(new.date_of_birth));
    if yrs < 13 then
      new.age_category := 'under_13';
      new.is_minor := true;
    elsif yrs < 18 then
      new.age_category := 'teen';
      new.is_minor := true;
    elsif yrs < 25 then
      new.age_category := 'young_adult';
      new.is_minor := false;
    else
      new.age_category := 'adult';
      new.is_minor := false;
    end if;
  end if;
  return new;
end $$;

-- ---- 2. guardian_links table -----------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cw_guardian_link_status') then
    create type cw_guardian_link_status as enum ('pending_invite', 'active');
  end if;
end $$;

create table if not exists public.guardian_links (
  id              uuid primary key default gen_random_uuid(),
  guardian_id     uuid references public.profiles(id) on delete set null,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  guardian_name   text not null,
  guardian_email  citext not null,
  status          cw_guardian_link_status not null default 'pending_invite',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint guardian_links_student_unique unique (student_id)
);

create index if not exists guardian_links_guardian_id_idx on public.guardian_links(guardian_id);
create index if not exists guardian_links_guardian_email_idx on public.guardian_links(guardian_email);
create index if not exists guardian_links_status_idx on public.guardian_links(status);

-- Auto-link guardian when they sign up with a matching email.
create or replace function public.activate_guardian_links_for_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.guardian_links
  set
    guardian_id = new.id,
    status = 'active',
    updated_at = now()
  where
    status = 'pending_invite'
    and guardian_id is null
    and lower(guardian_email::text) = lower(new.email::text);

  return new;
end $$;

drop trigger if exists trg_profiles_activate_guardian_links on public.profiles;
create trigger trg_profiles_activate_guardian_links
  after insert on public.profiles
  for each row execute function public.activate_guardian_links_for_email();

-- ---- 3. RLS ---------------------------------------------------------------
alter table public.guardian_links enable row level security;

drop policy if exists guardian_links_student_select on public.guardian_links;
create policy guardian_links_student_select on public.guardian_links
  for select using (student_id = auth.uid());

drop policy if exists guardian_links_guardian_select on public.guardian_links;
create policy guardian_links_guardian_select on public.guardian_links
  for select using (guardian_id = auth.uid());

drop policy if exists guardian_links_admin_all on public.guardian_links;
create policy guardian_links_admin_all on public.guardian_links
  for all using (public.is_admin())
  with check (public.is_admin());
