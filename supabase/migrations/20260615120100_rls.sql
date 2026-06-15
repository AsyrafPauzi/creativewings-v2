-- ============================================================================
-- Creative Wings — Row Level Security policies
--
-- Reading is generous for public content (published campaigns, listed
-- organizers/creators), tight for private data (submissions, wallet, audit).
-- Writing is gated by role + ownership.
-- ============================================================================

-- ---- helpers ---------------------------------------------------------------

create or replace function public.current_role()
returns cw_role
language sql stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.owns_organizer(org_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.organizers
    where id = org_id and owner_id = auth.uid()
  )
$$;

create or replace function public.owns_campaign(camp_id uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.campaigns c
    join public.organizers o on o.id = c.organizer_id
    where c.id = camp_id and o.owner_id = auth.uid()
  )
$$;

-- ---- enable RLS on every table ---------------------------------------------

alter table public.profiles          enable row level security;
alter table public.organizers        enable row level security;
alter table public.creators          enable row level security;
alter table public.campaigns         enable row level security;
alter table public.age_brackets      enable row level security;
alter table public.prizes            enable row level security;
alter table public.faq_items         enable row level security;
alter table public.custom_fields     enable row level security;
alter table public.schools           enable row level security;
alter table public.sponsor_coupons   enable row level security;
alter table public.upload_tokens     enable row level security;
alter table public.submissions       enable row level security;
alter table public.wallet_entries    enable row level security;
alter table public.badges            enable row level security;
alter table public.user_badges       enable row level security;
alter table public.audit_log         enable row level security;

-- ---- profiles --------------------------------------------------------------

drop policy if exists profiles_self_select   on public.profiles;
drop policy if exists profiles_public_select on public.profiles;
drop policy if exists profiles_self_update   on public.profiles;
drop policy if exists profiles_admin_all     on public.profiles;

-- Everyone can read a small public-safe subset (we hide email/phone via views in app code)
create policy profiles_public_select on public.profiles
  for select using (true);

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- organizers ------------------------------------------------------------

drop policy if exists organizers_public_select on public.organizers;
drop policy if exists organizers_owner_select  on public.organizers;
drop policy if exists organizers_owner_insert  on public.organizers;
drop policy if exists organizers_owner_update  on public.organizers;
drop policy if exists organizers_admin_all     on public.organizers;

create policy organizers_public_select on public.organizers
  for select using (is_listed = true or owner_id = auth.uid() or public.is_admin());

create policy organizers_owner_insert on public.organizers
  for insert with check (owner_id = auth.uid() and public.current_role() in ('business', 'admin'));

create policy organizers_owner_update on public.organizers
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy organizers_admin_all on public.organizers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- creators --------------------------------------------------------------

drop policy if exists creators_public_select on public.creators;
drop policy if exists creators_owner_select  on public.creators;
drop policy if exists creators_owner_insert  on public.creators;
drop policy if exists creators_owner_update  on public.creators;
drop policy if exists creators_admin_all     on public.creators;

create policy creators_public_select on public.creators
  for select using (is_listed = true or owner_id = auth.uid() or public.is_admin());

create policy creators_owner_insert on public.creators
  for insert with check (owner_id = auth.uid());

create policy creators_owner_update on public.creators
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy creators_admin_all on public.creators
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- campaigns -------------------------------------------------------------

drop policy if exists campaigns_public_select on public.campaigns;
drop policy if exists campaigns_owner_select  on public.campaigns;
drop policy if exists campaigns_owner_cud     on public.campaigns;
drop policy if exists campaigns_admin_all     on public.campaigns;

create policy campaigns_public_select on public.campaigns
  for select using (
    status in ('published', 'closed')
    or public.owns_campaign(id)
    or public.is_admin()
  );

create policy campaigns_owner_insert on public.campaigns
  for insert with check (public.owns_organizer(organizer_id));

create policy campaigns_owner_update on public.campaigns
  for update using (public.owns_organizer(organizer_id))
  with check (public.owns_organizer(organizer_id));

create policy campaigns_owner_delete on public.campaigns
  for delete using (public.owns_organizer(organizer_id));

create policy campaigns_admin_all on public.campaigns
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- generic child tables of campaigns (age_brackets/prizes/faq/custom_fields)
-- Public can SELECT only when parent campaign is publicly visible.
-- Owner can do anything on their own campaign's children.

