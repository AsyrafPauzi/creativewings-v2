import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, SDG_GOALS, timeUntil } from "@/lib/utils";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("campaigns")
    .select("title, short_description")
    .eq("slug", slug)
    .maybeSingle();
  return {
    title: data?.title ?? "Campaign",
    description: data?.short_description ?? undefined,
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "*, organizers:organizer_id(id, slug, business_name, logo_url, industry, is_verified)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!campaign || !["published", "closed"].includes(campaign.status)) {
    notFound();
  }

  const organizer = Array.isArray(campaign.organizers)
    ? campaign.organizers[0]
    : campaign.organizers;

  const [{ data: ageBrackets }, { data: prizes }, { data: faq }] = await Promise.all([
    supabase
      .from("age_brackets")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    supabase
      .from("prizes")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
    supabase
      .from("faq_items")
      .select("*")
      .eq("campaign_id", campaign.id)
      .order("sort_order"),
  ]);

  const progress =
    campaign.kpi_target > 0
      ? Math.min(100, Math.round(((campaign.submissions_count ?? 0) / campaign.kpi_target) * 100))
      : null;

  return (
    <div>
      <section className="relative">
        <div
          className="h-72 cw-gradient-bg bg-cover bg-center md:h-96"
          style={
            campaign.banner_url
              ? { backgroundImage: `url(${campaign.banner_url})` }
              : undefined
          }
        />
        <div className="container -mt-16 md:-mt-24">
          <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary" className="capitalize">{campaign.type}</Badge>
              {campaign.status === "closed" && (
                <Badge variant="outline">Closed</Badge>
              )}
              {timeUntil(campaign.submission_deadline) && (
                <Badge variant="warning">{timeUntil(campaign.submission_deadline)}</Badge>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {campaign.title}
            </h1>
            {organizer && (
              <Link
                href={`/organizer/${organizer.slug}`}
                className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                By {organizer.business_name}
                {organizer.is_verified && (
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                )}
              </Link>
            )}
            {campaign.short_description && (
              <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                {campaign.short_description}
              </p>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <Stat label="Entry fee" value={formatCurrency(campaign.entry_fee, campaign.currency)} />
              <Stat label="Closes" value={formatDate(campaign.submission_deadline)} />
              <Stat
                label="Submissions"
                value={`${campaign.submissions_count}${campaign.kpi_target ? ` / ${campaign.kpi_target}` : ""}`}
              />
            </div>
            {progress != null && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full cw-gradient-bg" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {campaign.status === "published" ? (
                <Button asChild size="lg" variant="brand">
                  <Link href={`/campaigns/${campaign.slug}/submit`}>Submit your entry</Link>
                </Button>
              ) : (
                <Button size="lg" variant="outline" disabled>
                  Submissions closed
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href={`/organizer/${organizer?.slug ?? ""}`}>View organiser</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <article
          className="prose prose-neutral max-w-none md:col-span-2"
          dangerouslySetInnerHTML={{ __html: campaign.description ?? "" }}
        />

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DateLine label="Submissions open" value={campaign.submission_start} />
              <DateLine label="Submissions close" value={campaign.submission_deadline} />
              <DateLine label="Review starts" value={campaign.review_start} />
              <DateLine label="Final event" value={campaign.final_event_date} />
              {campaign.location_details && (
                <div className="flex items-start gap-2 pt-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>{campaign.location_details}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {prizes && prizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Prizes
                </CardTitle>
                {campaign.total_prize_value && (
                  <CardDescription>{campaign.total_prize_value}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {prizes.map((p) => (
                  <div key={p.id}>
                    <div className="font-medium">{p.title}</div>
                    {p.description && (
                      <p className="text-muted-foreground">{p.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {ageBrackets && ageBrackets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {ageBrackets.map((b) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <span>{b.label}</span>
                    <span className="text-muted-foreground">
                      {b.min_age}–{b.max_age}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {campaign.sdg_goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">UN Sustainable Goals</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {campaign.sdg_goals.map((goal: number) => {
                  const meta = SDG_GOALS[goal];
                  return (
                    <span
                      key={goal}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: meta?.color ?? "#888" }}
                      title={meta?.title}
                    >
                      SDG {goal} · {meta?.title ?? ""}
                    </span>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {campaign.judging_criteria && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Judging criteria</h2>
            <div
              className="prose prose-neutral mt-4 max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.judging_criteria }}
            />
          </div>
        </section>
      )}

      {faq && faq.length > 0 && (
        <section className="py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {faq.map((f) => (
                <details key={f.id} className="rounded-lg border bg-card p-4">
                  <summary className="cursor-pointer font-medium">{f.question}</summary>
                  <div className="mt-2 text-sm text-muted-foreground">{f.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function DateLine({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{formatDate(value)}</div>
      </div>
    </div>
  );
}
