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
      "id, slug, title, status, entry_fee, currency, submission_deadline, enable_age_brackets, enable_checkout_message, checkout_message_label, checkout_message_required, allow_multiple_submissions, enable_design, design_picker_label, design_artwork_w, design_artwork_h",
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

  const [{ data: ageBrackets }, { data: customFields }, { data: designVariants }] =
    await Promise.all([
      campaign.enable_age_brackets
        ? supabase
            .from("age_brackets")
            .select("id, label, min_age, max_age")
            .eq("campaign_id", campaign.id)
            .order("sort_order")
        : Promise.resolve({ data: [] }),
      supabase
        .from("custom_fields")
        .select("*")
        .eq("campaign_id", campaign.id)
        .order("sort_order"),
      campaign.enable_design
        ? supabase
            .from("design_variants")
            .select("*")
            .eq("campaign_id", campaign.id)
            .eq("is_active", true)
            .order("sort_order")
        : Promise.resolve({ data: [] }),
    ]);

  const action = submitEntryAction.bind(null, slug);
  const useDesignFlow =
    campaign.enable_design && designVariants && designVariants.length > 0;

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
            customFields={customFields ?? []}
            enableDesign={!!campaign.enable_design}
            designMode={useDesignFlow}
            designVariants={designVariants ?? []}
            designPickerLabel={campaign.design_picker_label}
            designArtworkW={campaign.design_artwork_w}
            designArtworkH={campaign.design_artwork_h}
            entryFee={Number(campaign.entry_fee ?? 0)}
            currency={campaign.currency ?? "MYR"}
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
