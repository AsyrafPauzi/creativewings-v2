# Creative Wings — WordPress Plugin → Next.js Migration Checklist

**Source plugin:** `creativewings-yibon` (v11.0.x, WooCommerce)  
**Target app:** `New_Creativewings` (Next.js 15 + Supabase)  
**Last audited:** July 2026

Use this file to track parity with the original plugin. Legend:

- `[x]` **Done** — implemented and wired to Supabase
- `[~]` **Partial** — exists but incomplete or display-only
- `[ ]` **Missing** — not built yet (schema may still exist)

---

## Summary

| Area | Done | Partial | Missing |
|------|------|---------|---------|
| Auth & roles | 6 | 4 | 2 |
| Campaigns | 8 | 12 | 9 |
| Submissions | 3 | 5 | 8 |
| School flow | 0 | 1 | 7 |
| Commerce & wallet | 0 | 2 | 6 |
| Judging & voting | 1 | 2 | 5 |
| Certificates | 0 | 1 | 5 |
| Design submission | 0 | 0 | 6 |
| Badges | 1 | 2 | 4 |
| Reports & exports | 0 | 1 | 6 |
| Public site | 10 | 8 | 5 |
| Dashboard | 4 | 10 | 6 |
| Email | 1 | 1 | 6 |
| Admin & ops | 2 | 4 | 6 |

**Rough parity:** ~25% done, ~35% partial, ~40% missing.

---

## Phase A — Fix “looks done but hollow” (recommended first)

- [ ] Campaign editor: prizes repeater (`prizes` table)
- [ ] Campaign editor: FAQ repeater (`faq_items` table)
- [ ] Campaign editor: age brackets (`age_brackets` table)
- [ ] Campaign editor: custom participant fields (`custom_fields` table)
- [ ] Campaign editor: banner / hero image upload (`banners` bucket)
- [ ] Campaign editor: `multi_min` / `multi_max` in form
- [ ] Public campaign page: judging criteria from DB (not hardcoded defaults)
- [ ] Submission form: render custom fields from campaign
- [ ] Submission form: file upload to Storage (`artworks` bucket)
- [ ] Organizer profile: logo / banner upload (`logos`, `banners` buckets)
- [ ] Settings: pre-fill phone, city, country from profile
- [ ] Dashboard overview: real badge count + wallet balance for contestants
- [ ] Fix broken `/winners` link on home (page or remove link)

---

## Phase B — Payments & wallet

- [ ] Stripe checkout for `entry_fee`
- [ ] Set `paid_at` + `stripe_payment_intent` on successful payment
- [ ] Submission status flow: `claimed` → `paid`
- [ ] Wallet ledger writes on payment / refund
- [ ] Sponsor coupon redemption (`sponsor_coupons`)
- [ ] Withdrawal requests (plugin: `cw_withdrawal` CPT)
- [ ] Bank details management for organizers
- [ ] Wallet CSV export
- [ ] Online event access email after purchase

---

## Phase C — School upload & claim pipeline

- [ ] Schools CRUD per campaign (`schools` table)
- [ ] Upload token generation (`upload_tokens`, 90-day expiry)
- [ ] Public route `/cw-school-upload/[token]`
- [ ] PIC form: submission code, student name, dynamic upload fields
- [ ] Staged submission insert (`status: staged`)
- [ ] Submission code format `CCCMMSSSSEQ`
- [ ] Parent pre-link code (`guardian_links` / pending parent flow)
- [ ] Email parent when artwork ready for claim
- [ ] Claim flow: lookup → confirm → checkout
- [ ] Claim reservation lock (`claim_reserved_by`, `claim_reserved_until`)
- [ ] School-scoped 100% sponsor coupons sync + validation
- [ ] Bulk submission codes (HTML / CSV / PDF)
- [ ] Bulk QR sheet for schools
- [ ] Export staged submissions CSV
- [ ] Dashboard schools page (replace `ComingSoon` stub)

---

## Phase D — Engagement (voting, badges, certificates)

