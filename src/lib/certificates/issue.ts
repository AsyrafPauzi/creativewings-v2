import { onCertificateIssued } from "@/lib/badges/hooks";
import { generateCertificatePng } from "@/lib/certificates/generate";
import { parseCertificateLayout } from "@/lib/certificates/layout";
import { sendCertificateReadyEmail } from "@/lib/email/send-certificate-ready";
import { createAdminClient } from "@/lib/supabase/server";

export async function issueCertificate(submissionId: string, opts?: { skipEmail?: boolean }) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("issued_certificates")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (existing) return { id: existing.id, alreadyIssued: true as const };

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, student_name, contestant_id, campaign_id, status, moderation_status")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission?.contestant_id) {
    throw new Error("Submission has no linked contestant.");
  }

  const eligible = ["paid", "approved", "shortlisted", "winner"];
  if (!eligible.includes(submission.status) || submission.moderation_status !== "approved") {
    throw new Error("Submission is not eligible for a certificate.");
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, enable_certificate, certificate_template_url, certificate_layout")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  if (!campaign?.enable_certificate) throw new Error("Certificates are not enabled for this campaign.");
  if (!campaign.certificate_template_url) {
    throw new Error("Upload a certificate template first.");
  }

  const png = await generateCertificatePng({
    templateUrl: campaign.certificate_template_url,
    layout: parseCertificateLayout(campaign.certificate_layout),
    studentName: submission.student_name ?? "Participant",
    campaignTitle: campaign.title,
    issuedAt: new Date(),
  });

  const storagePath = `${submission.contestant_id}/${campaign.id}-${submission.id}.png`;
  const { error: uploadErr } = await supabase.storage
    .from("certificates")
    .upload(storagePath, png, { contentType: "image/png", upsert: true });
  if (uploadErr) throw new Error(uploadErr.message);

  const { data: cert, error: insertErr } = await supabase
    .from("issued_certificates")
    .insert({
      campaign_id: campaign.id,
      submission_id: submission.id,
      user_id: submission.contestant_id,
      storage_path: storagePath,
      format: "png",
    })
    .select("id")
    .single();

  if (insertErr || !cert) throw new Error(insertErr?.message ?? "Could not save certificate record.");

  await onCertificateIssued(submission.contestant_id, campaign.id);

  if (!opts?.skipEmail) {
    await sendCertificateReadyEmail(cert.id);
  }

  return { id: cert.id, alreadyIssued: false as const };
}
