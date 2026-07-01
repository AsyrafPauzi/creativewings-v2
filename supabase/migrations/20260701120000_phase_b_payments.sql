-- Phase B: CommercePay payments, wallet withdrawals, organizer bank accounts

do $$ begin
  create type cw_payment_order_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cw_withdrawal_status as enum ('pending', 'approved', 'rejected', 'paid');
exception when duplicate_object then null; end $$;

create table if not exists public.platform_payment_settings (
  id                text primary key default 'default',
  provider          text not null default 'commercepay',
  enabled           boolean not null default false,
  test_mode         boolean not null default true,
  test_tenant_id    text,
  test_secret_key   text,
  test_currency     text not null default 'MYR',
  live_tenant_id    text,
  live_secret_key   text,
  live_currency     text not null default 'MYR',
  updated_at        timestamptz not null default now(),
  updated_by        uuid references public.profiles(id) on delete set null
);

insert into public.platform_payment_settings (id, enabled, test_mode)
values ('default', false, true)
on conflict (id) do nothing;

create table if not exists public.payment_orders (
  id                    uuid primary key default gen_random_uuid(),
  reference_code        text not null unique,
  submission_id         uuid not null references public.submissions(id) on delete cascade,
  campaign_id           uuid not null references public.campaigns(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  amount_cents          integer not null,
  currency              text not null default 'MYR',
  status                cw_payment_order_status not null default 'pending',
  provider              text not null default 'commercepay',
  transaction_number    text,
  sponsor_coupon_id     uuid references public.sponsor_coupons(id) on delete set null,
  ip_address            text,
  user_agent            text,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists payment_orders_submission_idx on public.payment_orders(submission_id);
create index if not exists payment_orders_user_idx on public.payment_orders(user_id);
create index if not exists payment_orders_reference_idx on public.payment_orders(reference_code);

create table if not exists public.organizer_bank_accounts (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.organizers(id) on delete cascade unique,
  bank_name       text not null,
  account_name    text not null,
  account_number  text not null,
  swift_code      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.withdrawal_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  amount          numeric(12,2) not null,
  currency        text not null default 'MYR',
  status          cw_withdrawal_status not null default 'pending',
  bank_name       text not null,
  account_name    text not null,
  account_number  text not null,
  admin_note      text,
  processed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists withdrawal_requests_user_idx on public.withdrawal_requests(user_id);
create index if not exists withdrawal_requests_status_idx on public.withdrawal_requests(status);

alter table public.submissions
  add column if not exists payment_order_id uuid references public.payment_orders(id) on delete set null,
  add column if not exists payment_provider text,
  add column if not exists payment_transaction_number text;

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['payment_orders', 'organizer_bank_accounts', 'platform_payment_settings']
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at
         before update on public.%I
         for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- RLS
alter table public.platform_payment_settings enable row level security;
alter table public.payment_orders enable row level security;
alter table public.organizer_bank_accounts enable row level security;
alter table public.withdrawal_requests enable row level security;

-- platform_payment_settings: no client policies (service role / server only)

drop policy if exists payment_orders_owner_select on public.payment_orders;
create policy payment_orders_owner_select on public.payment_orders
  for select using (auth.uid() = user_id);

drop policy if exists payment_orders_owner_insert on public.payment_orders;
create policy payment_orders_owner_insert on public.payment_orders
  for insert with check (auth.uid() = user_id);

drop policy if exists organizer_bank_owner_all on public.organizer_bank_accounts;
create policy organizer_bank_owner_all on public.organizer_bank_accounts
  for all using (
    exists (
      select 1 from public.organizers o
      where o.id = organizer_id and o.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizers o
      where o.id = organizer_id and o.owner_id = auth.uid()
    )
  );

drop policy if exists withdrawal_owner_select on public.withdrawal_requests;
create policy withdrawal_owner_select on public.withdrawal_requests
  for select using (auth.uid() = user_id);

drop policy if exists withdrawal_owner_insert on public.withdrawal_requests;
create policy withdrawal_owner_insert on public.withdrawal_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists withdrawal_admin_all on public.withdrawal_requests;
create policy withdrawal_admin_all on public.withdrawal_requests
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