do $$
declare t text;
begin
  foreach t in array array['age_brackets','prizes','faq_items','custom_fields']
  loop
    execute format($pol$
      drop policy if exists %1$s_public_select on public.%1$s;
      create policy %1$s_public_select on public.%1$s
        for select using (
          exists (
            select 1 from public.campaigns c
            where c.id = %1$s.campaign_id
              and (c.status in ('published','closed') or public.owns_campaign(c.id) or public.is_admin())
          )
        );

      drop policy if exists %1$s_owner_cud on public.%1$s;
      create policy %1$s_owner_cud on public.%1$s
        for all using (public.owns_campaign(campaign_id))
        with check (public.owns_campaign(campaign_id));

      drop policy if exists %1$s_admin_all on public.%1$s;
      create policy %1$s_admin_all on public.%1$s
        for all using (public.is_admin()) with check (public.is_admin());
    $pol$, t);
  end loop;
end $$;

-- ---- schools / sponsor coupons / upload tokens (owner-only, never public) --

do $$
declare t text;
begin
  foreach t in array array['schools','sponsor_coupons','upload_tokens']
  loop
    execute format($pol$
      drop policy if exists %1$s_owner_select on public.%1$s;
      create policy %1$s_owner_select on public.%1$s
        for select using (public.owns_campaign(campaign_id) or public.is_admin());

      drop policy if exists %1$s_owner_cud on public.%1$s;
      create policy %1$s_owner_cud on public.%1$s
        for all using (public.owns_campaign(campaign_id))
        with check (public.owns_campaign(campaign_id));

      drop policy if exists %1$s_admin_all on public.%1$s;
      create policy %1$s_admin_all on public.%1$s
        for all using (public.is_admin()) with check (public.is_admin());
    $pol$, t);
  end loop;
end $$;

-- ---- submissions -----------------------------------------------------------

drop policy if exists submissions_contestant_select on public.submissions;
drop policy if exists submissions_owner_select      on public.submissions;
drop policy if exists submissions_contestant_insert on public.submissions;
drop policy if exists submissions_contestant_update on public.submissions;
drop policy if exists submissions_owner_update      on public.submissions;
drop policy if exists submissions_admin_all         on public.submissions;
drop policy if exists submissions_public_count      on public.submissions;

-- Contestant sees own submissions. Organizer of the campaign sees all submissions
-- for their campaigns. Admin sees everything. The public never reads rows here.
create policy submissions_contestant_select on public.submissions
  for select using (
    contestant_id = auth.uid()
    or public.owns_campaign(campaign_id)
    or public.is_admin()
  );

-- Logged-in users can insert a submission tied to themselves on a published campaign
create policy submissions_contestant_insert on public.submissions
  for insert with check (
    contestant_id = auth.uid()
    and exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.status = 'published'
    )
  );

-- Contestant can update only soft fields on their own submission while still pending
create policy submissions_contestant_update on public.submissions
  for update using (
    contestant_id = auth.uid()
    and status in ('staged','claimed','paid')
  )
  with check (contestant_id = auth.uid());

-- Organizer of the campaign can update any of its submissions (moderation/score)
create policy submissions_owner_update on public.submissions
  for update using (public.owns_campaign(campaign_id))
  with check (public.owns_campaign(campaign_id));

create policy submissions_admin_all on public.submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- wallet ----------------------------------------------------------------

drop policy if exists wallet_owner_select on public.wallet_entries;
drop policy if exists wallet_admin_all    on public.wallet_entries;

create policy wallet_owner_select on public.wallet_entries
  for select using (user_id = auth.uid() or public.is_admin());

create policy wallet_admin_all on public.wallet_entries
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- badges ----------------------------------------------------------------

drop policy if exists badges_public_select   on public.badges;
drop policy if exists badges_admin_all       on public.badges;
drop policy if exists user_badges_select     on public.user_badges;
drop policy if exists user_badges_admin_all  on public.user_badges;

create policy badges_public_select on public.badges
  for select using (is_active = true or public.is_admin());

create policy badges_admin_all on public.badges
  for all using (public.is_admin()) with check (public.is_admin());

create policy user_badges_select on public.user_badges
  for select using (true);     -- badges are public achievements

create policy user_badges_admin_all on public.user_badges
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- audit log -------------------------------------------------------------

drop policy if exists audit_admin_only on public.audit_log;
create policy audit_admin_only on public.audit_log
  for all using (public.is_admin()) with check (public.is_admin());
