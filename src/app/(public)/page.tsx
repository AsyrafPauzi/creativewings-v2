import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  ChevronDown,
  Clock,
  Code2,
  Music,
  Palette,
  PenLine,
  Search,
  Shapes,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Video,
} from "lucide-react";

import { Hero } from "@/components/site/hero";
import { type CampaignCardData } from "@/components/site/campaign-card";
import {
  HowItWorksBand,
  NewsletterBand,
  OrganizerBand,
  ProgrammeBand,
  RecentWinnersBand,
  StatsBand,
  TestimonialsBand,
} from "@/components/site/landing-sections";
import { SdgIcon } from "@/components/site/sdg-icons";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn, formatCurrency, formatDate, timeUntil } from "@/lib/utils";

export const revalidate = 60;

type Filter = "all" | "activities" | "competitions" | "workshops";

const CATEGORY_TABS: { label: string; href: string; value?: Filter }[] = [
  { label: "All", href: "/", value: "all" },
  { label: "Competitions", href: "/?filter=competitions", value: "competitions" },
  { label: "Workshops", href: "/?filter=workshops", value: "workshops" },
  { label: "Activities", href: "/?filter=activities", value: "activities" },
  { label: "Closing soon", href: "/campaigns?sort=deadline" },
  { label: "RM 10k+", href: "/campaigns?prize=10000" },
  { label: "Open to all", href: "/campaigns?eligibility=open" },
  { label: "Schools welcome", href: "/campaigns?audience=schools" },
  { label: "Featured", href: "/campaigns?featured=true" },
  { label: "New today", href: "/campaigns?sort=new" },
];

const SUBCATEGORIES = [
  { label: "Art", icon: Palette },
  { label: "Design", icon: Shapes },
  { label: "Film", icon: Video },
  { label: "Music", icon: Music },
  { label: "Photo", icon: Camera },
  { label: "Tech", icon: Code2 },
  { label: "Words", icon: PenLine },
  { label: "Sport", icon: Trophy },
] as const;

const CARD_GRADIENTS = [
  "linear-gradient(200deg, #F05A7E 0%, #3B215B 100%)",
  "linear-gradient(200deg, #F4A95F 0%, #C12E5B 100%)",
  "linear-gradient(200deg, #125B9A 0%, #0B1320 100%)",
  "linear-gradient(200deg, #A55EAE 0%, #125B9A 100%)",
  "linear-gradient(200deg, #16A34A 0%, #0B1320 100%)",
  "linear-gradient(200deg, #F05A7E 0%, #F4A95F 100%)",
  "linear-gradient(200deg, #D97706 0%, #0B1320 100%)",
  "linear-gradient(200deg, #125B9A 0%, #F05A7E 100%)",
  "linear-gradient(200deg, #0B1320 0%, #A55EAE 100%)",
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const { filter: rawFilter, q } = await searchParams;
  const filter: Filter =
    rawFilter === "activities" || rawFilter === "competitions" || rawFilter === "workshops"
      ? rawFilter
      : "all";
  const search = (q ?? "").trim();

  const supabase = await createClient();

  const [{ count: liveCount }, { data: liveForPrize }, { count: organizerCount }] =
    await Promise.all([
      supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("campaigns")
        .select("entry_fee, submissions_count, total_prize_value")
        .in("status", ["published", "closed"]),
      supabase.from("organizers").select("id", { count: "exact", head: true }).eq("is_listed", true),
    ]);

  const totalPrizes = (liveForPrize ?? []).reduce((acc, c) => {
    const real = parseFloat(c.total_prize_value ?? "");
    if (Number.isFinite(real)) return acc + real;
    return acc + Number(c.entry_fee ?? 0) * (c.submissions_count ?? 0);
  }, 0);

  const totalSubs = (liveForPrize ?? []).reduce((acc, c) => acc + (c.submissions_count ?? 0), 0);

  let query = supabase
    .from("campaigns")
    .select(
      "id, slug, title, short_description, banner_url, category, type, status, entry_fee, currency, submission_start, submission_deadline, sdg_goals, submissions_count, organizer:organizer_id(name, slug, logo_url)",
    )
    .in("status", ["published", "closed"])
    .order("submission_deadline", { ascending: true })
    .limit(9);

  if (filter === "activities") query = query.eq("type", "activity");
  if (filter === "competitions") query = query.eq("type", "competition");
  if (filter === "workshops") query = query.eq("type", "workshop");
  if (search) query = query.ilike("title", `%${search}%`);

  const { data: campaigns } = await query;

  const cards: CampaignCardData[] = (campaigns ?? []).map((c) => ({
    ...c,
    organizer: Array.isArray(c.organizer) ? c.organizer[0] : c.organizer,
  }));

  const prizeLabel = `RM ${formatCurrency(totalPrizes, "MYR").replace("MYR", "").trim()}`;

  return (
    <div className="bg-background">
      <Hero
        liveStrip={`${liveCount ?? 0} live now · ${prizeLabel} open · ${totalSubs.toLocaleString()} total submissions`}
        kpis={[
          { label: "Live campaigns", value: String(liveCount ?? 0).padStart(2, "0") },
          { label: "Total prizes", value: prizeLabel },
          { label: "Submissions", value: totalSubs.toLocaleString() },
          { label: "Listed organizers", value: String(organizerCount ?? 0) },
        ]}
      />

      <CategoryTabs activeFilter={filter} />
      <LiveCompetitionsSection cards={cards} filter={filter} search={search} />
      <SpotlightSection />
      <ProgrammeBand />
      <StatsBand totalPrizes={totalPrizes} totalSubmissions={totalSubs} organizerCount={organizerCount ?? 0} />
      <TestimonialsBand />
      <HowItWorksBand />
      <RecentWinnersBand />
      <OrganizerBand />
      <NewsletterBand />
    </div>
  );
}

