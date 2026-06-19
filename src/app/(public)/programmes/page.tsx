import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Feather,
  Flame,
  Mail,
  Quote,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgrammeSection } from "@/components/site/programme-section";
import { SdgIcon } from "@/components/site/sdg-icons";
import { loadTypeBucket } from "@/lib/programmes";
import type { CWCampaignType } from "@/lib/supabase/database.types";

export const metadata = {
  title: "Programmes",
  description:
    "Three ways to take part — workshops, competitions, and activities. Filter by sub-category to find what fits you.",
};
export const revalidate = 60;

const TYPES: CWCampaignType[] = ["competition", "activity", "workshop"];
const SDG_GOALS = Array.from({ length: 17 }, (_, index) => index + 1);

const FILTER_CHIPS = [
  "All",
  "Competitions",
  "Activities",
  "Workshops",
  "Closing soon",
  "RM 10k+",
  "Open to all",
  "Schools welcome",
  "✦ Featured",
];

const HERO_POSTERS = [
  {
    label: "Competition",
    title: "Wings of Steel",
    meta: "RM 50k prize pool",
    rotate: "-rotate-[8deg]",
    position: "left-4 top-10",
    gradient: "from-[#EC5B7D] to-[#7A3B5A]",
  },
  {
    label: "Workshop",
    title: "Pencil to Pixel",
    meta: "Mentor-led cohort",
    rotate: "rotate-[4deg]",
    position: "left-[9rem] top-5",
    gradient: "from-[#406CB9] to-[#9FBDED]",
  },
  {
    label: "Activity",
    title: "Maker Jam",
    meta: "Weekend build",
    rotate: "-rotate-[3deg]",
    position: "left-[17rem] top-16",
    gradient: "from-[#F0A23A] to-[#A55EAE]",
  },
];

const VOICES = [
  {
    name: "Aina H.",
    role: "Photographer",
    quote:
      "The brief paid for my first studio. Wings is the realest pipeline I've had as a young photographer in KL.",
    color: "text-primary",
    initials: "AH",
  },
  {
    name: "Cikgu Faiz",
    role: "Teacher organizer",
    quote: "I ran my school's first hackathon on CW. 120 kids, 9 SDGs, 1 magic weekend.",
    color: "text-secondary",
    initials: "CF",
  },
  {
    name: "Yi Ling",
    role: "Climate hack finalist",
    quote: "Climate Hack let our team meet judges from MAS and Sime Darby in one weekend.",
    color: "text-[#A55EAE]",
    initials: "YL",
  },
  {
    name: "Sherene Chin",
    role: "Brand lead",
    quote: "As an organizer, listing my brief took 4 minutes. We had 100 entries in a week.",
    color: "text-warning",
    initials: "SC",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Pick the right brief",
    body: "Browse by programme type, sub-category, deadline, or SDG goal.",
  },
  {
    step: "02",
    title: "Submit or show up",
    body: "Enter competitions, join activities, or register for hands-on workshops.",
  },
  {
    step: "03",
    title: "Earn your wings",
    body: "Build your portfolio with recognition, certificates, prizes, and mentors.",
  },
];

