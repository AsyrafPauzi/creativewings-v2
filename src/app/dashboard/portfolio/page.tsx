import Link from "next/link";
import { Eye, Heart, Plus, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, slug, display_name, is_listed, profile_image_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!creator) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Become a creator first</CardTitle>
          <CardDescription>
            Switch your role to Creator in onboarding to unlock the Behance-style portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/onboarding">Continue onboarding</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("id, slug, title, cover_url, description, tags, sdg_goals, views_count, likes_count, is_published, published_at, sort_order, updated_at")
    .eq("creator_id", creator.id)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  const totalViews = (projects ?? []).reduce((a, p) => a + (p.views_count ?? 0), 0);
  const totalLikes = (projects ?? []).reduce((a, p) => a + (p.likes_count ?? 0), 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-text-muted">Hi {profile.full_name || "creator"},</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
            My portfolio
          </h1>
          <p className="mt-1 text-text-secondary">
            Manage your Behance-style public portfolio at{" "}
            <Link href={`/profile/${creator.slug}`} className="font-bold text-primary hover:underline">
              /profile/{creator.slug} <ExternalLink className="inline h-3 w-3" />
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/profile/${creator.slug}`}>View public profile</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/portfolio/new">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Projects" value={(projects ?? []).length.toString()} />
        <StatCard label="Total views" value={totalViews.toLocaleString()} icon={<Eye className="h-5 w-5" />} />
        <StatCard label="Total likes" value={totalLikes.toLocaleString()} icon={<Heart className="h-5 w-5" />} />
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription>
              Add your first portfolio project. Cover image + description + tools — like Behance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/portfolio/new">
                <Plus className="h-4 w-4" /> Create your first project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div
                className="aspect-[4/3] w-full bg-surface bg-cover bg-center"
                style={p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : undefined}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={p.is_published ? "success" : "outline"}>
                    {p.is_published ? "Published" : "Draft"}
                  </Badge>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.views_count}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {p.likes_count}</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                {p.description && <CardDescription className="line-clamp-2">{p.description}</CardDescription>}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <div className="text-xs text-text-muted">
                  Updated {formatDate(p.updated_at)}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/portfolio/${p.id}`}>Edit</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{label}</div>
          <div className="mt-1 text-2xl font-extrabold text-body">{value}</div>
        </div>
        {icon && <div className="grid h-12 w-12 place-items-center rounded-md bg-brand-soft text-primary">{icon}</div>}
      </CardContent>
    </Card>
  );
}
