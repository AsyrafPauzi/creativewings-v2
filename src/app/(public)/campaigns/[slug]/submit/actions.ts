"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface SubmissionState {
  error?: string;
  success?: string;
}

export async function submitEntryAction(
  campaignSlug: string,
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/campaigns/${campaignSlug}/submit`);
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, status, allow_multiple_submissions, enable_age_brackets, enable_checkout_message, checkout_message_required",
    )
    .eq("slug", campaignSlug)
    .maybeSingle();

  if (!campaign || campaign.status !== "published") {
    return { error: "This campaign is not accepting submissions right now." };
  }

  if (!campaign.allow_multiple_submissions) {
    const { count } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("contestant_id", user.id);
    if ((count ?? 0) > 0) {
      return { error: "You have already submitted to this campaign." };
    }
  }

  const studentName = String(formData.get("student_name") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim() || null;
  const guardianContact = String(formData.get("guardian_contact") ?? "").trim() || null;
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? parseInt(ageRaw, 10) : null;
  const artworkUrl = String(formData.get("artwork_url") ?? "").trim() || null;
  const checkoutMessage =
    String(formData.get("checkout_message") ?? "").trim() || null;
  const ageBracketId =
    String(formData.get("age_bracket_id") ?? "").trim() || null;

  if (!studentName) return { error: "Please enter the participant's name." };

  if (
    campaign.enable_checkout_message &&
    campaign.checkout_message_required &&
    !checkoutMessage
  ) {
    return { error: "Please add the required message." };
  }

  const { error } = await supabase.from("submissions").insert({
    campaign_id: campaign.id,
    contestant_id: user.id,
    age_bracket_id: ageBracketId,
    student_name: studentName,
    guardian_name: guardianName,
    guardian_contact: guardianContact,
    age,
    artwork_url: artworkUrl,
    checkout_message: checkoutMessage,
    status: "claimed",
    moderation_status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath(`/campaigns/${campaignSlug}`);
  revalidatePath("/dashboard");

  return { success: "Submission received. We'll let you know when it's reviewed." };
}
