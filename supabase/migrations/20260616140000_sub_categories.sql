-- Sub-categories: a shared pool keyed by slug, with per-type applicability.
-- A sub-category like "photography" can apply to competition + activity + workshop.
-- Campaigns reference a single sub-category slug; filtering happens via FK + applicable_types.

create table if not exists public.sub_categories (
  slug              text primary key,
  label_en          text not null,
  label_zh          text,
  icon              text not null,                -- lucide icon name
  description_en    text,
  description_zh    text,
  applicable_types  cw_campaign_type[] not null default '{}',
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

comment on table public.sub_categories is
  'Shared sub-category pool. applicable_types restricts which campaign type(s) may use a given sub-category.';

create index if not exists sub_categories_applicable_types_idx
  on public.sub_categories using gin (applicable_types);

-- Campaigns gain a sub_category slug (nullable for back-compat with existing rows).
alter table public.campaigns
  add column if not exists sub_category text references public.sub_categories(slug);

create index if not exists campaigns_sub_category_idx
  on public.campaigns(sub_category);

-- Seed the pool. Each row lists which types may use it.
insert into public.sub_categories (slug, label_en, label_zh, icon, applicable_types, sort_order) values
  ('art-illustration',     'Art & Illustration',       '艺术与插画',     'palette',       array['competition','activity']::cw_campaign_type[],                          10),
  ('design',               'Design',                    '设计',          'swatch-book',   array['competition','workshop']::cw_campaign_type[],                          20),
  ('photography',          'Photography',               '摄影',          'camera',        array['competition','activity','workshop']::cw_campaign_type[],               30),
  ('writing-poetry',       'Writing & Poetry',          '写作与诗歌',     'book-open',     array['competition','workshop']::cw_campaign_type[],                          40),
  ('film-animation',       'Film & Animation',          '影片与动画',     'film',          array['competition','workshop']::cw_campaign_type[],                          50),
  ('music-sound',          'Music & Sound',             '音乐与声音',     'music',         array['competition','activity','workshop']::cw_campaign_type[],               60),
  ('performance-stage',    'Performance & Stage',       '表演与舞台',     'mic',           array['competition','activity']::cw_campaign_type[],                          70),
  ('stem-innovation',      'STEM & Innovation',         'STEM 与创新',    'lightbulb',     array['competition','activity','workshop']::cw_campaign_type[],               80),
  ('sustainability',       'Sustainability & Climate',  '可持续与气候',   'leaf',          array['competition','activity']::cw_campaign_type[],                          90),
  ('sports-wellness',      'Sports & Wellness',         '运动与健康',     'footprints',    array['activity']::cw_campaign_type[],                                       100),
  ('community-volunteer',  'Community & Volunteering',  '社区与志愿',     'hand-heart',    array['activity']::cw_campaign_type[],                                       110),
  ('cultural-heritage',    'Cultural & Heritage',       '文化与传统',     'landmark',      array['competition','activity']::cw_campaign_type[],                         120),
  ('career-soft-skills',   'Career & Soft Skills',      '职场与软技能',   'briefcase',     array['workshop']::cw_campaign_type[],                                       130),
  ('entrepreneurship',     'Entrepreneurship',          '创业',          'rocket',        array['workshop']::cw_campaign_type[],                                       140)
on conflict (slug) do update set
  label_en = excluded.label_en,
  label_zh = excluded.label_zh,
  icon = excluded.icon,
  applicable_types = excluded.applicable_types,
  sort_order = excluded.sort_order;

-- Public read access to the catalogue.
alter table public.sub_categories enable row level security;

drop policy if exists sub_categories_public_read on public.sub_categories;
create policy sub_categories_public_read on public.sub_categories
  for select using (true);
