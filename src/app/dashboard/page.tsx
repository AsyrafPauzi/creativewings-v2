import Link from "next/link";
import { ArrowRight, Compass, ListChecks, Trophy, Folder, Eye, Sparkles } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  if (profile.role === "organizer") {
    const { data: organizer } = await supabase
      .from("organizers")
      .select("id, name, slug, is_listed, is_verified")
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
          .limit(6)
      : { data: [] };

    const liveCampaigns = (campaigns ?? []).filter((c) => c.status === "published").length;
    const totalSubmissions = (campaigns ?? []).reduce((acc, c) => acc + (c.submissions_count ?? 0), 0);

    return (
      <div className="space-y-8">
        <header className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-text-muted">Welcome back, {profile.full_name || "friend"}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
              {organizer?.name ?? "Your organization"}
            </h1>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/campaigns/new">+ New campaign</Link>
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Live campaigns" value={liveCampaigns} icon={<Trophy className="h-5 w-5" />} tone="primary" />
          <StatCard label="Submissions" value={totalSubmissions.toLocaleString()} icon={<ListChecks className="h-5 w-5" />} tone="secondary" />
          <StatCard
            label="Public listing"
            value={organizer?.is_listed ? "Public" : "Hidden"}
            icon={<Compass className="h-5 w-5" />}
            tone={organizer?.is_listed ? "success" : "warning"}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your campaigns</CardTitle>
              <CardDescription>The latest campaigns you&apos;ve created.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/campaigns">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!campaigns || campaigns.length === 0 ? (
              <EmptyState
                title="No campaigns yet"
                body="Create your first campaign to start collecting submissions."
                cta={{ label: "Create campaign", href: "/dashboard/campaigns/new" }}
              />
            ) : (
              <ul className="divide-y">
                {campaigns.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/dashboard/campaigns/${c.id}`} className="line-clamp-1 font-bold text-body hover:text-primary">
                        {c.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-text-secondary">
                        {formatCurrency(c.entry_fee, c.currency)} ·{" "}
                        {c.submission_deadline
                          ? `Closes ${formatDate(c.submission_deadline)} · ${timeUntil(c.submission_deadline) ?? "—"}`
                          : "No deadline"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-text-muted">{c.submissions_count} subs</span>
                      <Badge
                        variant={c.status === "published" ? "success" : c.status === "draft" ? "outline" : "secondary"}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Creator + Contestant dashboard
  const { data: subs } = await supabase
    .from("submissions")
    .select("id, status, created_at, campaigns:campaign_id(id, slug, title, banner_url)")
    .eq("contestant_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  let portfolio: { id: string; views_count: number; likes_count: number; is_published: boolean }[] | null = null;
  if (profile.role === "creator") {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (creator) {
      const { data: projects } = await supabase
        .from("portfolio_projects")
        .select("id, views_count, likes_count, is_published")
        .eq("creator_id", creator.id);
      portfolio = projects ?? [];
    }
  }

  const totalViews = (portfolio ?? []).reduce((a, p) => a + p.views_count, 0);
  const totalLikes = (portfolio ?? []).reduce((a, p) => a + p.likes_count, 0);
  const totalProjects = (portfolio ?? []).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-text-muted">Hi {profile.full_name || "there"},</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
          Your creative journey
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Submissions" value={(subs ?? []).length} icon={<ListChecks className="h-5 w-5" />} tone="primary" />
        {profile.role === "creator" ? (
          <>
            <StatCard label="Portfolio views" value={totalViews.toLocaleString()} icon={<Eye className="h-5 w-5" />} tone="secondary" />
            <StatCard label="Portfolio projects" value={`${totalProjects}`} icon={<Folder className="h-5 w-5" />} tone="success" />
          </>
        ) : (
          <>
            <StatCard label="Badges earned" value="0" icon={<Sparkles className="h-5 w-5" />} tone="warning" />
            <StatCard label="Wallet balance" value="RM 0.00" icon={<Compass className="h-5 w-5" />} tone="success" />
          </>
        )}
      </div>

      {profile.role === "creator" && totalLikes > 0 && (
        <p className="text-sm text-text-secondary">Your portfolio earned {totalLikes.toLocaleString()} likes — keep creating!</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent submissions</CardTitle>
          <CardDescription>Your most recent entries across all campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {!subs || subs.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              body="Browse open campaigns and submit your first entry."
              cta={{ label: "Browse campaigns", href: "/campaigns" }}
            />
          ) : (
            <ul className="divide-y">
              {subs.map((s) => {
                const camp = Array.isArray(s.campaigns) ? s.campaigns[0] : s.campaigns;
                return (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <Link href={camp ? `/campaigns/${camp.slug}` : "#"} className="line-clamp-1 font-bold text-body hover:text-primary">
                        {camp?.title ?? "Submission"}
                      </Link>
                      <div className="text-xs text-text-secondary">Submitted {formatDate(s.created_at)}</div>
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

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="rounded-md border border-dashed bg-surface p-8 text-center">
      <p className="text-base font-bold text-body">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{body}</p>
      <Button asChild className="mt-4">
        <Link href={cta.href}>
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
