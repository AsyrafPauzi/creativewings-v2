import Link from "next/link";
import { Trophy } from "lucide-react";

import { PageMotion } from "@/components/site/animations/page-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Winners" };
export const revalidate = 60;

export default async function WinnersPage() {
  const supabase = await createClient();

  const { data: winners } = await supabase
    .from("submissions")
    .select(
      "id, student_name, rank, status, artwork_url, campaigns:campaign_id(slug, title, banner_url)",
    )
    .or("status.in.(shortlisted,winner),rank.not.is.null")
    .order("rank", { ascending: true, nullsFirst: false })
    .limit(24);

  const rows = (winners ?? []).map((w) => ({
    ...w,
    campaign: Array.isArray(w.campaigns) ? w.campaigns[0] : w.campaigns,
  }));

  return (
    <PageMotion hero>
      <div className="cw-container py-14 md:py-20">
        <header data-motion="hero" className="mb-8 flex flex-col gap-3">
          <span data-motion="hero-item" className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Hall of fame
          </span>
          <h1 data-motion="hero-item" className="text-4xl font-extrabold tracking-tight text-body md:text-5xl">
            Recent winners
          </h1>
          <p data-motion="hero-item" className="max-w-2xl text-text-secondary">
            Shortlisted and winning entries from campaigns across Creative Wings.
          </p>
        </header>

        {rows.length === 0 ? (
          <Card data-motion="card" className="will-change-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                No winners yet
              </CardTitle>
              <CardDescription>
                Winners appear here once organizers announce results. Browse open campaigns and submit your work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/campaigns">Browse campaigns</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((w) => (
              <li key={w.id} data-motion="card" className="will-change-transform">
                <Card className="h-full overflow-hidden">
                  {w.artwork_url && (
                    <div className="aspect-video bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.artwork_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-snug">
                        {w.student_name ?? "Participant"}
                      </CardTitle>
                      {w.rank != null && (
                        <Badge variant="warning">#{w.rank}</Badge>
                      )}
                    </div>
                    {w.campaign && (
                      <CardDescription>
                        <Link
                          href={`/campaigns/${w.campaign.slug}`}
                          className="text-primary hover:underline"
                        >
                          {w.campaign.title}
                        </Link>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="capitalize">
                      {w.status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageMotion>
  );
}
