-- Phase F: design variants + submission mockup URL

create table if not exists public.design_variants (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references public.campaigns(id) on delete cascade,
  slug              text not null,
  label             text not null,
  swatch_color      text,
  size_label        text,
  mockup_image_url  text not null,
  print_area_x      numeric(6,2) not null default 0,
  print_area_y      numeric(6,2) not null default 0,
  print_area_w      numeric(6,2) not null default 100,
  print_area_h      numeric(6,2) not null default 100,
  sort_order        integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  unique (campaign_id, slug)
);

create index if not exists design_variants_campaign_idx on public.design_variants(campaign_id);

alter table public.design_variants enable row level security;

drop policy if exists design_variants_public_read on public.design_variants;
create policy design_variants_public_read on public.design_variants
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.status = 'published'
    )
  );

drop policy if exists design_variants_organizer_all on public.design_variants;
create policy design_variants_organizer_all on public.design_variants
  for all using (
    exists (
      select 1 from public.campaigns c
      join public.organizers o on o.id = c.organizer_id
      where c.id = campaign_id and o.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.campaigns c
      join public.organizers o on o.id = c.organizer_id
      where c.id = campaign_id and o.owner_id = auth.uid()
    )
  );

alter table public.submissions
  add column if not exists mockup_url text;

insert into storage.buckets (id, name, public)
values ('mockups', 'mockups', true)
on conflict (id) do nothing;

drop policy if exists "mockups: public read" on storage.objects;
drop policy if exists "mockups: authenticated write" on storage.objects;

create policy "mockups: public read"
  on storage.objects for select
  using (bucket_id = 'mockups');

create policy "mockups: authenticated write"
  on storage.objects for insert
  with check (bucket_id = 'mockups' and auth.role() = 'authenticated');