- [ ] Public voting gallery on campaign detail
- [ ] Vote tracking (`public_votes`, IP / user limits)
- [ ] Winner status + rank on submissions (`shortlisted`, `winner`)
- [ ] Judge score + comment (extend review UI)
- [ ] Badges auto-award engine (`user_badges` writes)
- [ ] Badge rule types (entries, certs, votes, tenure, etc.)
- [ ] Manual badge award/revoke (admin)
- [ ] Badge earn toast + email opt-in
- [ ] Certificate template upload + layout (x, y, font)
- [ ] Certificate PDF/image generation (`certificates` bucket)
- [ ] Certificate download for participants
- [ ] Certificate batch email send
- [ ] Certificate-ready email trigger

---

## Phase E — Business tools & admin

- [ ] Reports dashboard (replace `ComingSoon` stub)
- [ ] Export CSV roster
- [ ] Export XLSX (multi-sheet)
- [ ] Export PDF report
- [ ] Revenue / participant time-series charts
- [ ] Campaign JSON import (schema v1)
- [ ] Admin campaign approval queue (`pending` → `published`)
- [ ] Admin user role / `is_admin` promote UI
- [ ] Campaign ownership transfer (admin)
- [ ] REST API: `/campaigns/{id}/submissions`, `/kpis`, webhook auth
- [ ] Audit log writes from app actions
- [ ] Sync Center equivalents (badge re-eval, token sync, coupon sync)

---

## Phase F — Design submission (print-on-product)

- [ ] Campaign design mode config (variants, print area, dimensions)
- [ ] Design artwork PNG upload with dimension validation
- [ ] Source file upload (.ai, .pdf, .svg, .eps)
- [ ] Canvas mockup compositor at checkout/submit
- [ ] Variant picker (color/size swatches)
- [ ] Download mockup PNG post-submission
- [ ] Design preview in organizer review UI

---

## 1. Auth, roles & onboarding

| Item | Status | Notes |
|------|--------|-------|
| Sign up (name, email, password, birthdate) | [x] | `sign-up-form.tsx` |
| PDPA consent at signup | [x] | `pdpa_consents` |
| Login | [x] | |
| Forgot / reset password | [x] | |
| Magic link sign-in | [~] | Works; no resend on sent page |
| Google / Facebook OAuth | [~] | Skips DOB, guardian, PDPA |
| Role pick (contestant / creator / organizer) | [x] | `/onboarding` |
| Profile completion gate | [x] | Middleware + `onboarded_at` |
| Email verification (Resend) | [~] | Built; optional, not enforced |
| Guardian links for minors | [~] | Saved; no invite email |
| Business application + admin approve | [ ] | Plugin requires approval; new app is instant |
| Rate limiting on registration | [ ] | Plugin: 10/hr |
| Honeypot anti-spam | [ ] | |
| OAuth/callback errors shown in UI | [ ] | |
| Password strength enforced server-side | [ ] | UI stricter than server |

---

## 2. Campaigns (organizer)

### Basics — done

- [x] Title, description, slug
- [x] Type: competition / activity / workshop
- [x] Status: draft / pending / published / closed
- [x] Entry fee + currency (display; not charged yet)
- [x] Dates: submission start, deadline, review, event
- [x] Event mode: online / physical / hybrid
- [x] Location + online link
- [x] Sub-category selection
- [x] SDG goals (1–17)
- [x] KPI progress bar (target, label, toggle)
- [x] Publish / close actions

### Feature toggles — saved, not all enforced

- [x] `enable_voting` (saved only)
- [x] `enable_certificate` (saved only)
- [x] `enable_school_sponsors` (saved only)
- [x] `enable_design` (saved only)
- [x] `enable_age_brackets` (saved only)
- [x] `enable_addons` (saved only)
- [x] `enable_checkout_message` + label + required
- [x] `allow_multiple_submissions`
- [x] `judging_criteria` field in DB (not used on public page)

### Child data — schema only, no editor UI

- [ ] Prizes repeater
- [ ] FAQ repeater
- [ ] Age brackets repeater
- [ ] Custom participant fields builder
- [ ] Add-ons (paid extras) repeater
- [ ] Downloadable template files
- [ ] Banner / gallery images
- [ ] Design variants + print area config

### Other campaign features

