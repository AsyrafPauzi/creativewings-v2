"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { writeAuditLog } from "@/lib/audit/log";
import { onCampaignPublished } from "@/lib/badges/hooks";
import { getPlatformSettings } from "@/lib/platform/settings";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type {
  CWCampaignStatus,
  CWCampaignType,
  CWEventMode,
} from "@/lib/supabase/database.types";

export interface CampaignFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function toBool(value: FormDataEntryValue | null) {
  if (value === null) return false;
  const v = String(value).toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

function toIntOr(value: FormDataEntryValue | null, fallback = 0) {
  const v = parseInt(String(value ?? ""), 10);
  return Number.isFinite(v) ? v : fallback;
}

function toDateOrNull(value: FormDataEntryValue | null) {
  const s = String(value ?? "").trim();
  return s === "" ? null : new Date(s).toISOString();
}

function toArrayInts(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

async function ensureCampaignSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  ignoreId?: string,
) {
  let slug = base || "campaign";
  let n = 1;
  while (true) {
    const q = supabase.from("campaigns").select("id").eq("slug", slug);
    const { data } = await (ignoreId ? q.neq("id", ignoreId) : q).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

async function getOwnedOrganizer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) throw new Error("You need an organisation profile to create campaigns.");
  return { supabase, user, organizerId: org.id };
}

export async function createCampaignAction(
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  try {
    const { supabase, organizerId } = await getOwnedOrganizer();

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Please enter a campaign title." };

    const baseSlug = slugify(title);
    const slug = await ensureCampaignSlug(supabase, baseSlug);

    const payload = {
      organizer_id: organizerId,
      slug,
      title,
      type: (String(formData.get("type") ?? "competition") as CWCampaignType),
      status: "draft" as CWCampaignStatus,
      category: String(formData.get("category") ?? "").trim() || null,
      sub_category: String(formData.get("sub_category") ?? "").trim() || null,
      short_description: String(formData.get("short_description") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      entry_fee: parseFloat(String(formData.get("entry_fee") ?? "0")) || 0,
      currency: String(formData.get("currency") ?? "MYR"),
      submission_start: toDateOrNull(formData.get("submission_start")),
      submission_deadline: toDateOrNull(formData.get("submission_deadline")),
      review_start: toDateOrNull(formData.get("review_start")),
      final_event_date: toDateOrNull(formData.get("final_event_date")),
      event_mode: String(formData.get("event_mode") ?? "online") as CWEventMode,
      location_details: String(formData.get("location_details") ?? "").trim() || null,
      kpi_show_progress: toBool(formData.get("kpi_show_progress")),
      kpi_target: toIntOr(formData.get("kpi_target")),
      kpi_label: String(formData.get("kpi_label") ?? "").trim() || null,
      enable_age_brackets: toBool(formData.get("enable_age_brackets")),
      enable_school_sponsors: toBool(formData.get("enable_school_sponsors")),
      enable_certificate: toBool(formData.get("enable_certificate")),
      enable_voting: toBool(formData.get("enable_voting")),
      enable_checkout_message: toBool(formData.get("enable_checkout_message")),
      checkout_message_label: String(formData.get("checkout_message_label") ?? "").trim() || null,
      checkout_message_required: toBool(formData.get("checkout_message_required")),
      allow_multiple_submissions: toBool(formData.get("allow_multiple_submissions")),
      multi_min: toIntOr(formData.get("multi_min"), 1),
      multi_max: toIntOr(formData.get("multi_max"), 1),
      enable_design: toBool(formData.get("enable_design")),
      design_picker_label: String(formData.get("design_picker_label") ?? "").trim() || null,
      design_artwork_w: toIntOr(formData.get("design_artwork_w"), 0) || null,
      design_artwork_h: toIntOr(formData.get("design_artwork_h"), 0) || null,
      serial_code: String(formData.get("serial_code") ?? "").trim().slice(0, 3) || null,
      judging_criteria: String(formData.get("judging_criteria") ?? "").trim() || null,
      total_prize_value: String(formData.get("total_prize_value") ?? "").trim() || null,
      sdg_goals: toArrayInts(formData.get("sdg_goals")),
    };

    const { data, error } = await supabase
      .from("campaigns")
      .insert(payload)
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/campaigns");
    redirect(`/dashboard/campaigns/${data.id}`);
  } catch (e) {
    const err = e as Error;
    if (err.message === "NEXT_REDIRECT") throw e;
    return { error: err.message };
  }
}

export async function updateCampaignAction(
  campaignId: string,
  _prev: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {
    title: String(formData.get("title") ?? "").trim(),
    type: String(formData.get("type") ?? "competition"),
    category: String(formData.get("category") ?? "").trim() || null,
    sub_category: String(formData.get("sub_category") ?? "").trim() || null,
    short_description: String(formData.get("short_description") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    entry_fee: parseFloat(String(formData.get("entry_fee") ?? "0")) || 0,
    currency: String(formData.get("currency") ?? "MYR"),
    submission_start: toDateOrNull(formData.get("submission_start")),
    submission_deadline: toDateOrNull(formData.get("submission_deadline")),
    review_start: toDateOrNull(formData.get("review_start")),
    final_event_date: toDateOrNull(formData.get("final_event_date")),
    event_mode: String(formData.get("event_mode") ?? "online"),
    location_details: String(formData.get("location_details") ?? "").trim() || null,
    kpi_show_progress: toBool(formData.get("kpi_show_progress")),
    kpi_target: toIntOr(formData.get("kpi_target")),
    kpi_label: String(formData.get("kpi_label") ?? "").trim() || null,
    enable_age_brackets: toBool(formData.get("enable_age_brackets")),
    enable_school_sponsors: toBool(formData.get("enable_school_sponsors")),
    enable_certificate: toBool(formData.get("enable_certificate")),
    enable_voting: toBool(formData.get("enable_voting")),
    enable_checkout_message: toBool(formData.get("enable_checkout_message")),
    checkout_message_label: String(formData.get("checkout_message_label") ?? "").trim() || null,
    checkout_message_required: toBool(formData.get("checkout_message_required")),
    allow_multiple_submissions: toBool(formData.get("allow_multiple_submissions")),
    multi_min: toIntOr(formData.get("multi_min"), 1),
    multi_max: toIntOr(formData.get("multi_max"), 1),
    enable_design: toBool(formData.get("enable_design")),
    design_picker_label: String(formData.get("design_picker_label") ?? "").trim() || null,
    design_artwork_w: toIntOr(formData.get("design_artwork_w"), 0) || null,
    design_artwork_h: toIntOr(formData.get("design_artwork_h"), 0) || null,
    serial_code: String(formData.get("serial_code") ?? "").trim().slice(0, 3) || null,
    judging_criteria: String(formData.get("judging_criteria") ?? "").trim() || null,
    total_prize_value: String(formData.get("total_prize_value") ?? "").trim() || null,
    sdg_goals: toArrayInts(formData.get("sdg_goals")),
  };

  const { error } = await supabase
    .from("campaigns")
    .update(payload)
    .eq("id", campaignId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return {};
}

export async function setCampaignStatusAction(
  campaignId: string,
  status: CWCampaignStatus,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nextStatus = status;
  if (status === "published") {
    const settings = await getPlatformSettings();
    nextStatus = settings.require_campaign_approval ? "pending" : "published";
  }

  const payload: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === "published") payload.published_at = new Date().toISOString();
  await supabase.from("campaigns").update(payload).eq("id", campaignId);

  if (user) {
    if (nextStatus === "published") {
      await onCampaignPublished(user.id);
      await writeAuditLog({
        action: "campaign.published",
        objectType: "campaign",
        objectId: campaignId,
        actorId: user.id,
      });
    } else if (nextStatus === "pending") {
      await writeAuditLog({
        action: "campaign.pending_submitted",
        objectType: "campaign",
        objectId: campaignId,
        actorId: user.id,
      });
    } else if (status === "closed") {
      await writeAuditLog({
        action: "campaign.closed",
        objectType: "campaign",
        objectId: campaignId,
        actorId: user.id,
      });
    }
  }

  revalidatePath("/dashboard/campaigns");
  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  revalidatePath("/dashboard/admin/campaigns");
}

export async function deleteCampaignAction(campaignId: string) {
  const supabase = await createClient();
  await supabase.from("campaigns").delete().eq("id", campaignId);
  revalidatePath("/dashboard/campaigns");
  redirect("/dashboard/campaigns");
}
