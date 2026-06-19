-- Sponsor slots: paid promotional placements rendered in the public site.
--
-- Each slot targets a placement (where it shows), an optional set of applicable
-- campaign types or a specific campaign id, has active dates, and a CTA. The
-- public site fetches slots filtered by placement + applicability + active window.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'cw_sponsor_placement') then
    create type cw_sponsor_placement as enum (
      'landing_hero',
      'campaign_detail_top',
      'campaign_detail_bottom',
      'programme_inline'
    );
  end if;
end $$;

create table if not exists public.sponsor_slots (
  id                      uuid primary key default gen_random_uuid(),
  placement               cw_sponsor_placement not null,
  sponsor_name            text not null,
  title                   text not null,
  body                    text,
  cta_label               text not null default 'Inquire now',
  cta_href                text not null default '/contact',
  image_url               text,
  background_from         text,
  background_to           text,
  applicable_types        cw_campaign_type[] not null default '{}',
  applicable_campaign_id  uuid references public.campaigns(id) on delete cascade,
  applicable_sub_category text references public.sub_categories(slug) on delete set null,
  is_published            boolean not null default false,
  active_from             timestamptz,
  active_until            timestamptz,
  sort_order              int not null default 0,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on table public.sponsor_slots is
  'Paid sponsor placements. Filter by placement + applicable_types/campaign + active window.';

create index if not exists sponsor_slots_placement_idx on public.sponsor_slots(placement);
create index if not exists sponsor_slots_active_idx on public.sponsor_slots(is_published, active_from, active_until);
create index if not exists sponsor_slots_applicable_types_idx on public.sponsor_slots using gin (applicable_types);
create index if not exists sponsor_slots_applicable_campaign_idx on public.sponsor_slots(applicable_campaign_id);

-- Keep updated_at fresh
create or replace function public.touch_sponsor_slots_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

drop trigger if exists sponsor_slots_touch_updated_at on public.sponsor_slots;
create trigger sponsor_slots_touch_updated_at
  before update on public.sponsor_slots
  for each row execute function public.touch_sponsor_slots_updated_at();

-- RLS: anyone can read currently-active published slots; only admins can write.
alter table public.sponsor_slots enable row level security;

drop policy if exists sponsor_slots_public_read on public.sponsor_slots;
create policy sponsor_slots_public_read on public.sponsor_slots
  for select
  using (
    is_published = true
    and (active_from is null or active_from <= now())
    and (active_until is null or active_until >= now())
  );

drop policy if exists sponsor_slots_admin_all on public.sponsor_slots;
create policy sponsor_slots_admin_all on public.sponsor_slots
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed one default placeholder for each campaign-detail placement so the
-- design renders on first install. These are not specific to any campaign.
insert into public.sponsor_slots (
  placement, sponsor_name, title, body, cta_label, cta_href,
  background_from, background_to, is_published, active_from, sort_order
) values
  (
    'campaign_detail_top',
    'Creative Wings',
    'Need eyes on your campaign? Get featured in this slot — reach 4k+ creators.',
    'Promote your competition, workshop or activity to the right audience for two weeks.',
    'Inquire now',
    '/contact?topic=sponsorship',
    '#F97316',
    '#7C2A12',
    true,
    now() - interval '1 day',
    10
  ),
  (
    'campaign_detail_bottom',
    'Creative Wings',
    'Don''t miss the moment — sponsor the next batch of campaigns.',
    'Bottom slot · placement available across competitions, workshops and activities.',
    'Talk to us',
    '/contact?topic=sponsorship',
    '#F97316',
    '#7C2A12',
    true,
    now() - interval '1 day',
    10
  )
on conflict do nothing;
