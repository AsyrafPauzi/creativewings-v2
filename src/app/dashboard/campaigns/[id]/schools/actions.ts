"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { sendArtworkReadyEmail } from "@/lib/email/send-artwork-ready";
import { requireRole } from "@/lib/auth";
import { getAppUrl } from "@/lib/payments/app-url";
import { syncSchoolCoupon } from "@/lib/schools/sync-school-coupon";
import { createClient } from "@/lib/supabase/server";

async function assertCampaignOwner(campaignId: string) {
  await requireRole("organizer");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) notFound();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, organizer_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return { supabase, user, campaign };
}

export async function saveSchoolAction(campaignId: string, formData: FormData) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const schoolId = String(formData.get("school_id") ?? "").trim() || null;
  const schoolCode = String(formData.get("school_code") ?? "")
    .trim()
    .padStart(3, "0")
    .slice(0, 3);
  const schoolName = String(formData.get("school_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const couponCode = String(formData.get("coupon_code") ?? "").trim() || null;

  if (!schoolName) return;
  if (!/^\d{3}$/.test(schoolCode)) return;

  const payload = {
    campaign_id: campaignId,
    school_code: schoolCode,
    school_name: schoolName,
    city,
    country,
    coupon_code: couponCode,
  };

  if (schoolId) {
    await supabase.from("schools").update(payload).eq("id", schoolId).eq("campaign_id", campaignId);
    if (couponCode) {
      await syncSchoolCoupon({ schoolId, campaignId, code: couponCode });
    }
  } else {
    const { data: school } = await supabase.from("schools").insert(payload).select("id").single();
    if (school && couponCode) {
      await syncSchoolCoupon({ schoolId: school.id, campaignId, code: couponCode });
    }
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
}

export async function deleteSchoolAction(campaignId: string, schoolId: string) {
  const { supabase } = await assertCampaignOwner(campaignId);
  await supabase.from("schools").delete().eq("id", schoolId).eq("campaign_id", campaignId);
  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
}

export async function generateUploadTokenAction(campaignId: string, schoolId: string) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const { data: school } = await supabase
    .from("schools")
    .select("id, school_code")
    .eq("id", schoolId)
    .eq("campaign_id", campaignId)
    .maybeSingle();
  if (!school) notFound();

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  await supabase.from("upload_tokens").insert({
    token,
    campaign_id: campaignId,
    school_id: schoolId,
    school_code: school.school_code,
    expires_at: expiresAt.toISOString(),
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
  return `${getAppUrl()}/cw-school-upload/${token}`;
}

export async function moderateStagedAction(
  campaignId: string,
  submissionId: string,
  decision: "approved" | "rejected",
  note?: string,
) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("id", submissionId)
    .eq("campaign_id", campaignId)
    .maybeSingle();
  if (!submission || submission.status !== "staged") return;

  await supabase
    .from("submissions")
    .update({
      moderation_status: decision,
      moderation_note: note?.trim() || null,
    })
    .eq("id", submissionId);

  if (decision === "approved") {
    await sendArtworkReadyEmail(submissionId);
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
}

export async function createCouponAction(campaignId: string, formData: FormData) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const code = String(formData.get("code") ?? "").trim();
  const maxUses = parseInt(String(formData.get("max_uses") ?? "0"), 10) || 0;
  const expiresRaw = String(formData.get("expires_at") ?? "").trim();
  if (!code) return;

  await supabase.from("sponsor_coupons").insert({
    campaign_id: campaignId,
    code,
    max_uses: maxUses,
    expires_at: expiresRaw ? new Date(expiresRaw).toISOString() : null,
    is_active: true,
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
}

export async function toggleCouponAction(campaignId: string, couponId: string, isActive: boolean) {
  const { supabase } = await assertCampaignOwner(campaignId);
  await supabase.from("sponsor_coupons").update({ is_active: isActive }).eq("id", couponId);
  revalidatePath(`/dashboard/campaigns/${campaignId}/schools`);
}
