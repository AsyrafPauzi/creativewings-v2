import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function CampaignSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  await requireRole("organizer");
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!campaign) notFound();

  let query = supabase
    .from("submissions")
    .select(
      "id, student_name, status, moderation_status, created_at, score, rank, vote_count, profiles:contestant_id(full_name, email)",
    )
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false });

  if (filter === "shortlisted") {
    query = query.eq("status", "shortlisted");
  } else if (filter === "winners") {
    query = query.eq("status", "winner");
  } else if (filter === "approved") {
    query = query.eq("moderation_status", "approved");
  }

  const { data: submissions } = await query;

  const tabs = [
    { key: undefined, label: "All" },
    { key: "approved", label: "Approved" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "winners", label: "Winners" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href={`/dashboard/campaigns/${campaign.id}`} className="hover:underline">
            ← Back to {campaign.title}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Submissions</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.label}
            asChild
            size="sm"
            variant={(filter ?? undefined) === tab.key || (!filter && !tab.key) ? "default" : "outline"}
          >
            <Link
              href={
                tab.key
                  ? `/dashboard/campaigns/${campaign.id}/submissions?filter=${tab.key}`
                  : `/dashboard/campaigns/${campaign.id}/submissions`
              }
            >
              {tab.label}
            </Link>
          </Button>
        ))}
      </div>

      {!submissions || submissions.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No submissions yet</CardTitle>
            <CardDescription>
              When contestants enter your campaign, their submissions appear here for review.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y">
            {submissions.map((s) => {
              const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-medium">
                      {s.student_name || p?.full_name || p?.email || "Anonymous"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Submitted {formatDate(s.created_at)}
                      {s.score != null ? ` · Score ${s.score}` : ""}
                      {s.rank != null ? ` · Rank ${s.rank}` : ""}
                      {` · ${s.vote_count ?? 0} votes`}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="capitalize">{s.status}</Badge>
                    <Badge
                      variant={
                        s.moderation_status === "approved"
                          ? "success"
                          : s.moderation_status === "rejected"
                            ? "destructive"
                            : "warning"
                      }
                      className="capitalize"
                    >
                      {s.moderation_status}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/campaigns/${campaign.id}/submissions/${s.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
