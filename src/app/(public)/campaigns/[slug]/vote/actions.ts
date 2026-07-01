"use server";

import { revalidatePath } from "next/cache";

import { castVote } from "@/lib/voting/cast-vote";

export async function castVoteAction(submissionId: string, campaignSlug: string) {
  try {
    const voteCount = await castVote(submissionId);
    revalidatePath(`/campaigns/${campaignSlug}`);
    return { success: true as const, voteCount };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
