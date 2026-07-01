"use server";

import { redirect } from "next/navigation";

import { reserveStagedSubmission } from "@/lib/schools/claim-reservation";
import { completeClaimSubmission } from "@/lib/schools/claim-submission";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface ClaimLookupState {
  error?: string;
}

function normalizeSubmissionCode(raw: string) {
  return raw.trim().toUpperCase();
}

export async function lookupClaimCodeAction(
  _prev: ClaimLookupState,
  formData: FormData,
): Promise<ClaimLookupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in?next=/claim");
  }

  const code = normalizeSubmissionCode(String(formData.get("code") ?? ""));
  if (!code) return { error: "Please enter a submission code." };

  const admin = createAdminClient();
  const { data } = await admin
    .from("submissions")
    .select("id, status, moderation_status")
    .eq("submission_code", code)
    .maybeSingle();

  if (!data || data.status !== "staged") {
    return { error: "Code not found or already claimed." };
  }
  if (data.moderation_status !== "approved") {
    return { error: "This entry is still being reviewed by the organizer." };
  }

  try {
    await reserveStagedSubmission(data.id, user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  redirect(`/claim/${encodeURIComponent(code)}`);
}

export interface ClaimConfirmState {
  error?: string;
  success?: string;
  redirect?: string;
}

export async function claimSubmissionAction(
  submissionId: string,
  _prev: ClaimConfirmState,
): Promise<ClaimConfirmState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in?next=/claim");
  }

  const result = await completeClaimSubmission(submissionId, user.id);
  if (result.redirect) {
    redirect(result.redirect);
  }
  return result;
}
