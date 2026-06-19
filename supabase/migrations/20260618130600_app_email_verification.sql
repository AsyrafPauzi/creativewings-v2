-- ============================================================================
-- App-level, non-blocking email verification
-- ============================================================================

alter table public.profiles
  add column if not exists email_verified_at timestamptz,
  add column if not exists email_verification_sent_at timestamptz;

create index if not exists profiles_email_verified_at_idx
  on public.profiles(email_verified_at);

create table if not exists public.email_verification_tokens (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists email_verification_tokens_expires_at_idx
  on public.email_verification_tokens(expires_at);

alter table public.email_verification_tokens enable row level security;

drop policy if exists email_verification_tokens_admin_all on public.email_verification_tokens;
create policy email_verification_tokens_admin_all on public.email_verification_tokens
  for all using (public.is_admin())
  with check (public.is_admin());

create or replace function public.protect_profile_email_verification_fields()
returns trigger
language plpgsql
as $$
declare
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if (
    old.email_verified_at is distinct from new.email_verified_at
    or old.email_verification_sent_at is distinct from new.email_verification_sent_at
  ) and jwt_role <> 'service_role'
    and current_user not in ('postgres', 'supabase_admin')
  then
    raise exception 'email verification fields are server-managed';
  end if;

  return new;
end $$;

drop trigger if exists trg_profiles_protect_email_verification_fields on public.profiles;
create trigger trg_profiles_protect_email_verification_fields
  before update of email_verified_at, email_verification_sent_at on public.profiles
  for each row execute function public.protect_profile_email_verification_fields();
