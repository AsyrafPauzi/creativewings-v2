import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate, timeUntil } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizers")
    .select("business_name, about")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.business_name ?? "Organiser", description: data?.about ?? undefined };
}

export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizers")
    .select(
      "id, slug, business_name, logo_url, banner_url, industry, about, website, email, phone, city, country, is_verified, facebook_url, instagram_url, linkedin_url, youtube_url, tiktok_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!org) notFound();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, type, status, submission_deadline, submissions_count, kpi_target",
    )
    .eq("organizer_id", org.id)
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true });

  return (
    <div>
      <div
        className="h-56 cw-gradient-bg bg-cover bg-center md:h-72"
        style={org.banner_url ? { backgroundImage: `url(${org.banner_url})` } : undefined}
      />
      <div className="container -mt-16 pb-10 md:-mt-20">
        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-background text-lg font-bold text-primary shadow-sm">
              {org.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logo_url} alt={org.business_name} className="h-full w-full object-cover" />
              ) : (
                org.business_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
                {org.business_name}
                {org.is_verified && <Badge variant="success">Verified</Badge>}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {org.industry && <span>{org.industry}</span>}
                {(org.city || org.country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[org.city, org.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {org.website && (
                  <a
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
          {org.about && <p className="mt-6 max-w-3xl text-muted-foreground">{org.about}</p>}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
            <span className="text-sm text-muted-foreground">
              {campaigns?.length ?? 0} total
            </span>
          </div>

          {!campaigns || campaigns.length === 0 ? (
            <Card className="mt-6 border-dashed">
              <CardHeader>
                <CardTitle>No campaigns yet</CardTitle>
                <CardDescription>
                  This organiser hasn&apos;t published any campaigns yet.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <Link key={c.id} href={`/campaigns/${c.slug}`} className="group">
                  <Card className="overflow-hidden transition-shadow group-hover:shadow-lg">
                    <div
                      className="h-32 cw-gradient-bg bg-cover bg-center"
                      style={
                        c.banner_url ? { backgroundImage: `url(${c.banner_url})` } : undefined
                      }
                    />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">
                          {c.type}
                        </Badge>
                        {c.status === "closed" ? (
                          <Badge variant="outline">Closed</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {timeUntil(c.submission_deadline) ?? "—"}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{c.title}</CardTitle>
                      {c.short_description && (
                        <CardDescription className="line-clamp-2">
                          {c.short_description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      Closes {formatDate(c.submission_deadline)} · {c.submissions_count} submissions
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
