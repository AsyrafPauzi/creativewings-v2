import type { CampaignCardData } from "@/components/site/campaign-card";
import type { CWCampaignType, SubCategoryRow } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export interface TypeBucket {
  type: CWCampaignType;
  campaigns: CampaignCardData[];
  subCategories: SubCategoryRow[];
  /** Counts of campaigns of *this* type per sub_category slug. */
  counts: Record<string, number>;
  /** Total open campaigns of this type (post-status, pre-sub filter). */
  totalCount: number;
  /** Total *after* applying the active sub filter. */
  filteredCount: number;
  /** Active sub_category slug (only set if it is applicable to this type). */
  activeSub: string | null;
}

const PUBLIC_STATUSES: ReadonlyArray<string> = ["published", "closed"];

const SELECT_COLS =
  "id, slug, title, short_description, banner_url, category, sub_category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, submissions_count, organizer:organizer_id(name, slug, logo_url)";

/**
 * Fetch a "type bucket" — campaigns + sub-categories + counts — for one programme type.
 *
 * `activeSub` is honoured *only* if it appears in this type's catalogue. That way visiting
 * `/programmes?sub=design#workshops` will filter Workshops by Design, but Activities
 * (which has no Design sub-category) shows everything.
 */
export async function loadTypeBucket(
  type: CWCampaignType,
  activeSub: string | null,
): Promise<TypeBucket> {
  const supabase = await createClient();

  const [{ data: subCats }, { data: allOfType }] = await Promise.all([
    supabase
      .from("sub_categories")
      .select("slug, label_en, label_zh, icon, description_en, description_zh, applicable_types, sort_order, created_at")
      .contains("applicable_types", [type])
      .order("sort_order", { ascending: true }),
    supabase
      .from("campaigns")
      .select("sub_category, status")
      .eq("type", type)
      .in("status", PUBLIC_STATUSES),
  ]);

  const subCategories = (subCats ?? []) as SubCategoryRow[];
  const totalCount = (allOfType ?? []).length;

  const counts: Record<string, number> = {};
  for (const row of allOfType ?? []) {
    if (row.sub_category) {
      counts[row.sub_category] = (counts[row.sub_category] ?? 0) + 1;
    }
  }

  const subInThisType =
    activeSub && subCategories.some((sc) => sc.slug === activeSub) ? activeSub : null;

  let q = supabase
    .from("campaigns")
    .select(SELECT_COLS)
    .eq("type", type)
    .in("status", PUBLIC_STATUSES)
    .order("submission_deadline", { ascending: true });

  if (subInThisType) q = q.eq("sub_category", subInThisType);

  const { data: campaigns } = await q;
  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  return {
    type,
    campaigns: cards,
    subCategories,
    counts,
    totalCount,
    filteredCount: cards.length,
    activeSub: subInThisType,
  };
}