- [~] `multi_min` / `multi_max` — saved in actions, not in form
- [~] `min_participants` / `max_participants` — limited form support
- [ ] Campaign serial code (3-digit for submission codes)
- [ ] Admin pending approval workflow UI
- [ ] Campaign JSON import
- [ ] Bulk submission codes + QR
- [ ] One entry per user enforcement
- [ ] Campaign visibility (hidden/visible)
- [ ] Public submissions gallery toggle
- [ ] Talk speaker / talk type fields
- [ ] Delete / archive campaign UI
- [ ] 5-step wizard UX (plugin parity)

---

## 3. Submissions & participant flow

| Item | Status | Notes |
|------|--------|-------|
| Direct submit page `/campaigns/[slug]/submit` | [~] | Inserts row; no payment |
| Artwork via external URL | [~] | Paste link only |
| Artwork file upload | [ ] | Storage `artworks` bucket unused |
| Custom fields on submit form | [ ] | |
| Multi-participant per order | [ ] | |
| Age bracket selection | [~] | Manual if enabled |
| Age bracket auto-assign from DOB | [ ] | |
| Checkout message field | [x] | |
| Payment before entry | [ ] | |
| One entry per user guard | [ ] | |
| Save / bookmark campaigns | [ ] | Plugin: `saved_competitions` |
| Submission code generation | [ ] | |
| Status: staged | [ ] | School flow |
| Status: claimed | [x] | Default on direct submit |
| Status: paid | [ ] | |
| Status: shortlisted / winner | [ ] | |
| Contestant submission detail page | [ ] | List only today |
| Public submissions gallery | [ ] | |
| Delete submission (organizer) | [ ] | |

---

## 4. School / PIC workflow

| Item | Status | Notes |
|------|--------|-------|
| Schools list per campaign | [ ] | Stub `ComingSoon` |
| Upload tokens | [ ] | Table exists |
| `/cw-school-upload/[token]` route | [ ] | |
| PIC upload form + camera | [ ] | |
| Staged row in DB | [ ] | |
| Code lookup AJAX | [ ] | |
| Parent claim flow | [ ] | |
| Claim reservation lock | [ ] | Schema only |
| Sponsor coupons (100% off) | [ ] | Schema only |
| Moderation before claim visible | [~] | Moderation on direct submit only |
| Email: artwork ready for claim | [ ] | |
| Email: submission linked | [ ] | |
| Bulk codes / QR for schools | [ ] | |

---

## 5. Commerce & wallet

| Item | Status | Notes |
|------|--------|-------|
| Cart + checkout | [ ] | Was WooCommerce |
| Stripe integration | [ ] | `stripe_payment_intent` in schema |
| Free checkout with coupon | [ ] | |
| Wallet balance display | [~] | Read-only |
| Wallet ledger entries | [~] | Read-only; nothing writes |
| Withdrawal requests | [ ] | |
| Bank details for organizers | [ ] | |
| Wallet CSV export | [ ] | |

---

## 6. Judging, voting & winners

| Item | Status | Notes |
|------|--------|-------|
| Organizer approve / reject / pending | [x] | Per-submission review |
| Judge score + note | [~] | Score field exists |
| Winner rank (1st / 2nd / 3rd / mention) | [ ] | |
| Public voting gallery | [ ] | Toggle saved only |
| Vote count + voter tracking | [ ] | `public_votes` table unused |
| Manage entries dashboard (full) | [~] | Basic review only |
| Revenue / participant charts | [ ] | Plugin: Chart.js |
| Public leaderboard page | [ ] | Not in plugin either |
| Public winners page | [ ] | Home links `/winners` — 404 |

---

## 7. Certificates

| Item | Status | Notes |
|------|--------|-------|
| Enable certificate toggle | [x] | Saved on campaign |
| Template upload + layout | [ ] | |
| Generate certificate image/PDF | [ ] | |
| Participant download | [ ] | |
| Batch email send | [ ] | |
| Auto-issue on score / deadline | [ ] | |
| Certificate-ready email | [ ] | |

---

## 8. Design submission

