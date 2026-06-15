import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setCampaignStatusAction, updateCampaignAction } from "../actions";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole("business");
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!campaign) notFound();

  const action = updateCampaignAction.bind(null, campaign.id);
  const isPublished = campaign.status === "published";

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
              variant={isPublished ? "success" : campaign.status === "draft" ? "outline" : "secondary"}
              className="capitalize"
            >
              {campaign.status}
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
          {!isPublished ? (
            <form action={async () => {
              "use server";
              await setCampaignStatusAction(campaign.id, "published");
            }}>
              <Button type="submit" variant="brand">Publish</Button>
            </form>
          ) : (
            <form action={async () => {
              "use server";
              await setCampaignStatusAction(campaign.id, "closed");
            }}>
              <Button type="submit" variant="outline">Close campaign</Button>
            </form>
          )}
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
        </CardContent>
      </Card>

      <CampaignForm action={action} defaults={campaign} submitLabel="Save changes" />
    </div>
  );
}
