import { getAppUrl } from "@/lib/payments/app-url";
import { createAdminClient } from "@/lib/supabase/server";

export async function sendArtworkReadyEmail(submissionId: string) {
  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "id, student_name, submission_code, guardian_name, guardian_contact, guardian_email, campaign_id",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission?.submission_code) return;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("title")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  const appUrl = getAppUrl();
  const claimUrl = `${appUrl}/claim?code=${encodeURIComponent(submission.submission_code)}`;
  const to = submission.guardian_email?.trim() || null;

  const payload = {
    to,
    subject: `Your child's artwork is ready to claim — ${campaign?.title ?? "Creative Wings"}`,
    studentName: submission.student_name,
    submissionCode: submission.submission_code,
    claimUrl,
    campaignTitle: campaign?.title,
  };

  if (process.env.RESEND_API_KEY && to) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "Creative Wings <noreply@creativewings.my>",
        to,
        subject: payload.subject,
        html: `<p>Hi ${submission.guardian_name ?? "there"},</p>
<p>Artwork for <strong>${submission.student_name ?? "your child"}</strong> in <strong>${payload.campaignTitle}</strong> is ready to claim.</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:2px">${submission.submission_code}</p>
<p><a href="${claimUrl}">Claim this entry</a></p>`,
      }),
    });
    return;
  }

  await supabase.from("audit_log").insert({
    action: "email.artwork_ready",
    object_type: "submission",
    object_id: submissionId,
    details: payload,
  });
}