| Item | Status | Notes |
|------|--------|-------|
| Enable design toggle | [x] | Saved only |
| Product variants (casing images) | [ ] | |
| Print area crop config | [ ] | |
| PNG dimension validation | [ ] | |
| Canvas mockup compositor | [ ] | Plugin: `cw-design-preview.js` |
| Source file upload | [ ] | |
| Download mockup after submit | [ ] | |

---

## 9. Badges

| Item | Status | Notes |
|------|--------|-------|
| Badge catalog display | [x] | `/dashboard/badges` |
| Earned vs not-earned UI | [x] | |
| Default badge seed | [~] | 5 in `seed.sql`; plugin has 25+ |
| Auto-award rule engine | [ ] | |
| Tiered badges (bronze/silver/gold) | [ ] | Schema supports `tier` |
| Manual award/revoke (admin) | [ ] | |
| Award toast on earn | [ ] | |
| Badge email opt-in | [ ] | |
| Bulk re-evaluate all users | [ ] | |

---

## 10. Reports & exports

| Item | Status | Notes |
|------|--------|-------|
| Business KPI overview | [~] | Basic stats on dashboard |
| Reports page | [ ] | `ComingSoon` stub |
| CSV export | [ ] | |
| XLSX export | [ ] | |
| PDF export | [ ] | |
| Staged submissions in reports | [ ] | |
| Revenue time series | [ ] | |
| REST API (submissions, KPIs) | [ ] | |

---

## 11. Public site

| Route / feature | Status | Notes |
|-----------------|--------|-------|
| `/` landing | [~] | Campaign grid real; marketing bands static |
| `/campaigns` directory | [x] | Filters: type, SDG |
| `/campaigns/[slug]` detail | [~] | Missing voting, gallery, DB judging criteria |
| `/campaigns/[slug]/submit` | [~] | Basic submit only |
| `/organizers` + `/organizer/[slug]` | [x] | |
| `/creators` + `/profile/[slug]` | [~] | Follow/save/message are UI-only |
| `/competitions`, `/activities`, `/workshops`, `/programmes` | [x] | |
| `/about` | [x] | Static |
| `/contact` | [~] | Form has no backend |
| `/press`, `/brand-story` | [~] | Static / fictional content |
| `/pdpa` + `/legal/*` | [x] | |
| `/sustainable-development-goals` | [~] | Static stats |
| `/winners` | [ ] | Linked from home — page missing |
| Home filter chips (`?sort=`, `?prize=`, etc.) | [ ] | Not implemented on `/campaigns` |
| Save campaign bookmark | [ ] | |
| Site-wide total prize money | [ ] | |
| Newsletter signup forms | [ ] | Multiple pages; no handler |

---

## 12. Dashboard (by role)

### All roles

- [x] Role-aware sidebar navigation
- [~] Overview (`/dashboard`) — contestant metrics hardcoded
- [~] Settings (`/dashboard/settings`) — missing field pre-fill
- [x] Privacy & data (`/dashboard/privacy`) — export, consent, deletion
- [ ] Mobile dashboard navigation

### Contestant

- [x] My submissions list
- [~] Badges page (display only)
- [~] Wallet page (read-only)
- [x] Browse campaigns (nav link)
- [ ] Link submission / claim tab
- [ ] Saved campaigns

### Creator

- [x] Portfolio CRUD (`/dashboard/portfolio/*`)
- [x] Public profile at `/profile/[slug]`
- [~] Badges, wallet (same as contestant)
- [ ] Profile/cover image upload to Storage

### Organizer

- [~] Campaigns list + create/edit
- [~] Per-campaign submissions list
- [~] Submission review (approve/reject/score)
- [~] Organization profile (`/dashboard/organizer`)
- [ ] Schools & coupons page
- [ ] Reports page
- [~] Wallet (read-only)
- [ ] Manage entries / judging (full plugin parity)
- [ ] Logo / banner upload for org page

### Admin (`is_admin`)

- [~] Admin overview (counts + audit log read)
- [~] Users list (read-only)
- [~] Moderation queue (list + link to review)
- [ ] Promote/demote admin in UI
- [ ] Change user roles in UI
- [ ] Campaign approval queue
- [ ] Badge Manager
- [ ] Sync Center tools

---

## 13. Email notifications

