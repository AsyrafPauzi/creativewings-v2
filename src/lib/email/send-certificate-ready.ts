import { getAppUrl } from "@/lib/payments/app-url";
import { createAdminClient } from "@/lib/supabase/server";

export async function sendCertificateReadyEmail(certificateId: string) {
  const supabase = createAdminClient();

  const { data: cert } = await supabase
    .from("issued_certificates")
    .select("id, user_id, campaign_id, submission_id")
    .eq("id", certificateId)
    .maybeSingle();

  if (!cert) return;

  const [{ data: campaign }, { data: submission }, { data: profile }] = await Promise.all([
    supabase.from("campaigns").select("title").eq("id", cert.campaign_id).maybeSingle(),
    supabase.from("submissions").select("student_name").eq("id", cert.submission_id).maybeSingle(),
    supabase.from("profiles").select("email, full_name").eq("id", cert.user_id).maybeSingle(),
  ]);

  const appUrl = getAppUrl();
  const downloadUrl = `${appUrl}/api/certificates/${cert.id}/download`;
  const payload = {
    to: profile?.email,
    subject: `Your certificate is ready — ${campaign?.title ?? "Creative Wings"}`,
    campaignTitle: campaign?.title,
    studentName: submission?.student_name,
    downloadUrl,
  };

  if (process.env.RESEND_API_KEY && profile?.email) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "Creative Wings <noreply@creativewings.my>",
        to: profile.email,
        subject: payload.subject,
        html: `<p>Hi ${profile.full_name ?? "there"},</p>
<p>Your certificate for <strong>${campaign?.title}</strong>${submission?.student_name ? ` (${submission.student_name})` : ""} is ready to download.</p>
<p><a href="${downloadUrl}">Download certificate</a></p>`,
      }),
    });
    await supabase
      .from("issued_certificates")
      .update({ emailed_at: new Date().toISOString() })
      .eq("id", certificateId);
    return;
  }

  await supabase.from("audit_log").insert({
    action: "email.certificate_ready",
    object_type: "issued_certificate",
    object_id: certificateId,
    actor_id: cert.user_id,
    details: payload,
  });
}
