import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My submissions" };

export default async function MySubmissionsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from("submissions")
    .select(
      "id, status, moderation_status, created_at, score, student_name, campaigns:campaign_id(id, slug, title)",
    )
    .eq("contestant_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My submissions</h1>
        <p className="text-muted-foreground">
          Every entry you&apos;ve submitted across all campaigns.
        </p>
      </header>

      {!subs || subs.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>You haven&apos;t submitted anything yet</CardTitle>
            <CardDescription>
              <Link className="text-primary hover:underline" href="/campaigns">
                Browse campaigns
              </Link>{" "}
              to enter your first one.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y">
            {subs.map((s) => {
              const camp = Array.isArray(s.campaigns) ? s.campaigns[0] : s.campaigns;
              return (
                <li key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={camp ? `/campaigns/${camp.slug}` : "#"}
                      className="font-medium hover:underline"
                    >
                      {camp?.title ?? "Submission"}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {s.student_name ? `For ${s.student_name} · ` : ""}
                      Submitted {formatDate(s.created_at)}
                      {s.score != null ? ` · Score ${s.score}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
