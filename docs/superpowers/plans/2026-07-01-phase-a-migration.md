# Phase A Migration — Implementation Plan (13 items, one pass)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all 13 Phase A checklist items so campaigns, public pages, submissions, organizer profiles, settings, and dashboard reflect real Supabase data — not hollow UI.

**Architecture:** Add a shared Storage upload helper and a “sync child rows” server-action pattern (delete-by-campaign + insert). Extend the existing `CampaignForm` with repeater sections and image uploads. Wire public read paths that already fetch `prizes`/`faq_items`/`age_brackets` to also use `judging_criteria` and `custom_fields`. Keep dashboard changes minimal (query existing tables).

**Tech Stack:** Next.js 15 App Router, Supabase (Postgres + Storage + RLS), server actions, existing `database.types.ts` rows.

**Checklist reference:** `docs/MIGRATION-CHECKLIST.md` lines 38–52

---

## File map (create / modify)

| File | Responsibility |
|------|----------------|
| `src/lib/storage/upload.ts` | **Create** — bucket upload + public URL helper |
| `src/lib/campaigns/parse-judging-criteria.ts` | **Create** — parse DB text → criteria table rows |
| `src/lib/campaigns/sync-children.ts` | **Create** — sync prizes/faq/age_brackets/custom_fields |
| `src/components/campaigns/repeater-field.tsx` | **Create** — generic add/remove/sort repeater UI |
| `src/components/campaigns/campaign-children-form.tsx` | **Create** — prizes, FAQ, brackets, custom fields |
| `src/components/campaigns/campaign-media-upload.tsx` | **Create** — banner + hero file inputs |
| `src/components/campaigns/custom-field-renderer.tsx` | **Create** — render custom fields on submit |
| `src/components/dashboard/image-upload-field.tsx` | **Create** — reusable logo/banner upload |
| `src/app/dashboard/campaigns/children-actions.ts` | **Create** — save child tables + media URLs |
| `src/components/campaigns/campaign-form.tsx` | **Modify** — multi_min/max, media section |
| `src/app/dashboard/campaigns/[id]/page.tsx` | **Modify** — load children, render children form |
| `src/app/(public)/campaigns/[slug]/page.tsx` | **Modify** — DB judging criteria |
| `src/components/campaigns/detail-sections.tsx` | **Modify** — prose criteria fallback |
| `src/app/(public)/campaigns/[slug]/submit/page.tsx` | **Modify** — load custom_fields |
| `src/app/(public)/campaigns/[slug]/submit/submit-entry-form.tsx` | **Modify** — custom fields + file input |
| `src/app/(public)/campaigns/[slug]/submit/actions.ts` | **Modify** — field_data + artwork upload |
| `src/app/dashboard/organizer/page.tsx` | **Modify** — logo/banner upload |
| `src/app/dashboard/settings/page.tsx` | **Modify** — defaultValue pre-fill |
| `src/app/dashboard/page.tsx` | **Modify** — real badge + wallet counts |
| `src/app/(public)/winners/page.tsx` | **Create** — public winners page |
| `docs/MIGRATION-CHECKLIST.md` | **Modify** — tick Phase A items when done |

---

## Judging criteria format (decision)

Organizers already save free-text `judging_criteria` in the dashboard textarea. **Do not break that.**

**Parser rules** (`parse-judging-criteria.ts`):
1. If text is empty → fall back to existing `DEFAULT_CRITERIA[type]` on public page.
2. If text looks like JSON array `[{name,weight,description}]` → parse and use structured table.
3. Otherwise → render as HTML/prose block in `CriteriaSection` (new `proseCriteria?: string` prop).

This satisfies checklist item “from DB” without forcing organizers to learn JSON.

---

## Storage conventions (from `20260615120200_storage.sql`)

| Bucket | Path | Used for |
|--------|------|----------|
| `banners` | `{organizer_id}/{uuid}.{ext}` | Campaign `banner_url`, `hero_url`, organizer `banner_url` |
| `logos` | `{organizer_id}/{uuid}.{ext}` | Organizer `logo_url` |
| `artworks` | `{campaign_id}/{user_id}/{uuid}.{ext}` | Submission `artwork_url` |

Upload flow: client `FormData` with `File` → server action reads file → `supabase.storage.from(bucket).upload()` → save public URL on row.

Max file size: **10 MB** (match contact page copy). Allowed: `image/jpeg`, `image/png`, `image/webp`, `application/pdf` for artworks.

---

## Task 1: Storage upload helper

**Files:**
- Create: `src/lib/storage/upload.ts`

- [ ] **Step 1: Implement `uploadPublicFile`**

