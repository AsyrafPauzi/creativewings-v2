-- ============================================================================
-- Creative Wings — initial schema
-- Mirrors the core domain of the legacy WordPress plugin:
--   profiles (1 row per auth user) → role-specific extension rows
--   organizers (business partners) own campaigns
--   campaigns have age_brackets, prizes, faq, custom_fields, schools, sponsors
--   submissions belong to a campaign and (optionally) a contestant
--   wallet ledger + badges ledger live alongside
--
-- All tables are protected by RLS. Service role bypasses RLS.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type cw_role as enum ('contestant', 'creator', 'business', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_campaign_type as enum ('competition', 'activity');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_campaign_status as enum ('draft', 'pending', 'published', 'closed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_event_mode as enum ('online', 'physical', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_submission_status as enum (
    'staged',         -- uploaded by school, awaiting claim
    'claimed',        -- claimed by user, awaiting payment
    'paid',           -- entry fee paid (or sponsored)
    'approved',       -- moderator approved
    'rejected',       -- moderator rejected
    'shortlisted',    -- shortlisted for prize
    'winner',         -- winner
    'withdrawn'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_moderation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_field_type as enum ('text', 'textarea', 'number', 'phone', 'email', 'date', 'select', 'checkbox', 'file');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_wallet_entry_type as enum ('credit', 'debit');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- PROFILES (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         citext not null,
  full_name     text,
  display_name  text,
  username      citext unique,
  avatar_url    text,
  role          cw_role not null default 'contestant',
  is_admin      boolean not null default false,
  phone         text,
  country       text,
  city          text,
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_username_idx on public.profiles(username);

-- ----------------------------------------------------------------------------
-- ORGANIZERS — extended fields for business partners.
-- One profile (role='business') can own at most one organizer.
-- ----------------------------------------------------------------------------
create table if not exists public.organizers (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null unique references public.profiles(id) on delete cascade,
  slug            citext not null unique,
  business_name   text not null,
  logo_url        text,
  banner_url      text,
  industry        text,
  about           text,
  website         text,
  email           citext,
  phone           text,
  city            text,
  country         text,
  facebook_url    text,
  instagram_url   text,
  linkedin_url    text,
  youtube_url     text,
  tiktok_url      text,
  is_listed       boolean not null default false,  -- visible in public directory
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists organizers_is_listed_idx on public.organizers(is_listed);

-- ----------------------------------------------------------------------------
-- CREATORS — extended fields for creator portfolios.
-- One profile (role='creator') can own at most one creator card.
-- ----------------------------------------------------------------------------
create table if not exists public.creators (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null unique references public.profiles(id) on delete cascade,
  slug            citext not null unique,
  display_name    text not null,
  profile_image_url text,
  cover_image_url text,
  tagline         text,
  bio             text,
  address         text,
  city            text,
  country         text,
  website         text,
  facebook_url    text,
  instagram_url   text,
  behance_url     text,
  dribbble_url    text,
  tiktok_url      text,
  is_listed       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists creators_is_listed_idx on public.creators(is_listed);

-- ----------------------------------------------------------------------------
-- CAMPAIGNS — competitions or activities.
-- ----------------------------------------------------------------------------
create table if not exists public.campaigns (
  id                          uuid primary key default gen_random_uuid(),
  organizer_id                uuid not null references public.organizers(id) on delete cascade,
  slug                        citext not null unique,
  title                       text not null,
  serial_code                 text,                -- e.g. "002" — used in submission codes
  type                        cw_campaign_type not null default 'competition',
  status                      cw_campaign_status not null default 'draft',
  short_description           text,
  description                 text,
  banner_url                  text,
  hero_url                    text,
  certificate_template_url    text,

  entry_fee                   numeric(10,2) not null default 0,
  currency                    text not null default 'MYR',

  submission_start            timestamptz,
  submission_deadline         timestamptz,
  review_start                timestamptz,
  final_event_date            timestamptz,

  event_mode                  cw_event_mode default 'online',
  location_details            text,

  -- KPI / progress card on the public page
  kpi_show_progress           boolean not null default false,
  kpi_target                  integer not null default 0,
  kpi_label                   text,

  -- Toggles (mirror the WP plugin)
  allow_multiple_submissions  boolean not null default false,
  multi_min                   integer not null default 1,
  multi_max                   integer not null default 1,
  enable_addons               boolean not null default false,
  enable_age_brackets         boolean not null default false,
  enable_school_sponsors      boolean not null default false,
  enable_certificate          boolean not null default true,
  enable_voting               boolean not null default false,
  enable_checkout_message     boolean not null default false,
  checkout_message_label      text,
  checkout_message_required   boolean not null default false,
  use_account_fullname        boolean not null default true,

  -- Design submission (PNG composited onto product mockup)
  enable_design               boolean not null default false,
  design_picker_label         text,
  design_artwork_w            integer,
  design_artwork_h            integer,

  -- Judging
  judging_criteria            text,
  total_prize_value           text,

  -- SDGs (UN 1–17)
  sdg_goals                   smallint[] not null default '{}',

  -- Counters denormalised for cheap card rendering
  submissions_count           integer not null default 0,
  views_count                 integer not null default 0,

  published_at                timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists campaigns_organizer_idx on public.campaigns(organizer_id);
create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaigns_type_idx on public.campaigns(type);
create index if not exists campaigns_deadline_idx on public.campaigns(submission_deadline);

-- ----------------------------------------------------------------------------
-- AGE BRACKETS — per-campaign categories (Primary, Secondary, etc.)
-- ----------------------------------------------------------------------------
create table if not exists public.age_brackets (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  key          text not null,
  label        text not null,
  min_age      integer not null default 0,
  max_age      integer not null default 99,
  sort_order   integer not null default 0,
  unique (campaign_id, key)
);

-- ----------------------------------------------------------------------------
-- PRIZES — per campaign
-- ----------------------------------------------------------------------------
create table if not exists public.prizes (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  title        text not null,
  description  text,
  rank         integer,
  image_url    text,
  sort_order   integer not null default 0
);

-- ----------------------------------------------------------------------------
-- FAQ — per campaign
-- ----------------------------------------------------------------------------
create table if not exists public.faq_items (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0
);

-- ----------------------------------------------------------------------------
-- CUSTOM FIELDS — extra form fields a contestant fills at submission
-- ----------------------------------------------------------------------------
create table if not exists public.custom_fields (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  label        text not null,
  field_type   cw_field_type not null default 'text',
  options      text,            -- e.g. comma-separated list for selects
  required     boolean not null default false,
  sort_order   integer not null default 0
);

-- ----------------------------------------------------------------------------
-- SCHOOLS — registered schools, optionally per-campaign
-- ----------------------------------------------------------------------------
create table if not exists public.schools (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  school_code   text not null,      -- 3-letter code like "001"
  school_name   text not null,
  coupon_code   text,
  city          text,
  country       text,
  created_at    timestamptz not null default now(),
  unique (campaign_id, school_code)
);

-- ----------------------------------------------------------------------------
-- SPONSOR COUPONS — codes that grant fee-waived submissions
-- ----------------------------------------------------------------------------
create table if not exists public.sponsor_coupons (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  school_id     uuid references public.schools(id) on delete set null,
  code          citext not null unique,
  max_uses      integer not null default 0,    -- 0 = unlimited
  used_count    integer not null default 0,
  expires_at    timestamptz,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- UPLOAD TOKENS — tokenised links for schools to bulk-upload entries
-- ----------------------------------------------------------------------------
create table if not exists public.upload_tokens (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique,
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  school_id     uuid references public.schools(id) on delete set null,
  school_code   text,
  expires_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- SUBMISSIONS — the central table
-- ----------------------------------------------------------------------------
create table if not exists public.submissions (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         uuid not null references public.campaigns(id) on delete cascade,
  contestant_id       uuid references public.profiles(id) on delete set null,
  age_bracket_id      uuid references public.age_brackets(id) on delete set null,
  school_id           uuid references public.schools(id) on delete set null,

  -- Human-readable submission code: "SCH-MM-SEQ" (e.g. "001-06-000123")
  submission_code     text,
  school_code         text,
  month_code          text,
  seq_code            text,

  -- Student / participant metadata (may be different from the claimer)
  student_name        text,
  guardian_name       text,
  guardian_contact    text,
  age                 integer,

  -- Artwork
  artwork_url         text,
  artwork_source_url  text,           -- vector/source file (optional)
  design_variant      text,           -- chosen mockup variant slug
  checkout_message    text,

  -- Per-campaign custom field answers (jsonb keyed by custom_fields.id)
  field_data          jsonb not null default '{}'::jsonb,

  -- Workflow
  status              cw_submission_status not null default 'staged',
  moderation_status   cw_moderation_status not null default 'pending',
  moderation_note     text,

  -- Reservation lock so two users can't claim the same staged code at once
  claim_reserved_by   uuid references public.profiles(id) on delete set null,
  claim_reserved_until timestamptz,

  -- Scoring / ranking
  score               numeric(6,2),
  rank                integer,

  -- Payments
  paid_at             timestamptz,
  sponsor_coupon_id   uuid references public.sponsor_coupons(id) on delete set null,
  stripe_payment_intent text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  unique (campaign_id, submission_code)
);

create index if not exists submissions_campaign_idx on public.submissions(campaign_id);
create index if not exists submissions_contestant_idx on public.submissions(contestant_id);
create index if not exists submissions_status_idx on public.submissions(status);
create index if not exists submissions_moderation_idx on public.submissions(moderation_status);

-- ----------------------------------------------------------------------------
-- WALLET LEDGER — append-only credit/debit entries.
-- Balance = sum(amount) where amount is signed.
-- ----------------------------------------------------------------------------
create table if not exists public.wallet_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  entry_type    cw_wallet_entry_type not null,
  amount        numeric(12,2) not null,          -- always positive; entry_type signals direction
  currency      text not null default 'MYR',
  reason        text not null,                   -- e.g. 'refund', 'prize_payout', 'sponsor_grant'
  reference_id  uuid,                            -- optional FK to a submission/order/etc.
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists wallet_user_idx on public.wallet_entries(user_id);

-- ----------------------------------------------------------------------------
-- BADGES
-- ----------------------------------------------------------------------------
create table if not exists public.badges (
  id            uuid primary key default gen_random_uuid(),
  slug          citext not null unique,
  name          text not null,
  description   text,
  icon_url      text,
  tier          text,                            -- bronze / silver / gold / etc.
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.user_badges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  badge_id      uuid not null references public.badges(id) on delete cascade,
  campaign_id   uuid references public.campaigns(id) on delete set null,
  awarded_at    timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists user_badges_user_idx on public.user_badges(user_id);

-- ----------------------------------------------------------------------------
-- AUDIT LOG
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id            uuid primary key default gen_random_uuid(),
  action        text not null,
  object_type   text not null,
  object_id     uuid,
  actor_id      uuid references public.profiles(id) on delete set null,
  details       jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists audit_object_idx on public.audit_log(object_type, object_id);

-- ----------------------------------------------------------------------------
-- COMMON TRIGGERS
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','organizers','creators','campaigns','submissions'
  ]
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at
         before update on public.%I
         for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user is created.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Submission count maintenance.
-- ----------------------------------------------------------------------------
create or replace function public.bump_campaign_submissions_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.campaigns set submissions_count = submissions_count + 1 where id = new.campaign_id;
  elsif tg_op = 'DELETE' then
    update public.campaigns set submissions_count = greatest(0, submissions_count - 1) where id = old.campaign_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_bump_submissions on public.submissions;
create trigger trg_bump_submissions
  after insert or delete on public.submissions
  for each row execute function public.bump_campaign_submissions_count();
