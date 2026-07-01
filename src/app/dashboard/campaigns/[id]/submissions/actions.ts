"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { onWinnerOrShortlist } from "@/lib/badges/hooks";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CWSubmissionStatus } from "@/lib/supabase/database.types";

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

  return { supabase, user };
}

export async function saveReviewAction(campaignId: string, subId: string, formData: FormData) {
  const { supabase, user } = await assertCampaignOwner(campaignId);

  const moderationNote = String(formData.get("moderation_note") ?? "").trim() || null;
  const judgeComment = String(formData.get("judge_comment") ?? "").trim() || null;
  const scoreRaw = String(formData.get("score") ?? "").trim();
  const score = scoreRaw ? parseFloat(scoreRaw) : null;
  const rankRaw = String(formData.get("rank") ?? "").trim();
  const rank = rankRaw ? parseInt(rankRaw, 10) : null;

  await supabase
    .from("submissions")
    .update({
      moderation_note: moderationNote,
      judge_comment: judgeComment,
      score,
      rank: Number.isFinite(rank) ? rank : null,
    })
    .eq("id", subId)
    .eq("campaign_id", campaignId);

  await writeAuditLog({
    action: "submission.review_saved",
    objectType: "submission",
    objectId: subId,
    actorId: user.id,
    details: { campaign_id: campaignId, score, rank },
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions/${subId}`);
}

export async function setSubmissionStatusAction(
  campaignId: string,
  subId: string,
  status: CWSubmissionStatus,
) {
  const { supabase, user } = await assertCampaignOwner(campaignId);

  const { data: sub } = await supabase
    .from("submissions")
    .select("id, contestant_id, moderation_status")
    .eq("id", subId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!sub) return;

  const payload: Record<string, unknown> = { status };

  if (status === "approved") {
    payload.moderation_status = "approved";
  } else if (status === "rejected") {
    payload.moderation_status = "rejected";
  } else if (status === "shortlisted" || status === "winner") {
    payload.moderation_status = "approved";
  }

  await supabase.from("submissions").update(payload).eq("id", subId);

  if (sub.contestant_id && (status === "shortlisted" || status === "winner")) {
    await onWinnerOrShortlist(sub.contestant_id, campaignId);
  }

  await writeAuditLog({
    action: "submission.status_changed",
    objectType: "submission",
    objectId: subId,
    actorId: user.id,
    details: { campaign_id: campaignId, status },
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions`);
  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions/${subId}`);
  revalidatePath("/winners");
}
