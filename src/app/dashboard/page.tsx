import Link from "next/link";
import { ArrowRight, Compass, ListChecks, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  if (profile.role === "business" || profile.is_admin) {
    const { data: organizer } = await supabase
      .from("organizers")
      .select("id, business_name, slug, is_listed, is_verified")
      .eq("owner_id", user.id)
      .maybeSingle();

    const { data: campaigns } = organizer
      ? await supabase
          .from("campaigns")
          .select(
            "id, slug, title, status, submission_deadline, submissions_count, kpi_target, entry_fee, currency",
          )
          .eq("organizer_id", organizer.id)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] };

    return (
      <div className="space-y-8">
        <header>
          <p className="text-sm font-medium text-muted-foreground">
            Welcome back, {profile.full_name || "friend"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {organizer?.business_name ?? "Your organisation"}
          </h1>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Live campaigns"
            value={(campaigns ?? []).filter((c) => c.status === "published").length}
            icon={<Trophy className="h-5 w-5" />}
          />
          <StatCard
            label="Submissions"
            value={(campaigns ?? []).reduce((acc, c) => acc + (c.submissions_count ?? 0), 0)}
            icon={<ListChecks className="h-5 w-5" />}
          />
          <StatCard
            label="Directory listing"
            value={organizer?.is_listed ? "Public" : "Hidden"}
            icon={<Compass className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your campaigns</CardTitle>
              <CardDescription>Latest 5 campaigns you&apos;ve created.</CardDescription>
            </div>
            <Button asChild variant="brand">
              <Link href="/dashboard/campaigns/new">New campaign</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!campaigns || campaigns.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No campaigns yet. Create your first one to start collecting submissions.
                </p>
                <Button asChild variant="brand" className="mt-4">
                  <Link href="/dashboard/campaigns/new">Create campaign</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {campaigns.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/dashboard/campaigns/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(c.entry_fee, c.currency)} ·{" "}
                        {c.submission_deadline
                          ? `Closes ${formatDate(c.submission_deadline)} · ${timeUntil(c.submission_deadline)}`
                          : "No deadline"}
                      </div>
                    </div>
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
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Contestant / creator dashboard
  const { data: subs } = await supabase
    .from("submissions")
    .select(
      "id, status, created_at, campaigns:campaign_id(id, slug, title)",
    )
    .eq("contestant_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">
          Hi {profile.full_name || "there"},
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Your creative journey</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Recent submissions</CardTitle>
          <CardDescription>Your most recent entries across all campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {!subs || subs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                You haven&apos;t submitted anything yet. Browse open campaigns to get started.
              </p>
              <Button asChild variant="brand" className="mt-4">
                <Link href="/campaigns">
                  Browse campaigns <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {subs.map((s) => {
                const camp = Array.isArray(s.campaigns) ? s.campaigns[0] : s.campaigns;
                return (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={camp ? `/campaigns/${camp.slug}` : "#"}
                        className="font-medium hover:underline"
                      >
                        {camp?.title ?? "Submission"}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        Submitted {formatDate(s.created_at)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">{s.status}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold">{value}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
