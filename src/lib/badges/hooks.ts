import { evaluateBadgesForUser } from "@/lib/badges/engine";

export async function onSubmissionPaid(userId: string, campaignId: string) {
  return evaluateBadgesForUser(userId, campaignId);
}

export async function onWinnerOrShortlist(userId: string, campaignId: string) {
  return evaluateBadgesForUser(userId, campaignId);
}

export async function onCertificateIssued(userId: string, campaignId: string) {
  return evaluateBadgesForUser(userId, campaignId);
}

export async function onCampaignPublished(ownerId: string) {
  return evaluateBadgesForUser(ownerId);
}
