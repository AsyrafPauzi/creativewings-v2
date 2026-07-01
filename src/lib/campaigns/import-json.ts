import { writeAuditLog } from "@/lib/audit/log";
import { syncDesignVariants } from "@/lib/design/sync-variants";
import { syncCampaignChildren } from "@/lib/campaigns/sync-children";
import { campaignImportV1Schema } from "@/lib/campaigns/import-schema";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { CWFieldType } from "@/lib/supabase/database.types";

async function ensureCampaignSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
) {
  let slug = base || "campaign";
  let n = 1;
  while (true) {
    const { data } = await supabase.from("campaigns").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function importCampaignJson(
  organizerId: string,
  actorId: string,
  raw: unknown,
): Promise<{ campaignId?: string; error?: string }> {
  const parsed = campaignImportV1Schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join("; ") };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const baseSlug = data.campaign.slug ?? slugify(data.campaign.title);
  const slug = await ensureCampaignSlug(supabase, baseSlug);

  const c = data.campaign;
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      organizer_id: organizerId,
      slug,
      title: c.title,
      type: c.type,
      status: "draft",
      category: c.category ?? null,
      sub_category: c.sub_category ?? null,
      short_description: c.short_description ?? null,
      description: c.description ?? null,
      entry_fee: c.entry_fee ?? 0,
      currency: c.currency ?? "MYR",
      submission_start: c.submission_start ?? null,
      submission_deadline: c.submission_deadline ?? null,
      review_start: c.review_start ?? null,
      final_event_date: c.final_event_date ?? null,
      event_mode: c.event_mode ?? "online",
      location_details: c.location_details ?? null,
      kpi_show_progress: c.kpi_show_progress ?? false,
      kpi_target: c.kpi_target ?? 0,
      kpi_label: c.kpi_label ?? null,
      allow_multiple_submissions: c.allow_multiple_submissions ?? false,
      multi_min: c.multi_min ?? 1,
      multi_max: c.multi_max ?? 1,
      enable_age_brackets: c.enable_age_brackets ?? false,
      enable_school_sponsors: c.enable_school_sponsors ?? false,
      enable_certificate: c.enable_certificate ?? false,
      enable_voting: c.enable_voting ?? false,
      vote_limit_per_user: c.vote_limit_per_user ?? 1,
      enable_checkout_message: c.enable_checkout_message ?? false,
      checkout_message_label: c.checkout_message_label ?? null,
      checkout_message_required: c.checkout_message_required ?? false,
      enable_design: c.enable_design ?? false,
      design_picker_label: c.design_picker_label ?? null,
      design_artwork_w: c.design_artwork_w ?? null,
      design_artwork_h: c.design_artwork_h ?? null,
      judging_criteria: c.judging_criteria ?? null,
      total_prize_value: c.total_prize_value ?? null,
      sdg_goals: c.sdg_goals ?? [],
    })
    .select("id")
    .single();

  if (error || !campaign) return { error: error?.message ?? "Failed to create campaign." };

  await syncCampaignChildren(supabase, campaign.id, {
    prizes: data.prizes.map((p) => ({
      title: p.title,
      description: p.description ?? undefined,
      rank: p.rank ?? undefined,
      sort_order: p.sort_order,
    })),
    faq: data.faq_items,
    ageBrackets: data.age_brackets,
    customFields: data.custom_fields.map((f) => ({
      ...f,
      field_type: f.field_type as CWFieldType,
    })),
  });

  await syncDesignVariants(supabase, campaign.id, data.design_variants);

  await writeAuditLog({
    action: "campaign.imported",
    objectType: "campaign",
    objectId: campaign.id,
    actorId,
    details: { title: c.title, slug },
  });

  return { campaignId: campaign.id };
}
