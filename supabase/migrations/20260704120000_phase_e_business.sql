-- Phase E: platform settings, API keys for REST integrations

create table if not exists public.platform_settings (
  id                          text primary key default 'default',
  require_campaign_approval   boolean not null default false,
  updated_at                  timestamptz not null default now(),
  updated_by                  uuid references public.profiles(id)
);

insert into public.platform_settings (id, require_campaign_approval)
values ('default', false)
on conflict (id) do nothing;

do $$ begin
  create type cw_api_key_scope as enum ('read_submissions', 'read_kpis', 'webhooks');
exception when duplicate_object then null; end $$;

create table if not exists public.api_keys (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.organizers(id) on delete cascade,
  name            text not null,
  key_prefix      text not null,
  key_hash        text not null unique,
  scopes          cw_api_key_scope[] not null default '{read_submissions,read_kpis}',
  is_active       boolean not null default true,
  last_used_at    timestamptz,
  created_at      timestamptz not null default now(),
  created_by      uuid references public.profiles(id)
);

create index if not exists api_keys_organizer_idx on public.api_keys(organizer_id);
create index if not exists api_keys_prefix_idx on public.api_keys(key_prefix);

alter table public.platform_settings enable row level security;
alter table public.api_keys enable row level security;

drop policy if exists platform_settings_admin_all on public.platform_settings;
create policy platform_settings_admin_all on public.platform_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists platform_settings_read on public.platform_settings;
create policy platform_settings_read on public.platform_settings
  for select using (true);

drop policy if exists api_keys_organizer_select on public.api_keys;
create policy api_keys_organizer_select on public.api_keys
  for select using (
    exists (
      select 1 from public.organizers o
      where o.id = organizer_id and o.owner_id = auth.uid()
    )
  );

drop policy if exists api_keys_admin_all on public.api_keys;
create policy api_keys_admin_all on public.api_keys
  for all using (public.is_admin()) with check (public.is_admin());
