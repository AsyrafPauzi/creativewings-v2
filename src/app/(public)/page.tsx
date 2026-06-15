import Link from "next/link";
import { Search, Trophy } from "lucide-react";

import { CampaignCard, type CampaignCardData } from "@/components/site/campaign-card";
import { RockwellHero } from "@/components/site/rockwell-hero";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 60;

type Filter = "all" | "activities" | "competitions";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter: rawFilter, q } = await searchParams;
  const filter: Filter =
    rawFilter === "activities" || rawFilter === "competitions"
      ? rawFilter
      : "all";
  const search = (q ?? "").trim();

  const supabase = await createClient();

  // ---- live counts for the stats banner ----
  const [{ count: currentCount }, { data: liveForPrize }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("campaigns")
      .select("entry_fee, submissions_count")
      .in("status", ["published", "closed"]),
  ]);

  // Approximate "Total Prizes" by summing entry_fee * submissions across all
  // public campaigns. Once the real `total_prize_value` numbers are entered we
  // can swap this for a `sum(total_prize_value::numeric)`.
  const totalPrizes = (liveForPrize ?? []).reduce(
    (acc, c) => acc + Number(c.entry_fee ?? 0) * (c.submissions_count ?? 0),
    0,
  );

  // ---- campaign list (matches the homepage in creativewings.asia) ----
  let query = supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, organizer:organizer_id(business_name, slug, logo_url)",
    )
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true })
    .limit(12);

  if (filter === "activities") query = query.eq("type", "activity");
  if (filter === "competitions") query = query.eq("type", "competition");
  if (search) query = query.ilike("title", `%${search}%`);

  const { data: campaigns } = await query;

  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  return (
    <div>
      <RockwellHero />

      {/* Stats strip — mirrors the "Current 0002 / Total Prizes 2,760.00" band */}
      <section className="border-y bg-card">
        <div className="container grid items-center gap-6 py-10 md:grid-cols-[1fr_1fr_auto]">
          <Stat
            label="Current"
            value={String(currentCount ?? 0).padStart(4, "0")}
          />
          <Stat
            label="Total Prizes"
            value={formatCurrency(totalPrizes, "MYR").replace("MYR", "").trim()}
            prefix="RM"
          />
          <Button asChild size="lg" variant="brand">
            <Link href="/sign-up">Login / Signup</Link>
          </Button>
        </div>
      </section>

      {/* "Together, We Help Young Talents Soar" — campaign listing */}
      <section className="container py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            &ldquo;Together, We Help Young Talents Soar&rdquo;
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 cw-gradient-bg rounded-full" />
        </div>

        {/* Filter + search */}
        <form
          action="/"
          method="get"
          className="mt-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill href="/" active={filter === "all"}>
              All
            </FilterPill>
            <FilterPill href="/?filter=activities" active={filter === "activities"}>
              Activities
            </FilterPill>
            <FilterPill href="/?filter=competitions" active={filter === "competitions"}>
              Competitions
            </FilterPill>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search"
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          </div>
        </form>

        {cards.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed p-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? `No campaigns match “${search}”.`
                : "No campaigns are available right now. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href={filter === "all" ? "/campaigns" : `/${filter}`}
            className="inline-flex items-center text-lg font-semibold text-foreground hover:text-primary"
          >
            See More &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  prefix,
}: {
  label: string;
  value: React.ReactNode;
  prefix?: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
        {prefix && <span className="mr-2 text-xl text-muted-foreground">{prefix}</span>}
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
