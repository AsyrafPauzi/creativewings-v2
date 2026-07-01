import Link from "next/link";
import { Plus, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";
import type { CWCampaignType } from "@/lib/supabase/database.types";

export const metadata = { title: "Campaigns" };

const CAMPAIGN_TYPE_LABEL: Record<CWCampaignType, string> = {
  competition: "Competition",
  activity: "Activity",
  workshop: "Workshop",
};

export default async function CampaignsListPage() {
  const { user } = await requireRole("organizer");
  const supabase = await createClient();

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!organizer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your organization first</CardTitle>
          <CardDescription>
            Add your organization details before creating campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/organizer">Set up organization</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, status, type, submission_deadline, submissions_count, kpi_target, entry_fee, currency",
    )
    .eq("organizer_id", organizer.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-body">Campaigns</h1>
          <p className="text-text-secondary">
            All campaigns and activities owned by {organizer.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/campaigns/import">
              <Upload className="h-4 w-4" /> Import
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/dashboard/campaigns/new">
              <Plus className="h-4 w-4" /> New campaign
            </Link>
          </Button>
        </div>
      </header>

      {!campaigns || campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No campaigns yet</CardTitle>
            <CardDescription>
              Create your first campaign to start collecting submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/campaigns/new">Create your first campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y">
            {campaigns.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    className="line-clamp-1 text-base font-bold text-body hover:text-primary"
                  >
                    {c.title}
                  </Link>
                  <div className="mt-0.5 text-xs text-text-secondary">
                    {CAMPAIGN_TYPE_LABEL[c.type as CWCampaignType] ?? c.type} ·{" "}
                    {formatCurrency(c.entry_fee, c.currency)} ·{" "}
                    {c.submissions_count ?? 0} submission
                    {c.submissions_count === 1 ? "" : "s"}
                    {c.submission_deadline ? (
                      <>
                        {" · "}
                        Closes {formatDate(c.submission_deadline)} ·{" "}
                        {timeUntil(c.submission_deadline)}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant={
                      c.status === "published"
                        ? "success"
                        : c.status === "draft"
                          ? "outline"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {c.status}
                  </Badge>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/dashboard/campaigns/${c.id}/export/json`}>Export</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/campaigns/${c.id}`}>Manage</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
