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

  const { data: certs } = await supabase
    .from("issued_certificates")
    .select("id, submission_id")
    .eq("user_id", user.id);

  const certBySub = new Map((certs ?? []).map((c) => [c.submission_id, c.id]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">My submissions</h1>
        <p className="text-text-secondary">
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
              const certId = certBySub.get(s.id);
              return (
                <li key={s.id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <Link
                      href={camp ? `/campaigns/${camp.slug}` : "#"}
                      className="font-bold text-body hover:text-primary"
                    >
                      {camp?.title ?? "Submission"}
                    </Link>
                    <div className="text-xs text-text-muted">
                      {s.student_name ? `For ${s.student_name} · ` : ""}
                      Submitted {formatDate(s.created_at)}
                      {s.score != null ? ` · Score ${s.score}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
                    {certId ? (
                      <Link
                        href={`/api/certificates/${certId}/download`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Download certificate
                      </Link>
                    ) : null}
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
