-- ============================================================================
-- Creative Wings — Storage buckets + policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars',     'avatars',     true),
  ('logos',       'logos',       true),
  ('banners',     'banners',     true),
  ('artworks',    'artworks',    true),
  ('certificates','certificates',false)
on conflict (id) do nothing;

-- ---- avatars ---------------------------------------------------------------
-- Path convention: {user_id}/{filename}
drop policy if exists "avatars: public read"  on storage.objects;
drop policy if exists "avatars: owner write"  on storage.objects;
drop policy if exists "avatars: owner update" on storage.objects;
drop policy if exists "avatars: owner delete" on storage.objects;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- logos / banners (organizer-owned) -------------------------------------
-- Path convention: {organizer_id}/{filename}
do $$
declare b text;
begin
  foreach b in array array['logos','banners']
  loop
    execute format($pol$
      drop policy if exists "%1$s: public read"  on storage.objects;
      drop policy if exists "%1$s: owner write"  on storage.objects;
      drop policy if exists "%1$s: owner update" on storage.objects;
      drop policy if exists "%1$s: owner delete" on storage.objects;

      create policy "%1$s: public read"
        on storage.objects for select
        using (bucket_id = '%1$s');

      create policy "%1$s: owner write"
        on storage.objects for insert
        with check (
          bucket_id = '%1$s'
          and exists (
            select 1 from public.organizers o
            where o.owner_id = auth.uid()
              and o.id::text = (storage.foldername(name))[1]
          )
        );

      create policy "%1$s: owner update"
        on storage.objects for update
        using (
          bucket_id = '%1$s'
          and exists (
            select 1 from public.organizers o
            where o.owner_id = auth.uid()
              and o.id::text = (storage.foldername(name))[1]
          )
        );

      create policy "%1$s: owner delete"
        on storage.objects for delete
        using (
          bucket_id = '%1$s'
          and exists (
            select 1 from public.organizers o
            where o.owner_id = auth.uid()
              and o.id::text = (storage.foldername(name))[1]
          )
        );
    $pol$, b);
  end loop;
end $$;

-- ---- artworks (per submission) ---------------------------------------------
-- Path convention: {campaign_id}/{user_id}/{filename}
drop policy if exists "artworks: public read"   on storage.objects;
drop policy if exists "artworks: owner write"   on storage.objects;
drop policy if exists "artworks: owner update"  on storage.objects;
drop policy if exists "artworks: owner delete"  on storage.objects;

create policy "artworks: public read"
  on storage.objects for select
  using (bucket_id = 'artworks');

create policy "artworks: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "artworks: owner update"
  on storage.objects for update
  using (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy "artworks: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- ---- certificates (private) ------------------------------------------------
-- Path convention: {user_id}/{filename}; only owner + admin can read.
drop policy if exists "certificates: owner read" on storage.objects;
drop policy if exists "certificates: admin all"  on storage.objects;

create policy "certificates: owner read"
  on storage.objects for select
  using (
    bucket_id = 'certificates'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "certificates: admin all"
  on storage.objects for all
  using (
    bucket_id = 'certificates' and public.is_admin()
  )
  with check (
    bucket_id = 'certificates' and public.is_admin()
  );
