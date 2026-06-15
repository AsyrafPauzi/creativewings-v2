import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export const metadata = { title: "Campaigns" };

export default async function CampaignsListPage() {
  const { user } = await requireRole("business");
  const supabase = await createClient();

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!organizer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Set up your organisation first</CardTitle>
          <CardDescription>
            Add your organisation details before creating campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="brand">
            <Link href="/dashboard/organizer">Set up organisation</Link>
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
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            All campaigns and activities owned by {organizer.business_name}.
          </p>
        </div>
        <Button asChild variant="brand">
          <Link href="/dashboard/campaigns/new">
            <Plus className="h-4 w-4" /> New campaign
          </Link>
        </Button>
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
            <Button asChild variant="brand">
              <Link href="/dashboard/campaigns/new">Create your first campaign</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y">
            {campaigns.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/campaigns/${c.id}`}
                    className="text-base font-medium hover:underline"
                  >
                    {c.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {c.type === "competition" ? "Competition" : "Activity"} ·{" "}
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
                <div className="flex items-center gap-3">
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
