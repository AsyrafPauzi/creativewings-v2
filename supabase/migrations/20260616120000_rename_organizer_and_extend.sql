-- ============================================================================
-- Creative Wings — rename `business` role to `organizer`,
-- add DOB / PDPA / guardian fields to profiles,
-- add portfolio_projects table (Behance-style for creators),
-- add public_votes table (for V3 public voting),
-- add `name` alias to organizers (keeps `business_name` too).
-- ============================================================================

-- ---- 1. Rename role enum value `business` -> `organizer` -------------------
do $$
begin
  if exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'cw_role' and e.enumlabel = 'business'
  ) and not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'cw_role' and e.enumlabel = 'organizer'
  ) then
    alter type cw_role rename value 'business' to 'organizer';
  end if;

  -- If the value `organizer` already exists but `business` is also present,
  -- migrate any remaining rows over (defensive).
  if exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'cw_role' and e.enumlabel = 'business'
  ) then
    update public.profiles set role = 'organizer'::cw_role where role::text = 'business';
  end if;
end $$;

-- ---- 2. Profiles: DOB / age category / PDPA consent / guardian -------------
alter table public.profiles
  add column if not exists date_of_birth     date,
  add column if not exists age_category      text, -- 'under_13' | 'teen' | 'young_adult' | 'adult'
  add column if not exists pdpa_consent_at   timestamptz,
  add column if not exists guardian_name     text,
  add column if not exists guardian_email    citext,
  add column if not exists guardian_phone    text,
  add column if not exists guardian_consent_at timestamptz,
  add column if not exists locale            text not null default 'en'; -- 'en' | 'zh'

create index if not exists profiles_age_category_idx on public.profiles(age_category);

-- Auto-derive age_category from DOB whenever DOB changes.
create or replace function public.derive_age_category()
returns trigger
language plpgsql
as $$
declare yrs int;
begin
  if new.date_of_birth is not null then
    yrs := extract(year from age(new.date_of_birth));
    if yrs < 13 then new.age_category := 'under_13';
    elsif yrs < 18 then new.age_category := 'teen';
    elsif yrs < 25 then new.age_category := 'young_adult';
    else new.age_category := 'adult';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_profiles_age_category on public.profiles;
create trigger trg_profiles_age_category
  before insert or update of date_of_birth on public.profiles
  for each row execute function public.derive_age_category();

-- ---- 3. Organizers: add `name` (kept `business_name` for compat) -----------
alter table public.organizers
  add column if not exists name text;

update public.organizers set name = business_name where name is null;

-- Keep both columns in sync going forward.
create or replace function public.sync_organizer_name()
returns trigger
language plpgsql
as $$
begin
  if new.name is null and new.business_name is not null then
    new.name := new.business_name;
  elsif new.business_name is null and new.name is not null then
    new.business_name := new.name;
  end if;
  return new;
end $$;

drop trigger if exists trg_organizer_name_sync on public.organizers;
create trigger trg_organizer_name_sync
  before insert or update on public.organizers
  for each row execute function public.sync_organizer_name();

-- ---- 4. Update org RLS to allow either 'organizer' or 'admin' --------------
drop policy if exists organizers_owner_insert on public.organizers;
create policy organizers_owner_insert on public.organizers
  for insert with check (
    owner_id = auth.uid()
    and public.current_role() in ('organizer', 'admin')
  );

-- ---- 5. Portfolio projects (Behance-like, for creators) --------------------
create table if not exists public.portfolio_projects (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references public.creators(id) on delete cascade,
  slug            citext not null,
  title           text not null,
  cover_url       text,
  description     text,
  tools           text[] not null default '{}',
  tags            text[] not null default '{}',
  sdg_goals       smallint[] not null default '{}',
  views_count     integer not null default 0,
  likes_count     integer not null default 0,
  is_published    boolean not null default false,
  published_at    timestamptz,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (creator_id, slug)
);

create index if not exists portfolio_projects_creator_idx on public.portfolio_projects(creator_id);
create index if not exists portfolio_projects_published_idx on public.portfolio_projects(is_published);