```typescript
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ARTWORK_TYPES = [...IMAGE_TYPES, "application/pdf"];

export async function uploadPublicFile(opts: {
  bucket: "banners" | "logos" | "artworks";
  path: string;
  file: File;
  allowedTypes?: string[];
}) {
  const supabase = await createClient();
  const allowed = opts.allowedTypes ?? IMAGE_TYPES;
  if (!allowed.includes(file.type)) throw new Error("Unsupported file type.");
  if (file.size > MAX_BYTES) throw new Error("File must be under 10 MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from(opts.bucket)
    .upload(opts.path, buffer, { contentType: file.type, upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(opts.bucket).getPublicUrl(opts.path);
  return data.publicUrl;
}
```

- [ ] **Step 2: Add `randomStorageName(ext: string)` helper** — `crypto.randomUUID()` + ext.

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```

Expected: PASS

---

## Task 2: Sync child tables (prizes, FAQ, age brackets, custom fields)

**Files:**
- Create: `src/lib/campaigns/sync-children.ts`
- Create: `src/app/dashboard/campaigns/children-actions.ts`

- [ ] **Step 1: Define input types matching DB**

```typescript
export type PrizeInput = { title: string; description?: string; rank?: number; sort_order: number };
export type FaqInput = { question: string; answer: string; sort_order: number };
export type AgeBracketInput = { key: string; label: string; min_age: number; max_age: number; sort_order: number };
export type CustomFieldInput = {
  label: string;
  field_type: CWFieldType;
  options?: string[];
  required: boolean;
  sort_order: number;
};
```

- [ ] **Step 2: Implement `syncCampaignChildren(campaignId, data)`**

Pattern per table:
```typescript
await supabase.from("prizes").delete().eq("campaign_id", campaignId);
if (prizes.length) {
  await supabase.from("prizes").insert(prizes.map((p) => ({ ...p, campaign_id: campaignId })));
}
```
Repeat for `faq_items`, `age_brackets`, `custom_fields`.

- [ ] **Step 3: Server action `saveCampaignChildrenAction(campaignId, FormData)`**

Parse JSON blobs from hidden fields:
- `prizes_json`, `faq_json`, `age_brackets_json`, `custom_fields_json`

Validate ownership via `owns_campaign` (same as update action). Call `syncCampaignChildren`. `revalidatePath` campaign edit + public slug.

- [ ] **Step 4: Server action `uploadCampaignMediaAction(campaignId, FormData)`**

Fields: `banner_file`, `hero_file` (optional). Resolve `organizer_id` from campaign. Upload to `banners/{organizer_id}/{uuid}.ext`. Update `campaigns.banner_url` / `campaigns.hero_url`.

---

## Task 3: Campaign editor — prizes repeater (item 1/13)

**Files:**
- Create: `src/components/campaigns/repeater-field.tsx`
- Create: `src/components/campaigns/campaign-children-form.tsx`
- Modify: `src/app/dashboard/campaigns/[id]/page.tsx`

- [ ] **Step 1: `RepeaterField` component** — `items`, `onChange`, `renderItem`, `emptyItem`, `addLabel`.

- [ ] **Step 2: Prizes section** — fields: title (required), description, rank (1/2/3), drag-less sort via up/down buttons updating `sort_order`.

- [ ] **Step 3: Load existing prizes on edit page**

```typescript
const [{ data: prizes }, { data: faqItems }, { data: ageBrackets }, { data: customFields }] =
  await Promise.all([
    supabase.from("prizes").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("faq_items").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("age_brackets").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("custom_fields").select("*").eq("campaign_id", id).order("sort_order"),
  ]);
