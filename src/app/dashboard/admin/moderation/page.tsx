import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Moderation queue" };

export default async function ModerationQueuePage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("submissions")
    .select(
      "id, status, moderation_status, created_at, student_name, campaigns:campaign_id(id, slug, title), profiles:contestant_id(full_name, email)",
    )
    .eq("moderation_status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Moderation queue</h1>
        <p className="text-text-secondary">All submissions awaiting moderator review.</p>
      </header>

      {!pending || pending.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>All caught up</CardTitle>
            <CardDescription>No submissions are waiting for review.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {pending.map((s) => {
                const camp = Array.isArray(s.campaigns) ? s.campaigns[0] : s.campaigns;
                const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
                return (
                  <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <Link
                        href={camp ? `/dashboard/campaigns/${camp.id}/submissions/${s.id}` : "#"}
                        className="line-clamp-1 font-bold text-body hover:text-primary"
                      >
                        {camp?.title ?? "Submission"}
                      </Link>
                      <div className="text-xs text-text-muted">
                        Submitted by {s.student_name || p?.full_name || p?.email || "Anonymous"} · {formatDate(s.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="warning">Pending</Badge>
                      <Button asChild size="sm" variant="outline">
                        <Link href={camp ? `/dashboard/campaigns/${camp.id}/submissions/${s.id}` : "#"}>Review</Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