export default async function ProgrammesPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const { sub } = await searchParams;
  const activeSub = (sub ?? "").trim() || null;

  const buckets = await Promise.all(TYPES.map((t) => loadTypeBucket(t, activeSub)));
  const totalOpen = buckets.reduce((sum, bucket) => sum + bucket.totalCount, 0);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0B1320]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(240,90,126,0.34),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(18,91,154,0.34),transparent_34%),linear-gradient(135deg,#0B1320_0%,#1B2638_48%,#07101E_100%)]"
        />
        <div className="cw-container relative py-16 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_520px]">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-pill bg-primary px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
                Programmes hub · three ways to play
              </span>
              <h1 className="mt-6 text-5xl font-extrabold italic leading-[0.96] tracking-[-0.04em] text-white md:text-7xl lg:text-8xl">
                Find your brief.
                <span className="block text-[#FFE5DE]">Build your wings.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                Competitions, workshops, and activities — all in one place. Filter by SDG,
                by sub-category, by deadline.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-pill bg-primary px-5 hover:bg-primary-hover">
                  <Link href="#competitions">
                    Browse all <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-pill border-white bg-white/10 px-5 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/organizers">Become organizer</Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-white">
                <HeroMeta icon={Sparkles} label={`${totalOpen || 240} briefs`} />
                <HeroMeta icon={Trophy} label="RM 1.2M open" />
                <HeroMeta icon={Zap} label="12 live now" />
              </div>
            </div>

            <div className="relative hidden h-[440px] lg:block">
              {HERO_POSTERS.map((poster) => (
                <HeroPoster key={poster.label} {...poster} />
              ))}
              <HeroSticker className="-left-5 -top-2 -rotate-12 bg-[#FCE6EC] text-primary ring-primary" icon={Sparkles} />
              <HeroSticker className="right-1 -top-3 rotate-12 bg-[#E1ECF6] text-secondary ring-secondary" icon={Star} />
              <HeroSticker className="-left-8 bottom-3 -rotate-6 bg-[#FEE4A3] text-warning ring-warning" icon={Flame} />
              <HeroSticker className="bottom-4 right-2 rotate-12 bg-[#D7E5F5] text-secondary ring-secondary" icon={Feather} />
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Programme filters"
        className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
      >
        <div className="cw-container flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CHIPS.map((chip) => {
              const href =
                chip === "Competitions"
                  ? "#competitions"
                  : chip === "Activities"
                    ? "#activities"
                    : chip === "Workshops"
                      ? "#workshops"
                      : "#programmes-sdg";
              const active = chip === "All";
              return (
                <Link
                  key={chip}
                  href={href}
                  className={
                    "rounded-pill border px-3 py-1.5 text-xs font-bold tracking-[0.02em] transition-colors " +
                    (active
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-body hover:border-primary/40 hover:text-primary")
                  }
                >
                  {chip}
                </Link>
              );
            })}
          </div>
          <Link
            href="#competitions"
            className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-bold text-body"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            Newest
          </Link>
        </div>
      </nav>

      <section id="programmes-sdg" className="bg-background py-7 md:py-8">
        <div className="cw-container">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                Browse by SDG
              </p>
              <h2 className="mt-1 text-2xl font-extrabold italic tracking-tight text-body">
                17 wings to choose from.
              </h2>
            </div>
            <p className="text-sm text-text-secondary">Tap a goal to filter →</p>
          </div>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(64px,1fr))] gap-2">
            {SDG_GOALS.map((goal) => (
              <Link
                key={goal}
                href={`/campaigns?sdg=${goal}`}
                className={
                  "flex h-16 items-center justify-center rounded-lg border bg-background transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-soft " +
                  (goal === 13 ? "border-2 border-primary" : "border-border")
                }
                aria-label={`Browse SDG ${goal}`}
              >
                <SdgIcon goal={goal} size={48} rounded="md" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {buckets.map((b, i) => (
        <ProgrammeSection
          key={b.type}
          type={b.type}
          campaigns={b.campaigns}
          subCategories={b.subCategories}
          counts={b.counts}
          totalCount={b.totalCount}
          activeSub={b.activeSub}
          basePath="/programmes"
          surface={i % 2 === 1}
          index={i + 1}
        />
      ))}

      <section className="bg-surface px-0 pb-20 pt-6">
        <div className="cw-container">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            Spotlight · biggest brief this month
          </p>
          <div className="mt-5 grid overflow-hidden rounded-3xl border bg-background shadow-[0_24px_48px_rgb(11_19_32/0.14)] md:grid-cols-[1.1fr_1fr]">
            <div className="flex min-h-[320px] flex-col justify-end bg-gradient-to-br from-primary via-[#A55EAE] to-secondary p-8 text-white md:p-10">
              <span className="w-fit rounded-pill bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em]">
                Featured prize pool
              </span>
              <p className="mt-4 text-5xl font-extrabold italic tracking-tight">RM 50k</p>
              <p className="mt-2 max-w-sm text-sm text-white/80">
                Creative briefs, school showcases, and SDG-linked challenge tracks.
              </p>
            </div>
            <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                  Open now
                </p>
                <h2 className="mt-2 text-3xl font-extrabold italic tracking-tight text-body md:text-4xl">
                  Wings of Steel — build a future-facing portfolio.
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  A flagship brief for creators ready to submit polished work, meet judges, and
                  turn one entry into a launchpad.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[4, 9, 13].map((goal) => (
                    <SdgIcon key={goal} goal={goal} size={40} rounded="md" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-pill">
                    <Link href="/campaigns">Explore briefs</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-pill">
                    <Link href="#competitions">See competitions</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="cw-container">
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
              Programmes · live now
            </p>
            <h2 className="mt-2 text-3xl font-extrabold italic tracking-tight text-body md:text-4xl">
              A whole hub, breathing.
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Live now" value="12" body="briefs accepting submissions today" />
            <StatCard label="Briefs" value={`${totalOpen || 240}`} body="programmes live this quarter" />
            <StatCard label="Open" value="RM 1.2M" body="prize pool currently up for grabs" />
            <StatCard label="Partner schools" value="60+" body="running CW programmes nationwide" />
          </div>
          <div className="mt-8 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
              Every brief maps to an SDG
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {SDG_GOALS.map((goal) => (
                <SdgIcon key={goal} goal={goal} size={56} rounded="md" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="cw-container">
          <SectionHead eyebrow="Voices · in their own words" title="Stories from the brief." action="Read all stories →" />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {VOICES.map((voice) => (
              <article key={voice.name} className="rounded-2xl border bg-background p-6">
                <Quote className={`h-6 w-6 ${voice.color}`} />
                <p className="mt-4 text-sm font-semibold italic leading-6 text-body">
                  &quot;{voice.quote}&quot;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-xs font-extrabold text-body">
                    {voice.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-body">{voice.name}</span>
                    <span className="block text-xs text-text-muted">{voice.role}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="cw-container">
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
              How it works · three stubs
            </p>
            <h2 className="mt-2 text-3xl font-extrabold italic tracking-tight text-body md:text-4xl">
              Pick. Submit. Get paid.
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <article key={step.step} className="rounded-2xl border bg-card p-7 shadow-soft">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                  Step {step.step}
                </span>
                <h3 className="mt-4 text-xl font-extrabold italic text-body">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0B1320] py-16 text-white md:py-20">
        <div aria-hidden className="absolute left-14 top-14 grid h-12 w-12 -rotate-12 place-items-center rounded-full bg-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div aria-hidden className="absolute right-20 top-20 grid h-11 w-11 rotate-12 place-items-center rounded-full bg-secondary">
          <Star className="h-5 w-5" />
        </div>
        <div className="cw-container relative grid items-center gap-12 lg:grid-cols-[1fr_480px]">
          <div>
            <span className="inline-flex rounded-pill bg-white/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/80">
              For organizers · schools · brands
            </span>
            <h2 className="mt-5 max-w-3xl text-4xl font-extrabold italic leading-none tracking-tight md:text-6xl">
              Run your next brief on Creative Wings.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              Free to list. Pay-per-judge for big briefs. We handle moderation, payouts, and
              SDG tagging. You handle the magic.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-pill">
                <Link href="/dashboard/campaigns/new">Become organizer</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-pill text-white hover:bg-white/10 hover:text-white">
                <Link href="/organizers">Talk to us</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <DarkKpi dot="bg-primary" value="RM 482k" label="paid out through creator briefs" />
            <DarkKpi dot="bg-secondary" value="60+" label="schools and partners onboarded" />
            <DarkKpi dot="bg-warning" value="12 live" label="programmes accepting entries today" />
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-20">
        <div className="cw-container grid gap-8 lg:grid-cols-[520px_1fr]">
          <div className="rounded-[22px] border bg-background p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                  Friday signal
                </p>
                <h2 className="text-2xl font-extrabold italic tracking-tight text-body">
                  New briefs in your inbox.
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-text-secondary">
              New briefs, winners of the week, and one creator we love. Every Friday, 8pm MYT.
            </p>
            <div className="mt-6 flex gap-2">
              <Input className="rounded-pill" placeholder="you@example.com" type="email" />
              <Button className="rounded-pill">Subscribe</Button>
            </div>
            <p className="mt-4 text-[11px] font-medium text-text-muted">
              12,400 subscribers. No spam. PDPA-respected. Unsubscribe one tap.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Weekly briefs", "Winner Q&As", "SDG of the month"].map((perk) => (
                <span key={perk} className="rounded-pill bg-brand-soft px-3 py-1 text-xs font-bold text-primary">
                  {perk}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[22px] border bg-background p-8">
            <SectionHead eyebrow="Community wall" title="Fresh from the hub." action="See the wall →" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["New creator badge unlocked", "School showcase posted", "Judges shortlist live", "Winner Q&A published"].map(
                (item, index) => (
                  <div key={item} className="rounded-2xl border bg-surface p-5">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
                      0{index + 1}
                    </span>
                    <p className="mt-2 text-sm font-extrabold text-body">{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroMeta({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function HeroPoster({
  label,
  title,
  meta,
  rotate,
  position,
  gradient,
}: {
  label: string;
  title: string;
  meta: string;
  rotate: string;
  position: string;
  gradient: string;
}) {
  return (
    <div
      className={`absolute flex h-[300px] w-[220px] flex-col overflow-hidden rounded-[18px] border border-white bg-white shadow-[0_18px_36px_rgb(11_19_32/0.24)] ${rotate} ${position}`}
    >
      <div className={`flex flex-1 flex-col justify-between bg-gradient-to-br ${gradient} p-4 text-white`}>
        <span className="w-fit rounded-pill bg-white/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
          {label}
        </span>
        <span className="text-3xl font-extrabold italic leading-none">CW</span>
      </div>
      <div className="p-4">
        <p className="text-sm font-extrabold text-body">{title}</p>
        <p className="mt-1 text-xs text-text-secondary">{meta}</p>
      </div>
    </div>
  );
}

function HeroSticker({
  className,
  icon: Icon,
}: {
  className: string;
  icon: LucideIcon;
}) {
  return (
    <span className={`absolute grid h-12 w-12 place-items-center rounded-full ring-2 ${className}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
}

function StatCard({ label, value, body }: { label: string; value: string; body: string }) {
  return (
    <article className="rounded-[18px] border bg-card p-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">{label}</p>
      <p className="mt-3 text-5xl font-extrabold italic tracking-tight text-body">{value}</p>
      <p className="mt-2 text-xs leading-5 text-text-secondary">{body}</p>
    </article>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold italic tracking-tight text-body md:text-4xl">
          {title}
        </h2>
      </div>
      {action && <span className="text-sm font-bold text-primary">{action}</span>}
    </div>
  );
}

function DarkKpi({ dot, value, label }: { dot: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      <div>
        <p className="text-2xl font-extrabold italic text-white">{value}</p>
        <p className="text-sm text-white/65">{label}</p>
      </div>
    </div>
  );
}
