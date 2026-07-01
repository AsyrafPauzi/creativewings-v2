import { onSubmissionPaid } from "@/lib/badges/hooks";
import { startCommercePayCheckout } from "@/lib/payments/create-checkout";
import { resolveSchoolCoupon } from "@/lib/payments/coupons";
import { fulfillFreeSubmission } from "@/lib/payments/fulfill-order";
import { sendSubmissionLinkedEmail } from "@/lib/email/send-submission-linked";
import { createAdminClient } from "@/lib/supabase/server";

export type ClaimResult = {
  error?: string;
  success?: string;
  redirect?: string;
};

async function linkGuardianIfNeeded(
  submission: {
    guardian_email?: string | null;
    guardian_name?: string | null;
  },
  userId: string,
) {
  const email = submission.guardian_email?.trim();
  if (!email) return;

  const supabase = createAdminClient();

  const { data: guardianProfile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  await supabase.from("guardian_links").upsert(
    {
      student_id: userId,
      guardian_email: email,
      guardian_name: submission.guardian_name?.trim() || "Guardian",
      guardian_id: guardianProfile?.id ?? null,
      status: guardianProfile ? "active" : "pending_invite",
    },
    { onConflict: "student_id" },
  );
}

export async function completeClaimSubmission(
  submissionId: string,
  userId: string,
): Promise<ClaimResult> {
  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) return { error: "Entry not found." };
  if (submission.status !== "staged" || submission.moderation_status !== "approved") {
    return { error: "This entry is not available to claim." };
  }
  if (submission.claim_reserved_by !== userId) {
    return { error: "Your reservation expired. Please look up the code again." };
  }
  if (
    submission.claim_reserved_until &&
    new Date(submission.claim_reserved_until) < new Date()
  ) {
    return { error: "Your reservation expired. Please look up the code again." };
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, slug, entry_fee, currency")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  if (!campaign) return { error: "Campaign not found." };

  const schoolCoupon = await resolveSchoolCoupon(submission.campaign_id, submission.school_id);

  const { error: updateErr } = await supabase
    .from("submissions")
    .update({
      contestant_id: userId,
      status: "claimed",
      claim_reserved_by: null,
      claim_reserved_until: null,
      sponsor_coupon_id: schoolCoupon?.id ?? null,
    })
    .eq("id", submissionId);

  if (updateErr) return { error: updateErr.message };

  await linkGuardianIfNeeded(submission, userId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, display_name, phone")
    .eq("id", userId)
    .maybeSingle();

  await sendSubmissionLinkedEmail(submissionId);

  const fee = Number(campaign.entry_fee ?? 0);
  const isFree = fee <= 0 || schoolCoupon?.coversFullFee;

  if (isFree) {
    await fulfillFreeSubmission({
      submissionId,
      campaignId: campaign.id,
      userId,
      couponId: schoolCoupon?.id,
    });
    await onSubmissionPaid(userId, campaign.id);
    return { success: "Entry claimed — no payment required." };
  }

  try {
    const redirectUrl = await startCommercePayCheckout({
      submissionId,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      userId,
      userEmail: profile?.email ?? "",
      userName:
        profile?.full_name || profile?.display_name || submission.student_name || "Contestant",
      userPhone: profile?.phone ?? submission.guardian_contact ?? "",
      amount: fee,
      currency: campaign.currency ?? "MYR",
      couponId: schoolCoupon?.id,
    });
    return { redirect: redirectUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
