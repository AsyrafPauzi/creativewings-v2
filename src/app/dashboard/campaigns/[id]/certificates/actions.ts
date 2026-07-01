"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { issueCertificate } from "@/lib/certificates/issue";
import { sendCertificateReadyEmail } from "@/lib/email/send-certificate-ready";
import { requireRole } from "@/lib/auth";
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
    .select("id, organizer_id, enable_certificate")
    .eq("id", campaignId)
    .maybeSingle();
  if (!campaign || campaign.organizer_id !== org.id) notFound();

  return { supabase, campaign };
}

const ELIGIBLE = ["paid", "approved", "shortlisted", "winner"];

export async function generateCertificateAction(campaignId: string, submissionId: string) {
  await assertCampaignOwner(campaignId);
  await issueCertificate(submissionId);
  revalidatePath(`/dashboard/campaigns/${campaignId}/certificates`);
}

export async function generateAllCertificatesAction(campaignId: string) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const { data: subs } = await supabase
    .from("submissions")
    .select("id")
    .eq("campaign_id", campaignId)
    .eq("moderation_status", "approved")
    .in("status", ELIGIBLE)
    .not("contestant_id", "is", null);

  for (const sub of subs ?? []) {
    try {
      await issueCertificate(sub.id);
    } catch {
      // skip ineligible rows
    }
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/certificates`);
}

export async function emailCertificateAction(campaignId: string, certificateId: string) {
  await assertCampaignOwner(campaignId);
  await sendCertificateReadyEmail(certificateId);
  revalidatePath(`/dashboard/campaigns/${campaignId}/certificates`);
}

export async function emailAllCertificatesAction(campaignId: string) {
  const { supabase } = await assertCampaignOwner(campaignId);

  const { data: certs } = await supabase
    .from("issued_certificates")
    .select("id")
    .eq("campaign_id", campaignId);

  for (const cert of certs ?? []) {
    await sendCertificateReadyEmail(cert.id);
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/certificates`);
}
