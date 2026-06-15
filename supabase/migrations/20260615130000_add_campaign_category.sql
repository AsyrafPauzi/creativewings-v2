-- Add a free-form display category (e.g. "Art", "Running", "Design") to
-- campaigns. This is independent of the `type` enum (competition / activity)
-- and powers the colored category pill on campaign cards.

alter table public.campaigns
  add column if not exists category text;

create index if not exists campaigns_category_idx on public.campaigns(category);
