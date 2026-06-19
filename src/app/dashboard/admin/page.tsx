import Link from "next/link";
import { redirect } from "next/navigation";
import { Megaphone, ShieldCheck, Users, Trophy, AlertCircle, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin overview" };

export default async function AdminPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ count: totalUsers }, { count: orgs }, { count: liveCampaigns }, { count: pendingSubs }, { data: recentLog }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("organizers").select("id", { count: "exact", head: true }),
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
      supabase.from("audit_log").select("id, action, object_type, object_id, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

  return (
    <div className="space-y-8">
      <header>
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Admin</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
          Platform overview
        </h1>
        <p className="text-text-secondary">Health, moderation queue, and audit log at a glance.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Total users" value={(totalUsers ?? 0).toLocaleString()} icon={<Users className="h-5 w-5" />} />
        <Stat label="Organizations" value={(orgs ?? 0).toLocaleString()} icon={<ShieldCheck className="h-5 w-5" />} />
        <Stat label="Live campaigns" value={(liveCampaigns ?? 0).toLocaleString()} icon={<Trophy className="h-5 w-5" />} />
        <Stat
          label="Pending review"
          value={(pendingSubs ?? 0).toLocaleString()}
          icon={<AlertCircle className="h-5 w-5" />}
          tone={(pendingSubs ?? 0) > 0 ? "warning" : "primary"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Moderation queue</CardTitle>
              <CardDescription>Submissions awaiting moderator action.</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/admin/moderation">Open queue <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              {(pendingSubs ?? 0) === 0
                ? "All caught up. No items awaiting review."
                : `${pendingSubs} submission${pendingSubs === 1 ? "" : "s"} waiting for review.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Users</CardTitle>
              <CardDescription>Browse, filter, and manage users.</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/admin/users">Manage users <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">View all roles, role transitions, and admin status.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Most recent platform-wide events.</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentLog || recentLog.length === 0 ? (
            <p className="text-sm text-text-secondary">No events recorded yet.</p>
          ) : (
            <ul className="divide-y">
              {recentLog.map((row) => (
                <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-bold text-body">{row.action}</span>
                    <span className="ml-2 text-text-muted">on {row.object_type}</span>
                  </div>
                  <Badge variant="outline">{formatDate(row.created_at, { dateStyle: "medium", timeStyle: "short" })}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "primary" | "success" | "warning";
}) {
  const toneClass = {
    primary: "bg-brand-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
          <div className="mt-1 text-2xl font-extrabold text-body">{value}</div>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-md ${toneClass}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