create table if not exists public.portfolio_project_assets (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.portfolio_projects(id) on delete cascade,
  url           text not null,
  caption       text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists portfolio_project_assets_project_idx
  on public.portfolio_project_assets(project_id);

-- updated_at trigger for portfolio_projects
drop trigger if exists trg_set_updated_at on public.portfolio_projects;
create trigger trg_set_updated_at
  before update on public.portfolio_projects
  for each row execute function public.set_updated_at();

alter table public.portfolio_projects        enable row level security;
alter table public.portfolio_project_assets  enable row level security;

create or replace function public.owns_creator_project(project uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from public.portfolio_projects p
    join public.creators c on c.id = p.creator_id
    where p.id = project and c.owner_id = auth.uid()
  )
$$;

drop policy if exists portfolio_projects_public_select on public.portfolio_projects;
create policy portfolio_projects_public_select on public.portfolio_projects
  for select using (
    is_published = true
    or exists (
      select 1 from public.creators c
      where c.id = portfolio_projects.creator_id and c.owner_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists portfolio_projects_owner_cud on public.portfolio_projects;
create policy portfolio_projects_owner_cud on public.portfolio_projects
  for all using (
    exists (
      select 1 from public.creators c
      where c.id = portfolio_projects.creator_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.creators c
      where c.id = portfolio_projects.creator_id and c.owner_id = auth.uid()
    )
  );

drop policy if exists portfolio_projects_admin_all on public.portfolio_projects;
create policy portfolio_projects_admin_all on public.portfolio_projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists portfolio_assets_select on public.portfolio_project_assets;
create policy portfolio_assets_select on public.portfolio_project_assets
  for select using (
    exists (
      select 1 from public.portfolio_projects p
      where p.id = portfolio_project_assets.project_id
        and (p.is_published = true or public.owns_creator_project(p.id) or public.is_admin())
    )
  );

drop policy if exists portfolio_assets_owner_cud on public.portfolio_project_assets;
create policy portfolio_assets_owner_cud on public.portfolio_project_assets
  for all using (public.owns_creator_project(project_id))
  with check (public.owns_creator_project(project_id));

drop policy if exists portfolio_assets_admin_all on public.portfolio_project_assets;
create policy portfolio_assets_admin_all on public.portfolio_project_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- 6. SDG reference table (i18n-ready labels) ----------------------------
create table if not exists public.sdg_goals_ref (
  goal_number   smallint primary key,
  title_en      text not null,
  title_zh      text,
  color         text not null,
  short_label   text
);

insert into public.sdg_goals_ref (goal_number, title_en, color, short_label) values
  (1,  'No Poverty',                          '#E5243B', 'No Poverty'),
  (2,  'Zero Hunger',                         '#DDA63A', 'Zero Hunger'),
  (3,  'Good Health and Well-being',          '#4C9F38', 'Good Health'),
  (4,  'Quality Education',                   '#C5192D', 'Quality Education'),
  (5,  'Gender Equality',                     '#FF3A21', 'Gender Equality'),
  (6,  'Clean Water and Sanitation',          '#26BDE2', 'Clean Water'),
  (7,  'Affordable and Clean Energy',         '#FCC30B', 'Clean Energy'),
  (8,  'Decent Work and Economic Growth',     '#A21942', 'Decent Work'),
  (9,  'Industry, Innovation, Infrastructure','#FD6925', 'Industry & Innovation'),
  (10, 'Reduced Inequalities',                '#DD1367', 'Reduced Inequalities'),
  (11, 'Sustainable Cities and Communities',  '#FD9D24', 'Sustainable Cities'),
  (12, 'Responsible Consumption and Production','#BF8B2E', 'Responsible Consumption'),
  (13, 'Climate Action',                      '#3F7E44', 'Climate Action'),
  (14, 'Life Below Water',                    '#0A97D9', 'Life Below Water'),
  (15, 'Life on Land',                        '#56C02B', 'Life on Land'),
  (16, 'Peace, Justice and Strong Institutions','#00689D', 'Peace & Justice'),
  (17, 'Partnerships for the Goals',          '#19486A', 'Partnerships')
on conflict (goal_number) do update set
  title_en    = excluded.title_en,
  color       = excluded.color,
  short_label = excluded.short_label;

alter table public.sdg_goals_ref enable row level security;
drop policy if exists sdg_public_select on public.sdg_goals_ref;
create policy sdg_public_select on public.sdg_goals_ref
  for select using (true);

-- ---- 7. Public voting (V3 ready) -------------------------------------------
create table if not exists public.public_votes (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  voter_hash    text not null, -- IP+UA hash, anonymous
  voted_at      timestamptz not null default now(),
  unique (submission_id, voter_hash)
);

create index if not exists public_votes_submission_idx on public.public_votes(submission_id);

alter table public.public_votes enable row level security;

drop policy if exists public_votes_select on public.public_votes;
create policy public_votes_select on public.public_votes
  for select using (true);

drop policy if exists public_votes_admin_all on public.public_votes;
create policy public_votes_admin_all on public.public_votes
  for all using (public.is_admin()) with check (public.is_admin());
