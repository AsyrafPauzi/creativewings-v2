import { createAdminClient } from "@/lib/supabase/server";

export const CLAIM_LOCK_MINUTES = 15;

export async function reserveStagedSubmission(submissionId: string, userId: string) {
  const supabase = createAdminClient();
  const until = new Date(Date.now() + CLAIM_LOCK_MINUTES * 60_000).toISOString();

  const { data: row } = await supabase
    .from("submissions")
    .select("id, status, moderation_status, claim_reserved_by, claim_reserved_until")
    .eq("id", submissionId)
    .single();

  if (!row) throw new Error("Entry not found.");
  if (row.status !== "staged" || row.moderation_status !== "approved") {
    throw new Error("This entry is not available to claim.");
  }

  const lockExpired =
    !row.claim_reserved_until || new Date(row.claim_reserved_until) < new Date();
  if (row.claim_reserved_by && row.claim_reserved_by !== userId && !lockExpired) {
    throw new Error("Someone else is claiming this code right now. Try again shortly.");
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      claim_reserved_by: userId,
      claim_reserved_until: until,
    })
    .eq("id", submissionId);

  if (error) throw new Error(error.message);
  return until;
}

export async function releaseClaimReservation(submissionId: string, userId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("submissions")
    .update({
      claim_reserved_by: null,
      claim_reserved_until: null,
    })
    .eq("id", submissionId)
    .eq("claim_reserved_by", userId);
}
