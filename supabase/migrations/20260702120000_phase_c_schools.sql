-- Phase C: school upload codes, claim reservation policy, guardian email on submissions

create table if not exists public.submission_code_counters (
  campaign_id   uuid not null references public.campaigns(id) on delete cascade,
  month_code    text not null,
  last_seq      integer not null default 0,
  primary key (campaign_id, month_code)
);

create or replace function public.next_submission_seq(p_campaign_id uuid, p_month_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  insert into public.submission_code_counters (campaign_id, month_code, last_seq)
  values (p_campaign_id, p_month_code, 1)
  on conflict (campaign_id, month_code)
  do update set last_seq = public.submission_code_counters.last_seq + 1
  returning last_seq into v_seq;
  return v_seq;
end;
$$;

alter table public.submissions
  add column if not exists guardian_email text;

drop policy if exists submissions_claim_reserve on public.submissions;
create policy submissions_claim_reserve on public.submissions
  for update using (
    status = 'staged'
    and moderation_status = 'approved'
    and (
      claim_reserved_by is null
      or claim_reserved_by = auth.uid()
      or claim_reserved_until < now()
    )
  )
  with check (
    contestant_id = auth.uid()
    and status in ('staged', 'claimed')
  );
