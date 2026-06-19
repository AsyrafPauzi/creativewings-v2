import type {
  CWCampaignType,
  CWSponsorPlacement,
  SponsorSlotRow,
} from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

interface LoadOpts {
  /** Where the slot should appear. */
  placement: CWSponsorPlacement;
  /** Match a slot configured for this campaign type (or untargeted ones). */
  campaignType?: CWCampaignType;
  /** Match a slot configured for this exact campaign (or untargeted ones). */
  campaignId?: string;
  /** Match a slot configured for this sub-category (or untargeted ones). */
  subCategorySlug?: string | null;
}

/**
 * Resolve a single active sponsor slot for the given placement + targeting.
 *
 * RLS already filters out un-published or out-of-window rows, so this just
 * narrows by applicability:
 * - If `applicable_types` is empty the slot matches any campaign type.
 * - If `applicable_campaign_id` is null the slot is generic (any campaign).
 * - If `applicable_sub_category` is null the slot ignores sub-category.
 *
 * Returns the highest-priority match (lowest sort_order, then most-specific).
 */
export async function loadSponsorSlot(
  opts: LoadOpts,
): Promise<SponsorSlotRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsor_slots")
    .select(
      "id, placement, sponsor_name, title, body, cta_label, cta_href, image_url, background_from, background_to, applicable_types, applicable_campaign_id, applicable_sub_category, is_published, active_from, active_until, sort_order, created_at, updated_at",
    )
    .eq("placement", opts.placement)
    .order("sort_order", { ascending: true });
  if (error || !data) return null;

  const candidates = data as SponsorSlotRow[];
  // Prefer the most specific match (campaign_id > sub_category > type > generic).
  const score = (s: SponsorSlotRow) => {
    let n = 0;
    if (opts.campaignId && s.applicable_campaign_id === opts.campaignId) n += 8;
    else if (s.applicable_campaign_id) return -1; // mismatched targeting
    if (
      opts.subCategorySlug &&
      s.applicable_sub_category === opts.subCategorySlug
    )
      n += 4;
    else if (s.applicable_sub_category) return -1;
    if (
      opts.campaignType &&
      s.applicable_types.length > 0 &&
      s.applicable_types.includes(opts.campaignType)
    )
      n += 2;
    else if (s.applicable_types.length > 0) return -1;
    return n;
  };

  let best: SponsorSlotRow | null = null;
  let bestScore = -1;
  for (const s of candidates) {
    const sc = score(s);
    if (sc < 0) continue;
    if (sc > bestScore) {
      best = s;
      bestScore = sc;
    }
  }
  return best;
}
