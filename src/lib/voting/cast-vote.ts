import { createAdminClient } from "@/lib/supabase/server";

import { getVoterHash } from "./voter-hash";

const VOTABLE_STATUSES = ["paid", "approved", "shortlisted", "winner"] as const;

export async function castVote(submissionId: string) {
  const supabase = createAdminClient();
  const voterHash = await getVoterHash();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, campaign_id, status, moderation_status, vote_count")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) throw new Error("Entry not found.");
  if (submission.moderation_status !== "approved") {
    throw new Error("This entry is not open for voting yet.");
  }
  if (!VOTABLE_STATUSES.includes(submission.status as (typeof VOTABLE_STATUSES)[number])) {
    throw new Error("This entry is not eligible for voting.");
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, enable_voting, vote_limit_per_user, review_start, final_event_date")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  if (!campaign?.enable_voting) throw new Error("Voting is not enabled for this campaign.");

  const now = new Date();
  if (campaign.review_start && new Date(campaign.review_start) > now) {
    throw new Error("Voting has not opened yet.");
  }
  if (campaign.final_event_date && new Date(campaign.final_event_date) < now) {
    throw new Error("Voting has closed.");
  }

  const limit = campaign.vote_limit_per_user ?? 1;

  const { data: campaignSubmissions } = await supabase
    .from("submissions")
    .select("id")
    .eq("campaign_id", submission.campaign_id);

  const submissionIds = (campaignSubmissions ?? []).map((s) => s.id);
  if (submissionIds.length === 0) throw new Error("No entries in this campaign.");

  const { count: votesInCampaign } = await supabase
    .from("public_votes")
    .select("id", { count: "exact", head: true })
    .eq("voter_hash", voterHash)
    .in("submission_id", submissionIds);

  if ((votesInCampaign ?? 0) >= limit) {
    throw new Error(
      limit === 1
        ? "You have already used your vote in this campaign."
        : `You can only cast ${limit} vote(s) in this campaign.`,
    );
  }

  const { error } = await supabase.from("public_votes").insert({
    submission_id: submissionId,
    voter_hash: voterHash,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already voted for this entry.");
    }
    throw new Error(error.message);
  }

  const { data: updated } = await supabase
    .from("submissions")
    .select("vote_count")
    .eq("id", submissionId)
    .single();

  return updated?.vote_count ?? (submission.vote_count ?? 0) + 1;
}
