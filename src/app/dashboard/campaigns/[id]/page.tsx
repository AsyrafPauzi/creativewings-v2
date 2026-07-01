import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { CampaignChildrenPanel } from "@/components/campaigns/campaign-children-form";
import { DesignConfigPanel } from "@/components/campaigns/design-config-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getPlatformSettings } from "@/lib/platform/settings";
import { createClient } from "@/lib/supabase/server";
import { loadSubCategories } from "@/lib/sub-categories";
import { setCampaignStatusAction, updateCampaignAction } from "../actions";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("organizer");
  const supabase = await createClient();
  const subCategories = await loadSubCategories();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!campaign) notFound();

  const [
    { data: prizes },
    { data: faqItems },
    { data: ageBrackets },
    { data: customFields },
    { data: designVariants },
  ] = await Promise.all([
    supabase.from("prizes").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("faq_items").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("age_brackets").select("*").eq("campaign_id", id).order("sort_order"),
    supabase.from("custom_fields").select("*").eq("campaign_id", id).order("sort_order"),
    campaign.enable_design
      ? supabase.from("design_variants").select("*").eq("campaign_id", id).order("sort_order")
      : Promise.resolve({ data: [] }),
  ]);

  const action = updateCampaignAction.bind(null, campaign.id);
  const isPublished = campaign.status === "published";
  const isPending = campaign.status === "pending";
  const settings = await getPlatformSettings();
  const publishLabel = settings.require_campaign_approval ? "Submit for review" : "Publish";

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/dashboard/campaigns" className="hover:underline">
              ← Back to campaigns
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{campaign.title}</h1>
            <Badge
              variant={
                isPublished
                  ? "success"
                  : isPending
                    ? "secondary"
                    : campaign.status === "draft"
                      ? "outline"
                      : "secondary"
              }
              className="capitalize"
            >
              {isPending ? "Awaiting admin approval" : campaign.status}
            </Badge>
          </div>
          {isPublished && (
            <p className="text-sm text-muted-foreground">
              Public link:{" "}
              <Link href={`/campaigns/${campaign.slug}`} className="text-primary hover:underline">
                /campaigns/{campaign.slug}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isPublished && !isPending ? (
            <form action={async () => {
              "use server";
              await setCampaignStatusAction(campaign.id, "published");
            }}>
              <Button type="submit">{publishLabel}</Button>
            </form>
          ) : isPublished ? (
            <form action={async () => {
              "use server";
              await setCampaignStatusAction(campaign.id, "closed");
            }}>
              <Button type="submit" variant="outline">Close campaign</Button>
            </form>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/campaigns/${campaign.id}/export/json`}>Export JSON</Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {campaign.submissions_count} submissions received so far.
            {campaign.kpi_target ? ` · Target ${campaign.kpi_target}.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/campaigns/${campaign.id}/submissions`}>
              View submissions
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/campaigns/${campaign.id}/schools`}>
              Schools & coupons
            </Link>
          </Button>
          {campaign.enable_certificate ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/campaigns/${campaign.id}/certificates`}>
                Certificates
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <CampaignForm
        action={action}
        defaults={campaign}
        submitLabel="Save changes"
        subCategories={subCategories}
      />

      <CampaignChildrenPanel
        campaignId={campaign.id}
        enableAgeBrackets={!!campaign.enable_age_brackets}
        prizes={prizes ?? []}
        faqItems={faqItems ?? []}
        ageBrackets={ageBrackets ?? []}
        customFields={customFields ?? []}
        bannerUrl={campaign.banner_url}
        heroUrl={campaign.hero_url}
      />

      {campaign.enable_design ? (
        <DesignConfigPanel campaignId={campaign.id} variants={designVariants ?? []} />
      ) : null}
    </div>
  );
}
