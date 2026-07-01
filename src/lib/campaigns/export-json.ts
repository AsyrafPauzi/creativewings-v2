import { writeAuditLog } from "@/lib/audit/log";
import { createClient } from "@/lib/supabase/server";
import type { CampaignImportV1 } from "@/lib/campaigns/import-schema";

export async function exportCampaignJson(campaignId: string, actorId: string): Promise<CampaignImportV1 | null> {
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "title, type, slug, category, sub_category, short_description, description, entry_fee, currency, submission_start, submission_deadline, review_start, final_event_date, event_mode, location_details, kpi_show_progress, kpi_target, kpi_label, allow_multiple_submissions, multi_min, multi_max, enable_age_brackets, enable_school_sponsors, enable_certificate, enable_voting, vote_limit_per_user, enable_checkout_message, checkout_message_label, checkout_message_required, enable_design, design_picker_label, design_artwork_w, design_artwork_h, judging_criteria, total_prize_value, sdg_goals",
    )
    .eq("id", campaignId)
    .maybeSingle();

  if (!campaign) return null;

  const [{ data: prizes }, { data: faq }, { data: brackets }, { data: fields }, { data: variants }] =
    await Promise.all([
    supabase.from("prizes").select("title, description, rank, sort_order").eq("campaign_id", campaignId).order("sort_order"),
    supabase.from("faq_items").select("question, answer, sort_order").eq("campaign_id", campaignId).order("sort_order"),
    supabase.from("age_brackets").select("key, label, min_age, max_age, sort_order").eq("campaign_id", campaignId).order("sort_order"),
    supabase.from("custom_fields").select("label, field_type, options, required, sort_order").eq("campaign_id", campaignId).order("sort_order"),
    supabase.from("design_variants").select("slug, label, swatch_color, size_label, mockup_image_url, print_area_x, print_area_y, print_area_w, print_area_h, sort_order, is_active").eq("campaign_id", campaignId).order("sort_order"),
  ]);

  const payload: CampaignImportV1 = {
    schema_version: 1,
    campaign,
    prizes: prizes ?? [],
    faq_items: faq ?? [],
    age_brackets: brackets ?? [],
    custom_fields: fields ?? [],
    design_variants: variants ?? [],
  };

  await writeAuditLog({
    action: "campaign.exported",
    objectType: "campaign",
    objectId: campaignId,
    actorId,
    details: { slug: campaign.slug },
  });

  return payload;
}
