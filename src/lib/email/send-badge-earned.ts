import { getAppUrl } from "@/lib/payments/app-url";
import { createAdminClient } from "@/lib/supabase/server";

export async function sendBadgeEarnedEmail(userId: string, badgeName: string, badgeSlug: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, consent_badge_emails")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.consent_badge_emails || !profile.email) return;

  const appUrl = getAppUrl();
  const payload = {
    to: profile.email,
    subject: `Badge unlocked — ${badgeName}`,
    badgeName,
    badgeSlug,
    badgesUrl: `${appUrl}/dashboard/badges`,
  };

  if (process.env.RESEND_API_KEY) {
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
<p>Congratulations! You earned the <strong>${badgeName}</strong> badge on Creative Wings.</p>
<p><a href="${payload.badgesUrl}">View your badges</a></p>`,
      }),
    });
    return;
  }

  await supabase.from("audit_log").insert({
    action: "email.badge_earned",
    object_type: "profile",
    object_id: userId,
    actor_id: userId,
    details: payload,
  });
}
