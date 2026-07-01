import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageMotion } from "@/components/site/animations/page-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, timeUntil } from "@/lib/utils";
import { SubmitEntryForm } from "./submit-entry-form";
import { submitEntryAction } from "./actions";

export const metadata = { title: "Submit your entry" };

export default async function SubmitEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/campaigns/${slug}/submit`);
  }

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, status, entry_fee, currency, submission_deadline, enable_age_brackets, enable_checkout_message, checkout_message_label, checkout_message_required, allow_multiple_submissions",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign) notFound();

  if (campaign.status !== "published") {
    return (
      <div className="container py-16">
        <Card>
          <CardHeader>
            <CardTitle>Submissions are closed</CardTitle>
            <CardDescription>
              This campaign isn&apos;t accepting submissions right now.{" "}
              <Link className="text-primary hover:underline" href={`/campaigns/${slug}`}>
                Back to campaign
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: ageBrackets } = campaign.enable_age_brackets
    ? await supabase
        .from("age_brackets")
        .select("id, label, min_age, max_age")
        .eq("campaign_id", campaign.id)
        .order("sort_order")
    : { data: [] };

  const action = submitEntryAction.bind(null, slug);

  return (
    <PageMotion>
    <div className="container py-14">
      <div data-motion="card" className="mx-auto max-w-2xl will-change-transform">
        <p data-motion="fade" className="text-sm text-muted-foreground">
          <Link href={`/campaigns/${slug}`} className="hover:underline">
            ← Back to campaign
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Submit your entry</h1>
        <p className="mt-2 text-muted-foreground">
          {campaign.title} — {formatCurrency(campaign.entry_fee, campaign.currency)} per entry ·{" "}
          {timeUntil(campaign.submission_deadline) ?? "Open"}
        </p>

        <div className="mt-8">
          <SubmitEntryForm
            action={action}
            ageBrackets={ageBrackets ?? []}
            checkoutMessage={{
              enabled: campaign.enable_checkout_message,
              label: campaign.checkout_message_label,
              required: campaign.checkout_message_required,
            }}
          />
        </div>
      </div>
    </div>
    </PageMotion>
  );
}
