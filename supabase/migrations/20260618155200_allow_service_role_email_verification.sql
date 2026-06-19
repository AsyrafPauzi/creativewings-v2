-- Allow trusted server-side email verification updates while keeping the
-- verification fields protected from browser/client updates.

create or replace function public.protect_profile_email_verification_fields()
returns trigger
language plpgsql
as $$
declare
  jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    auth.role()::text,
    ''
  );
begin
  if (
    old.email_verified_at is distinct from new.email_verified_at
    or old.email_verification_sent_at is distinct from new.email_verification_sent_at
  ) and jwt_role <> 'service_role'
    and current_user not in ('postgres', 'supabase_admin', 'service_role')
  then
    raise exception 'email verification fields are server-managed';
  end if;

  return new;
end $$;
