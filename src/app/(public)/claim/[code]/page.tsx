import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { resolveSchoolCoupon } from "@/lib/payments/coupons";
import { CLAIM_LOCK_MINUTES } from "@/lib/schools/claim-reservation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

import { ClaimConfirmForm } from "./claim-confirm-form";

export default async function ClaimCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode).trim().toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/claim/${encodeURIComponent(code)}`);
  }

  const admin = createAdminClient();
  const { data: submission } = await admin
    .from("submissions")
    .select(
      "id, student_name, status, moderation_status, campaign_id, school_id, claim_reserved_by, claim_reserved_until, campaigns:campaign_id(title, entry_fee, currency)",
    )
    .eq("submission_code", code)
    .maybeSingle();

  if (!submission || submission.status !== "staged") notFound();
  if (submission.moderation_status !== "approved") notFound();

  const lockValid =
    submission.claim_reserved_by === user.id &&
    submission.claim_reserved_until &&
    new Date(submission.claim_reserved_until) > new Date();

  if (!lockValid) {
    redirect(`/claim?code=${encodeURIComponent(code)}`);
  }

  const campaign = Array.isArray(submission.campaigns)
    ? submission.campaigns[0]
    : submission.campaigns;
  if (!campaign) notFound();

  const schoolCoupon = await resolveSchoolCoupon(submission.campaign_id, submission.school_id);

  return (
    <div className="container max-w-lg space-y-4 py-10">
      <p className="text-sm text-muted-foreground">
        <Link href="/claim" className="hover:underline">
          ← Back to lookup
        </Link>
      </p>
      <p className="text-xs text-muted-foreground">
        Reservation held for {CLAIM_LOCK_MINUTES} minutes while you confirm.
      </p>
      <ClaimConfirmForm
        submissionId={submission.id}
        studentName={submission.student_name ?? "Participant"}
        campaignTitle={campaign.title}
        entryFee={Number(campaign.entry_fee ?? 0)}
        currency={campaign.currency ?? "MYR"}
        hasSchoolCoupon={!!schoolCoupon}
      />
    </div>
  );
}