function CategoryTabs({ activeFilter }: { activeFilter: Filter }) {
  return (
    <section className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="cw-container flex gap-2.5 overflow-x-auto py-5">
        {CATEGORY_TABS.map((tab, index) => (
          <div key={tab.label} className="flex shrink-0 items-center gap-2.5">
            {index === 4 && <span className="h-6 w-px bg-border" />}
            <FilterPill href={tab.href} active={tab.value === activeFilter}>
              {tab.label}
            </FilterPill>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveCompetitionsSection({
  cards,
  filter,
  search,
}: {
  cards: CampaignCardData[];
  filter: Filter;
  search: string;
}) {
  return (
    <section className="bg-white px-0 py-16 md:py-20">
      <div className="cw-container">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-red-600">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              {cards.length || 12} live now
            </div>
            <h2 className="text-4xl font-extrabold italic leading-none tracking-[-0.04em] text-body md:text-[52px]">
              Pick your next brief.
            </h2>
            <p className="text-sm font-medium text-text-secondary md:text-base">
              From global brands to schools nearby — fresh briefs drop every week.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {SUBCATEGORIES.map((sub) => (
                <Link
                  key={sub.label}
                  href={`/campaigns?category=${sub.label.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-pill border bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-body"
                >
                  <sub.icon className="h-3.5 w-3.5 text-primary" />
                  {sub.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <form action="/" method="get" className="flex min-w-0 items-center gap-2 rounded-pill border bg-surface px-3 py-2">
                <Search className="h-4 w-4 text-text-muted" />
                <input
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder="Search briefs"
                  className="min-w-0 bg-transparent text-sm font-medium text-body placeholder:text-text-muted focus:outline-none"
                />
                {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
              </form>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-pill border bg-surface px-3.5 py-2 text-xs font-extrabold text-body"
              >
                <span className="font-semibold text-text-muted">Sort:</span> Newest <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="mt-10 rounded-[18px] border border-dashed bg-surface p-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-text-muted" />
            <h3 className="mt-4 text-lg font-extrabold text-body">No campaigns found</h3>
            <p className="mt-2 text-sm text-text-secondary">
              {search ? `Nothing matches "${search}".` : "No campaigns are available right now. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((campaign, index) => (
              <PencilCampaignCard key={campaign.id} campaign={campaign} gradient={CARD_GRADIENTS[index % CARD_GRADIENTS.length]} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" variant="outline" className="rounded-pill border-secondary text-secondary">
            <Link href="/campaigns">
              See all competitions <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PencilCampaignCard({
  campaign,
  gradient,
}: {
  campaign: CampaignCardData;
  gradient: string;
}) {
  const isClosed = campaign.status === "closed";
  const remaining = campaign.submission_deadline ? timeUntil(campaign.submission_deadline) : null;
  const dateText = formatDate(campaign.submission_start, { day: "numeric", month: "short" });
  const typeLabel = campaign.type === "competition" ? "Competition" : campaign.type === "workshop" ? "Workshop" : "Activity";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border bg-white shadow-[0_6px_18px_rgb(11_19_32/0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_32px_rgb(11_19_32/0.12)]">
      <div className="relative h-[200px] overflow-hidden" style={{ backgroundImage: gradient }}>
        {campaign.banner_url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/65" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3 w-3" />
            {campaign.category ?? typeLabel}
          </span>
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-[#0B1320] px-3 py-1.5 text-[11px] font-bold text-white">
          <Timer className="h-3 w-3" />
          {isClosed ? "Closed" : remaining ?? "Open"}
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
          <h3 className="line-clamp-2 max-w-[70%] text-xl font-extrabold italic leading-[1.05] tracking-tight text-white">
            {campaign.title}
          </h3>
          <span className="text-right text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/70">
            {typeLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {campaign.short_description && (
          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-text-secondary">
            {campaign.short_description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {dateText}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {campaign.submissions_count ?? 0} entries
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">Entry</p>
            <p className="text-sm font-extrabold text-body">
              {campaign.entry_fee > 0 ? formatCurrency(campaign.entry_fee, campaign.currency) : "Free"}
            </p>
          </div>
          <Button asChild disabled={isClosed} size="sm" className="rounded-pill">
            <Link href={`/campaigns/${campaign.slug}`}>{isClosed ? "Closed" : "View brief"}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function SpotlightSection() {
  return (
    <section className="bg-surface px-4 pb-20 pt-10 md:px-8">
      <div className="cw-container px-0">
        <div className="grid overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_36px_rgb(11_19_32/0.1)] lg:grid-cols-[3fr_2fr] lg:-rotate-1">
          <div
            className="relative min-h-[320px] p-8"
            style={{ backgroundImage: "linear-gradient(220deg, #F05A7E 0%, #A55EAE 50%, #0B1320 100%)" }}
          >
            <span className="inline-flex items-center gap-2 rounded-pill bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
              <Trophy className="h-4 w-4" />
              Grand prize · RM 100,000
            </span>
            <span className="absolute right-20 top-10 h-28 w-28 rounded-full bg-white/15" />
            <span className="absolute bottom-20 right-10 h-20 w-20 rounded-full bg-white/10" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-warning">
              <Sparkles className="h-3.5 w-3.5" />
              Spotlight · Editor&apos;s pick
            </div>
            <h2 className="text-3xl font-extrabold italic leading-tight tracking-[-0.04em] text-body md:text-4xl">
              Reimagine Penang: Heritage in Motion.
            </h2>
            <p className="text-sm font-medium leading-relaxed text-text-secondary">
              A short-film &amp; motion-design brief from Think City and KKMM. Submit a 60-second piece
              reimagining George Town&apos;s living heritage. Open to teams of up to 3.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-text-muted">
              <span className="rounded-pill bg-red-50 px-3 py-1.5 text-red-600">Closes in 9 days</span>
              <span>· Teams of 3</span>
              <span>· Penang + Online</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-pill">
                <Link href="/campaigns">Enter now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-pill border-secondary text-secondary">
                <Link href="/campaigns">Read brief</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">Supports</span>
              {[4, 11, 13, 17].map((goal) => (
                <SdgIcon key={goal} goal={goal} size={28} rounded="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-pill border px-4 py-2 text-sm font-extrabold transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-body hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}
