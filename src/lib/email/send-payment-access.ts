import { createAdminClient } from "@/lib/supabase/server";

export async function sendPaymentAccessEmail(submissionId: string) {
  const supabase = createAdminClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select("id, student_name, contestant_id, campaign_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission?.contestant_id) return;

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("title, slug, event_mode, location_details")
    .eq("id", submission.campaign_id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", submission.contestant_id)
    .maybeSingle();

  const payload = {
    to: profile?.email,
    subject: `Entry confirmed — ${campaign?.title ?? "Creative Wings"}`,
    campaignTitle: campaign?.title,
    campaignSlug: campaign?.slug,
    studentName: submission.student_name,
    onlineAccess:
      campaign?.event_mode === "online" ? campaign.location_details : null,
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
<p>Your entry for <strong>${payload.campaignTitle}</strong> is confirmed.</p>
${payload.onlineAccess ? `<p>Online access: ${payload.onlineAccess}</p>` : ""}
<p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/campaigns/${payload.campaignSlug}">View campaign</a></p>`,
      }),
    });
    return;
  }

  await supabase.from("audit_log").insert({
    action: "email.payment_access",
    object_type: "submission",
    object_id: submissionId,
    actor_id: submission.contestant_id,
    details: payload,
  });
}
