import { getAppUrl } from "@/lib/payments/app-url";
import { createAdminClient } from "@/lib/supabase/server";

export async function sendSubmissionLinkedEmail(submissionId: string) {
  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, student_name, submission_code, contestant_id, campaign_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission?.contestant_id) return;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("title, slug")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", submission.contestant_id)
    .maybeSingle();

  const appUrl = getAppUrl();
  const payload = {
    to: profile?.email,
    subject: `Entry linked — ${campaign?.title ?? "Creative Wings"}`,
    studentName: submission.student_name,
    submissionCode: submission.submission_code,
    campaignTitle: campaign?.title,
    dashboardUrl: `${appUrl}/dashboard/submissions`,
    campaignUrl: campaign?.slug ? `${appUrl}/campaigns/${campaign.slug}` : appUrl,
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
<p>You have linked entry <strong>${submission.submission_code ?? ""}</strong> for <strong>${submission.student_name ?? "a participant"}</strong> in <strong>${payload.campaignTitle}</strong>.</p>
<p><a href="${payload.dashboardUrl}">View my submissions</a></p>`,
      }),
    });
    return;
  }

  await supabase.from("audit_log").insert({
    action: "email.submission_linked",
    object_type: "submission",
    object_id: submissionId,
    actor_id: submission.contestant_id,
    details: payload,
  });
}
