-- Phase D: voting limits, badges rules, issued certificates, judge comments

alter table public.campaigns
  add column if not exists vote_limit_per_user integer not null default 1;

alter table public.campaigns
  add column if not exists certificate_layout jsonb not null default '{
    "name": {"x": 400, "y": 320, "fontSize": 48, "fontFamily": "Helvetica", "color": "#1a1a1a", "align": "center"},
    "date": {"x": 400, "y": 400, "fontSize": 24, "fontFamily": "Helvetica", "color": "#666666", "align": "center"},
    "campaign_title": {"x": 400, "y": 260, "fontSize": 20, "fontFamily": "Helvetica", "color": "#444444", "align": "center"}
  }'::jsonb;

alter table public.submissions
  add column if not exists judge_comment text;

alter table public.submissions
  add column if not exists vote_count integer not null default 0;

alter table public.user_badges
  add column if not exists notified_at timestamptz;

alter table public.profiles
  add column if not exists consent_badge_emails boolean not null default true;

do $$ begin
  create type cw_badge_rule_type as enum (
    'submission_count',
    'certificate_count',
    'votes_received',
    'shortlisted',
    'campaign_winner',
    'organizer_published',
    'account_tenure_days'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.badge_rules (
  id            uuid primary key default gen_random_uuid(),
  badge_id      uuid not null references public.badges(id) on delete cascade,
  rule_type     cw_badge_rule_type not null,
  threshold     integer not null default 1,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (badge_id, rule_type)
);

create table if not exists public.issued_certificates (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  submission_id   uuid not null references public.submissions(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  storage_path    text not null,
  format          text not null default 'png',
  issued_at       timestamptz not null default now(),
  emailed_at      timestamptz,
  unique (submission_id)
);

create index if not exists issued_certificates_user_idx on public.issued_certificates(user_id);
create index if not exists issued_certificates_campaign_idx on public.issued_certificates(campaign_id);

alter table public.issued_certificates enable row level security;

drop policy if exists issued_certificates_owner_select on public.issued_certificates;
create policy issued_certificates_owner_select on public.issued_certificates
  for select using (user_id = auth.uid());

drop policy if exists issued_certificates_organizer_select on public.issued_certificates;
create policy issued_certificates_organizer_select on public.issued_certificates
  for select using (
    exists (
      select 1 from public.campaigns c
      join public.organizers o on o.id = c.organizer_id
      where c.id = campaign_id and o.owner_id = auth.uid()
    )
  );

drop policy if exists issued_certificates_admin_all on public.issued_certificates;
create policy issued_certificates_admin_all on public.issued_certificates
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.bump_submission_vote_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.submissions set vote_count = vote_count + 1 where id = new.submission_id;
  return new;
end $$;

drop trigger if exists trg_public_votes_bump on public.public_votes;
create trigger trg_public_votes_bump
  after insert on public.public_votes
  for each row execute function public.bump_submission_vote_count();