```

- [ ] **Step 4: Render `<CampaignChildrenForm>` below `<CampaignForm>`** on edit page only (not create — children saved after campaign exists).

---

## Task 4: Campaign editor — FAQ repeater (item 2/13)

**Files:**
- Modify: `src/components/campaigns/campaign-children-form.tsx`

- [ ] **Step 1: FAQ section** — question + answer textareas, add/remove rows.

- [ ] **Step 2: Include in `saveCampaignChildrenAction` JSON payload.**

---

## Task 5: Campaign editor — age brackets repeater (item 3/13)

**Files:**
- Modify: `src/components/campaigns/campaign-children-form.tsx`

- [ ] **Step 1: Bracket row** — key (slug, auto from label), label, min_age, max_age.

- [ ] **Step 2: Show section only when `enable_age_brackets` is true** — read from campaign row passed as prop; note on form: “Enable age brackets in campaign toggles first.”

- [ ] **Step 3: Validate min_age <= max_age server-side; unique `key` per campaign.**

---

## Task 6: Campaign editor — custom fields builder (item 4/13)

**Files:**
- Modify: `src/components/campaigns/campaign-children-form.tsx`

- [ ] **Step 1: Field row** — label, `field_type` select (`text|textarea|number|phone|email|date|select|checkbox|file`), required checkbox.

- [ ] **Step 2: Options input** — comma-separated, shown only when `field_type === "select"`.

- [ ] **Step 3: Persist to `custom_fields` table via sync helper.**

---

## Task 7: Campaign editor — banner / hero upload (item 5/13)

**Files:**
- Create: `src/components/campaigns/campaign-media-upload.tsx`
- Modify: `src/app/dashboard/campaigns/[id]/page.tsx`

- [ ] **Step 1: `CampaignMediaUpload` client component** — two file inputs + preview of current `banner_url` / `hero_url`.

- [ ] **Step 2: Wire `uploadCampaignMediaAction`** — separate form below children form (“Save images”).

- [ ] **Step 3: After upload, show thumbnail previews on edit page.**

---

## Task 8: Campaign editor — multi_min / multi_max (item 6/13)

**Files:**
- Modify: `src/components/campaigns/campaign-form.tsx`

- [ ] **Step 1: Add fields under “Submissions” toggles card**

```tsx
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label htmlFor="multi_min">Min entries per order</Label>
    <Input id="multi_min" name="multi_min" type="number" min={1} defaultValue={defaults.multi_min ?? 1} />
  </div>
  <div className="space-y-2">
    <Label htmlFor="multi_max">Max entries per order</Label>
    <Input id="multi_max" name="multi_max" type="number" min={1} defaultValue={defaults.multi_max ?? 1} />
  </div>
</div>
```

- [ ] **Step 2: Show only when `allow_multiple_submissions` checkbox is on** (client state).

- [ ] **Step 3: Server already persists** (`actions.ts` lines 115–116, 173–174) — no action change needed.

---

## Task 9: Public campaign — judging criteria from DB (item 7/13)

**Files:**
- Create: `src/lib/campaigns/parse-judging-criteria.ts`
- Modify: `src/app/(public)/campaigns/[slug]/page.tsx`
- Modify: `src/components/campaigns/detail-sections.tsx`

- [ ] **Step 1: Implement parser** (see format decision above).

- [ ] **Step 2: In campaign detail page, replace hardcoded-only path**

```typescript
const parsed = parseJudgingCriteria(campaign.judging_criteria, campaignType);
// parsed: { structured: CriteriaRow[]; prose: string | null }
const criteria = parsed.structured.length
  ? parsed.structured
  : DEFAULT_CRITERIA[campaignType];
```

- [ ] **Step 3: Pass `proseCriteria={parsed.prose}` to `CriteriaSection`**

- [ ] **Step 4: In `CriteriaSection`, if `proseCriteria`, render `<div className="prose">` above or instead of empty structured table.**

Keep `DEFAULT_RULES` and `SUBMIT_NOTES` as-is (out of Phase A scope).

---

## Task 10: Submit form — custom fields (item 8/13)

**Files:**
- Create: `src/components/campaigns/custom-field-renderer.tsx`
- Modify: `src/app/(public)/campaigns/[slug]/submit/page.tsx`
- Modify: `src/app/(public)/campaigns/[slug]/submit/submit-entry-form.tsx`
- Modify: `src/app/(public)/campaigns/[slug]/submit/actions.ts`

- [ ] **Step 1: Load `custom_fields` on submit page** — `order("sort_order")`.

- [ ] **Step 2: `CustomFieldRenderer`** — maps `field_type` to Input/Textarea/Select/checkbox; names `custom_field_{id}`.

- [ ] **Step 3: In `submitEntryAction`, build `field_data` jsonb**

```typescript
const fieldData: Record<string, string> = {};
for (const field of customFields) {
  const raw = formData.get(`custom_field_${field.id}`);
  if (field.required && !raw) return { error: `${field.label} is required.` };
  if (raw != null && String(raw).trim()) fieldData[field.id] = String(raw);
}
```

- [ ] **Step 4: Insert submission with `field_data: fieldData`**

---

## Task 11: Submit form — artwork file upload (item 9/13)

**Files:**
- Modify: `submit-entry-form.tsx`, `submit/actions.ts`
- Uses: `src/lib/storage/upload.ts`

- [ ] **Step 1: Replace URL-only field with file input** — keep optional URL as fallback OR remove URL field (prefer file-only for Phase A).

- [ ] **Step 2: In action, if `artwork_file` present**

```typescript
const url = await uploadPublicFile({
  bucket: "artworks",
  path: `${campaign.id}/${user.id}/${randomStorageName(ext)}`,
  file: artworkFile,
  allowedTypes: ARTWORK_TYPES,
});
```

- [ ] **Step 3: Require artwork** — at least file OR legacy URL until payment exists.

- [ ] **Step 4: Remove “Direct uploads coming soon” copy.**

---

## Task 12: Organizer logo / banner upload (item 10/13)

**Files:**
- Create: `src/components/dashboard/image-upload-field.tsx`
- Modify: `src/app/dashboard/organizer/page.tsx`

- [ ] **Step 1: `ImageUploadField`** — preview, file input, calls server action.

- [ ] **Step 2: `uploadOrganizerMediaAction`** in organizer page or `dashboard/organizer/actions.ts`

```typescript
// logos bucket: `${organizer.id}/${uuid}.ext` → logo_url
// banners bucket: same → banner_url
```

- [ ] **Step 3: Show current images on organizer dashboard if URLs set.**

---

## Task 13: Settings pre-fill (item 11/13)

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Add defaultValues**

```tsx
<Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
<Input id="city" name="city" defaultValue={profile.city ?? ""} />
<Input id="country" name="country" defaultValue={profile.country ?? ""} />
```

- [ ] **Step 2: Verify save still works** — manual test reload shows values.

---

## Task 14: Dashboard real badge + wallet (item 12/13)

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Query counts for contestant/creator branch**

```typescript
const { count: badgeCount } = await supabase
  .from("user_badges")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);

