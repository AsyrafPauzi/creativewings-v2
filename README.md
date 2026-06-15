# Creative Wings

A national platform for art competitions, school activities and creator portfolios — the spiritual successor to the original `creativewings-yibon` WordPress plugin, rebuilt as a Next.js + Supabase application designed to be deployed on Vercel.

## Stack

| Layer    | Tool             | Role                                       |
|----------|------------------|--------------------------------------------|
| Frontend | Next.js 15 (App Router) + Tailwind, on Vercel | UI + dashboard                   |
| Backend  | Supabase         | Postgres database, Auth, Storage           |
| Logic    | Supabase RLS + Next.js Server Actions / Route Handlers | Lightweight rules         |

## What's in the box

### Public site (`src/app/(public)/...`)
- Landing page with hero + featured campaigns + value props
- `/campaigns` — campaign directory with filters
- `/campaigns/[slug]` — full campaign detail page (banner, prizes, FAQ, age brackets, SDG goals, judging criteria)
- `/campaigns/[slug]/submit` — submission flow
- `/organizers` + `/organizer/[slug]` — public organisation directory + profile
- `/creators` + `/profile/[slug]` — public creator directory + portfolio
- `/about` + `/legal/terms` + `/legal/privacy`

### Auth (`src/app/(auth)/...`)
- Sign up (with role intent), sign in, forgot password, reset password
- Email verification via Supabase callback at `/auth/callback`
- Server-side `signOutAction`

### Onboarding (`src/app/onboarding/...`)
- Pick role: contestant / creator / business
- Complete profile with role-specific fields
- Auto-creates the matching `organizers` or `creators` row

### Dashboard (`src/app/dashboard/...`)
- Role-aware sidebar (`src/components/dashboard/dashboard-shell.tsx`)
- Overview tailored to role
- **Business**: campaigns CRUD with every CW field — basics, schedule, pricing, KPI progress, toggles, checkout message, judging, SDGs — plus per-campaign submissions list + review tool
- **Contestant / Creator**: my submissions, badges, wallet
- **All**: settings, portfolio (creator), wallet
- **Admin**: user list + admin dashboard hub (gated by `profiles.is_admin`)

### Database

Three migrations under `supabase/migrations/`:

1. `20260615120000_init.sql` — schema (profiles, organizers, creators, campaigns and all child tables, submissions, wallet, badges, audit log, common triggers)
2. `20260615120100_rls.sql` — Row Level Security policies per role
3. `20260615120200_storage.sql` — storage buckets (`avatars`, `logos`, `banners`, `artworks`, `certificates`) + their policies

Plus `supabase/seed.sql` with default badges.

## Local development

### Prerequisites
- Node 18.18+ (project tested on Node 25)
- A Supabase project (free tier works) — or the Supabase CLI for local dev
- Optional: `supabase` CLI installed (`brew install supabase/tap/supabase`)

### Setup

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
```

### Database setup

**Option A — using the Supabase dashboard (easiest)**

1. Create a new project at https://supabase.com/dashboard.
2. Open `SQL Editor` and paste each file from `supabase/migrations/` in order, then run.
3. Paste `supabase/seed.sql` and run to seed the badge catalogue.

**Option B — using the Supabase CLI (recommended)**

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push      # applies every migration in supabase/migrations
```

### Type generation

Once your real schema is live in Supabase:

```bash
SUPABASE_PROJECT_ID=YOUR_PROJECT_REF npm run db:gen-types
```

This overwrites `src/lib/supabase/database.types.ts` with the precise generated types. The committed file is a hand-written stub so the app type-checks before you wire up a real project.

## Roles & permissions

| Role         | Can do                                                   |
|--------------|----------------------------------------------------------|
| `contestant` | Submit entries, view their submissions, earn badges      |
| `creator`    | Same as contestant + public `/profile/[slug]` portfolio  |
| `business`   | Run organisation page + create/edit campaigns + moderate |
| `admin`      | Everything; bypass RLS via `is_admin` predicate          |

Promote a user to admin from SQL:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Create a new Vercel project, import the repo.
3. Add the same env vars from `.env.example` to the Vercel project (`Production` + `Preview`).
4. In your Supabase project, add `https://YOUR-VERCEL-URL.vercel.app/auth/callback` and `https://YOUR-VERCEL-URL.vercel.app/reset-password` to the *Authentication → URL Configuration → Redirect URLs* list.
5. Deploy.

## Roadmap (what's deliberately deferred)

The legacy plugin is enormous; the items below are part of the data model and roadmap but not yet wired into UI/business logic:

- Payments / checkout via Stripe (replaces WooCommerce checkout) — schema has `entry_fee`, `currency`, `stripe_payment_intent`
- School bulk upload portal (`/cw-school-upload/[token]`) — schema has `upload_tokens` + `schools` + `sponsor_coupons`
- Claim flow for school-uploaded staged submissions — schema has `staged` status + reservation lock
- Certificate PDF generation — schema has `enable_certificate` + `certificate_template_url` + `certificates` storage bucket
- Badges engine (auto-award on triggers) — schema has `badges` + `user_badges`
- Moderation queue UI (rows already moderated per-submission)
- Reports / PDF + Excel exports
- Email notifications via Resend
- Design Submission mockup compositor
- Public voting + leaderboards

Each of these has a place to live in the schema and a stub page in the dashboard (`ComingSoon` component) so the surface area is ready when you build them out.

## Project layout

```
src/
  app/
    (auth)/            sign in, sign up, forgot/reset password
    (public)/          marketing site + campaign/organizer/creator routes
    auth/callback/     OAuth/magic link return
    dashboard/         signed-in role-aware app
    onboarding/        role picker + profile completion
    layout.tsx         root layout (fonts, toaster)
  components/
    campaigns/         shared campaign UI (form, etc.)
    dashboard/         shell + stubs
    site/              public header + footer
    ui/                base primitives (button, card, input…)
  lib/
    auth.ts            requireUser/requireRole helpers
    supabase/          client, server, middleware, generated types
    utils.ts           formatters + SDG metadata
  middleware.ts        cookie refresh + auth gating
supabase/
  migrations/          schema, RLS, storage
  seed.sql             default badges
```

## License

Proprietary — © Yibon Mag Enterprise.