| Trigger | Status | Notes |
|---------|--------|-------|
| Email verification | [~] | Resend; signup only |
| Password reset | [x] | Supabase |
| Registration complete | [ ] | |
| Artwork ready for claim | [ ] | |
| Submission linked (claimed) | [ ] | |
| Certificate ready | [ ] | |
| Online event access link | [ ] | |
| Badge unlocked | [ ] | |
| Business application approved/rejected | [ ] | N/A — no application flow |
| New withdrawal request (admin) | [ ] | |
| Guardian invite | [ ] | |

---

## 14. Database & storage

### Tables wired to UI

- [x] `profiles`
- [x] `organizers`
- [x] `creators`
- [x] `campaigns`
- [x] `submissions` (basic)
- [x] `portfolio_projects` + `portfolio_project_assets`
- [x] `pdpa_*` stack
- [x] `email_verification_tokens`
- [x] `guardian_links` (write at signup only)
- [x] `sub_categories` (read)
- [~] `badges` + `user_badges` (read only)
- [~] `wallet_entries` (read only)
- [~] `audit_log` (read only)
- [~] `age_brackets`, `prizes`, `faq_items` (read on public; no editor)
- [~] `sponsor_slots` (partial — campaign detail only)

### Tables schema-only (no app logic)

- [ ] `schools`
- [ ] `upload_tokens`
- [ ] `sponsor_coupons`
- [ ] `custom_fields`
- [ ] `public_votes`

### Storage buckets

| Bucket | Status |
|--------|--------|
| `pdpa-exports` | [x] Wired |
| `avatars` | [ ] |
| `logos` | [ ] |
| `banners` | [ ] |
| `artworks` | [ ] |
| `certificates` | [ ] |

---

## 15. New in Next.js (not in original plugin)

- [x] Full PDPA stack (export, consent audit, deletion scheduling, policy versions)
- [x] Workshop campaign type
- [x] Sponsor ad slots (`sponsor_slots`)
- [x] Hybrid event mode
- [x] Dedicated marketing pages (press, brand story, SDG education)
- [x] Row Level Security (Supabase RLS)
- [x] Modern App Router architecture

---

## 16. Suggested review order (verify one by one)

1. [ ] Sign up → onboarding → dashboard
2. [ ] Organizer: create campaign → check public `/campaigns/[slug]` (prizes/FAQ/brackets?)
3. [ ] Contestant: submit entry (payment? upload? custom fields?)
4. [ ] Organizer: review submission
5. [ ] Creator: portfolio → public `/profile/[slug]`
6. [ ] Contestant: badges + wallet (any real data?)
7. [ ] Admin: moderation + users
8. [ ] Privacy page (reference for “fully wired”)
9. [ ] Home + contact + press (forms work?)
10. [ ] School upload + claim (entire flow — should fail today)

---

## 17. Plugin files reference (for deep dives)

| Feature | Plugin file |
|---------|-------------|
| Auth | `includes/class-cw-auth.php` |
| Onboarding | `includes/class-cw-onboarding.php` |
| Campaign wizard | `includes/business/class-cw-business-form.php` |
| Campaign save | `includes/business/class-cw-campaign-persistence.php` |
| Shop / checkout | `includes/class-cw-shop.php`, `class-cw-checkout.php` |
| School upload | `includes/class-cw-school-upload.php` |
| Claim flow | `includes/class-cw-claim-flow.php` |
| Staged submissions | `includes/class-cw-staged-submissions.php` |
| Sponsor coupons | `includes/class-cw-sponsor-coupons.php` |
| Moderation | `includes/class-cw-moderation.php` |
| Certificates | `includes/class-cw-certificate.php` |
| Design submission | `includes/class-cw-design-submission.php` |
| Badges engine | `includes/badges/class-cw-badges-engine.php` |
| Reports | `includes/business/class-cw-business-reports.php` |
| Report export | `includes/business/class-cw-report-export.php` |
| Wallet | `includes/class-cw-wallet.php` |
| Public event detail | `includes/class-cw-shortcodes.php` |
| Business dashboard | `includes/dashboard/class-cw-dashboard-business.php` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-01 | Initial audit vs `creativewings-yibon` v11.0.x |