const { data: walletRows } = await supabase
  .from("wallet_entries")
  .select("amount")
  .eq("user_id", user.id);

const balance = (walletRows ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0);
```

- [ ] **Step 2: Replace hardcoded `"0"` and `"RM 0.00"`** with real values (reuse `formatCurrency` from utils).

---

## Task 15: Winners page (item 13/13)

**Files:**
- Create: `src/app/(public)/winners/page.tsx`
- Modify: `docs/MIGRATION-CHECKLIST.md` (optional: note winners source)

- [ ] **Step 1: Create `/winners` page** — query submissions where `status` in (`shortlisted`, `winner`) OR `winner_rank` not null; join campaign + creator display name.

If no winners in DB yet, show empty state + link to `/campaigns` (fixes 404; better than static fiction).

```typescript
const { data: winners } = await supabase
  .from("submissions")
  .select("id, student_name, winner_rank, campaigns(slug, title), ...")
  .in("status", ["shortlisted", "winner"])
  .order("winner_rank", { ascending: true })
  .limit(24);
```

- [ ] **Step 2: Keep home `RecentWinnersBand` link** — now resolves.

- [ ] **Step 3: Optional** — add `PageMotion` wrapper for consistency (not required for Phase A).

---

## Task 16: Checklist + verification

**Files:**
- Modify: `docs/MIGRATION-CHECKLIST.md`

- [ ] **Step 1: Mark all Phase A items `[x]`**

- [ ] **Step 2: Run verification**

```bash
npm run type-check
npm run build
```

- [ ] **Step 3: Manual smoke test (Section 16 of checklist)**

| # | Flow | Expected after Phase A |
|---|------|------------------------|
| 1 | Organizer edit campaign | Save prizes, FAQ, brackets, custom fields, images |
| 2 | Public `/campaigns/[slug]` | Shows DB prizes, FAQ, brackets, judging criteria |
| 3 | Contestant submit | Custom fields + file upload → row in `submissions` |
| 4 | Settings | Phone/city/country pre-filled |
| 5 | Dashboard | Real badge count + wallet balance |
| 6 | `/winners` | Page loads (data or empty state) |

---

## Execution order (one pass)

```
1. Storage helper                    (Task 1)
2. Sync children + actions           (Task 2)
3. Campaign repeaters + media        (Tasks 3–8)     ← items 1–6
4. Public judging criteria           (Task 9)        ← item 7
5. Submit custom fields + upload     (Tasks 10–11)   ← items 8–9
6. Organizer uploads                 (Task 12)       ← item 10
7. Settings pre-fill                 (Task 13)       ← item 11
8. Dashboard metrics                 (Task 14)       ← item 12
9. Winners page                      (Task 15)       ← item 13
10. Checklist + verify               (Task 16)
```

**Estimated touch count:** ~20 files, ~16 tasks, single PR.

---

## Out of scope (do not build in Phase A)

- Stripe / payment (`paid` status)
- School upload tokens
- Certificate generation
- Voting gallery
- Campaign create wizard (5-step)
- Deleting old Storage objects on replace (nice-to-have; optional `upsert: true` is enough for MVP)

---

## Changelog entry

| Date | Change |
|------|--------|
| 2026-07-01 | Phase A implementation plan (13 items, one pass) |
