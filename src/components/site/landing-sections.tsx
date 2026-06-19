import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Briefcase,
  CheckCircle2,
  FileUp,
  Layers,
  Mail,
  MousePointer2,
  Quote,
  Send,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { SdgIcon } from "@/components/site/sdg-icons";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const PROGRAMMES = [
  {
    number: "01",
    eyebrow: "Competitions",
    title: "Win cash",
    body: "Briefs from Malaysia's biggest brands and schools. Cash prizes, judging, real exposure.",
    href: "/campaigns?filter=competitions",
    cta: "Browse comps",
    fill: "#F05A7E",
    text: "#FFE9EE",
    chips: ["Cash prizes", "Judged", "Featured"],
  },
  {
    number: "02",
    eyebrow: "Workshops",
    title: "Learn live",
    body: "Hands-on, online or in-person. Short courses, masterclasses, and bootcamps led by working creators.",
    href: "/workshops",
    cta: "Find workshops",
    fill: "#125B9A",
    text: "#DCE8F4",
    chips: ["Online", "Mentors", "Bootcamps"],
  },
  {
    number: "03",
    eyebrow: "Activities",
    title: "Ship together",
    body: "Maker-style activities, hackathons, jams. Show up, ship together, leave with something real.",
    href: "/activities",
    cta: "Join activities",
    fill: "#0B1320",
    text: "#C9CDD6",
    chips: ["Jams", "Clubs", "School-ready"],
  },
] as const;

const TESTIMONIALS = [
  {
    quote: "I shipped my first paid brief here. Felt unreal seeing my work on Petronas' IG.",
    name: "Mira",
    role: "Creator",
    initials: "MI",
    dark: false,
    color: "#F05A7E",
    rotation: "-rotate-2",
  },
  {
    quote: "We ran a bulk-schools brief in two weeks. Submissions tripled, vetting was painless.",
    name: "Goyaz Team",
    role: "Organizer",
    initials: "GY",
    dark: true,
    color: "#125B9A",
    rotation: "rotate-3",
  },
  {
    quote: "Got hired as a designer through a competition I almost skipped. Apply to everything.",
    name: "Nadia",
    role: "Designer",
    initials: "NA",
    dark: false,
    color: "#16A34A",
    rotation: "-rotate-1",
  },
  {
    quote: "Our kids love it. The badges and SDGs make the work feel like it actually matters.",
    name: "Cikgu Faridah",
    role: "Teacher",
    initials: "CF",
    dark: true,
    color: "#D97706",
    rotation: "rotate-2",
  },
] as const;

const STEPS = [
  {
    number: "01",
    title: "Pick a brief",
    body: "Filter by category, prize size, or deadline. Save your favourites.",
    icon: MousePointer2,
    color: "#F05A7E",
  },
  {
    number: "02",
    title: "Submit your work",
    body: "Drag, drop, write a 200-word intent. Done in under 10 minutes.",
    icon: FileUp,
    color: "#125B9A",
  },
  {
    number: "03",
    title: "Get judged + paid",
    body: "Get notified, get on the shortlist, get the brief-and the bag.",
    icon: Trophy,
    color: "#D97706",
  },
] as const;

const WINNERS = [
  ["Aisyah binti Rahman", "Wings of Steel", "RM 50,000", "AR", "linear-gradient(200deg, #F05A7E 0%, #0B1320 100%)"],
  ["Daniel Tan", "Type & Identity", "RM 24,000", "DT", "linear-gradient(200deg, #F4A95F 0%, #C12E5B 100%)"],
  ["Studio Nyala", "Voices of Borneo", "RM 12,000", "SN", "linear-gradient(200deg, #A55EAE 0%, #125B9A 100%)"],
  ["Aliff Hakim", "AI for the Kampung", "RM 75,000", "AH", "linear-gradient(200deg, #16A34A 0%, #0B1320 100%)"],
  ["Cikgu Faridah", "Short Story Open", "RM 8,000", "CF", "linear-gradient(200deg, #F05A7E 0%, #F4A95F 100%)"],
] as const;

const ORGANIZER_KPIS = [
  { icon: Briefcase, value: "15 min", label: "average setup" },
  { icon: CheckCircle2, value: "3x", label: "more submissions" },
  { icon: Send, value: "Weekly", label: "payout cycles" },
] as const;

export function ProgrammeBand() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="cw-container">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-secondary">
            <Layers className="h-3.5 w-3.5" />
            The programme
          </div>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 className="text-4xl font-extrabold italic leading-none tracking-[-0.04em] text-body md:text-5xl">
              Three ways to ship work.
            </h2>
            <p className="text-sm font-medium text-text-secondary md:text-base">
              Compete - Learn - Build. Pick your lane.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {PROGRAMMES.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex min-h-[360px] overflow-hidden rounded-[24px] p-8 shadow-[0_14px_30px_rgb(11_19_32/0.13)] transition-transform hover:-translate-y-1 md:min-h-[440px]"
              style={{ background: item.fill }}
            >
              <span
                aria-hidden
                className="absolute right-8 top-0 text-[7rem] font-extrabold italic leading-none tracking-[-0.08em] text-white/15 md:text-[7.5rem]"
              >
                {item.number}
              </span>
              <div className="relative flex w-full flex-col justify-between">
                <div className="space-y-4">
                  <span className="inline-flex rounded-pill bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">
                    {item.eyebrow}
                  </span>
                  <h3 className="text-4xl font-extrabold italic tracking-[-0.04em] text-white">
                    {item.title}
                  </h3>
                  <p className="max-w-md text-[15px] font-medium leading-relaxed" style={{ color: item.text }}>
                    {item.body}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.chips.map((chip) => (
                      <span key={chip} className="rounded-pill bg-white/15 px-3 py-1 text-[11px] font-bold text-white">
                        {chip}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2.5 text-xs font-extrabold text-primary">
                    {item.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsBand({
  totalPrizes,
  totalSubmissions,
  organizerCount,
}: {
  totalPrizes: number;
  totalSubmissions: number;
  organizerCount: number;
}) {
  const stats = [
    { value: totalSubmissions > 0 ? totalSubmissions.toLocaleString() : "12,400", label: "creators on board", color: "#F05A7E" },
    { value: totalPrizes > 0 ? `RM ${formatCompact(totalPrizes)}` : "RM 1.2M", label: "paid out to creators", color: "#125B9A" },
    { value: organizerCount > 0 ? `${organizerCount}+` : "60+", label: "partner schools", color: "#D97706" },
    { value: "17/17", label: "SDGs covered", color: "#16A34A" },
  ];

  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="cw-container text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
          How we&apos;re doing
        </span>
        <h2 className="mt-3 text-3xl font-extrabold italic tracking-[-0.035em] text-body md:text-4xl">
          Together, we&apos;re paying creative talent.
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-5xl font-extrabold italic leading-none tracking-[-0.06em] md:text-7xl" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((goal) => (
            <Link key={goal} href={`/campaigns?sdg=${goal}`} className="transition-transform hover:-translate-y-0.5">
              <SdgIcon goal={goal} size={56} rounded="sm" />
            </Link>
          ))}
        </div>
        <p className="mt-5 text-sm font-semibold text-text-secondary">
          Every brief is mapped to the UN Sustainable Development Goals.
        </p>
      </div>
    </section>
  );
}

export function TestimonialsBand() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="cw-container">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <h2 className="text-4xl font-extrabold italic tracking-[-0.04em] text-body md:text-[44px]">
            Voices from the wings.
          </h2>
          <p className="text-sm font-medium text-text-secondary">What creators, organizers and schools say.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((item) => (
            <article
              key={item.quote}
              className={`flex min-h-[300px] flex-col justify-between rounded-[18px] border p-6 ${item.rotation} ${
                item.dark ? "border-[#0B1320] bg-[#0B1320] text-white" : "border-border bg-white text-body"
              }`}
            >
              <Quote className={`h-8 w-8 ${item.dark ? "text-primary" : "text-primary/20"}`} />
              <p className="text-base font-semibold leading-relaxed">{item.quote}</p>
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: item.color }}
                >
                  {item.initials}
                </span>
                <span>
                  <span className="block text-sm font-extrabold">{item.name}</span>
                  <span className={`block text-xs ${item.dark ? "text-white/55" : "text-text-muted"}`}>{item.role}</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksBand() {
  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="cw-container">
        <div className="text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-secondary">How it works</span>
          <h2 className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] text-body md:text-[44px]">
            Three steps, no fluff.
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step) => (
            <TicketCard key={step.title} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentWinnersBand() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="cw-container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-warning">
              <Trophy className="h-4 w-4" />
              Recent winners
            </div>
            <h2 className="mt-2 text-3xl font-extrabold italic tracking-[-0.04em] text-body md:text-4xl">
              Last week&apos;s wings.
            </h2>
          </div>
          <Link href="/winners" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-secondary">
            See all wins <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {WINNERS.map(([name, campaign, amount, initials, gradient]) => (
            <article key={name} className="overflow-hidden rounded-2xl border bg-white shadow-soft">
              <div className="grid h-40 place-items-center" style={{ backgroundImage: gradient }}>
                <span className="grid h-[60px] w-[60px] place-items-center rounded-full border-[3px] border-white bg-white/90 text-sm font-extrabold text-body">
                  {initials}
                </span>
              </div>
              <div className="space-y-1.5 p-4">
                <h3 className="text-sm font-extrabold text-body">{name}</h3>
                <p className="text-xs font-medium text-text-muted">{campaign}</p>
                <p className="text-xl font-extrabold italic tracking-tight text-primary">{amount}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrganizerBand() {
  return (
    <section className="relative overflow-hidden bg-[#0B1320] py-16 text-white md:py-20">
      <div className="absolute -left-48 -top-48 h-[540px] w-[540px] rounded-full bg-primary/15" />
      <div className="absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full bg-secondary/20" />
      <div className="cw-container relative grid items-center gap-10 lg:grid-cols-[660px_480px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-primary/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
            <Briefcase className="h-3.5 w-3.5" />
            For organizers
          </span>
          <h2 className="mt-5 text-4xl font-extrabold italic leading-[1.02] tracking-[-0.05em] md:text-6xl">
            Run your next brief on Creative Wings.
          </h2>
          <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-[#C9CDD6]">
            Bulk schools, real KPIs, payouts handled. CommercePay built-in. Launch in days, not months.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button asChild size="xl" className="rounded-pill">
              <Link href="/sign-up?role=organizer">
                Start a brief <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="rounded-pill border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/contact">
                Talk to sales <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3.5">
          {ORGANIZER_KPIS.map((item, index) => (
            <KpiCard key={item.label} {...item} rotation={index === 0 ? "rotate-2" : index === 1 ? "-rotate-1" : "rotate-3"} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="cw-container grid gap-8 lg:grid-cols-2">
        <div className="rounded-[24px] border p-8 md:p-9" style={{ backgroundImage: "linear-gradient(160deg, #FCE6EC 0%, #FFFFFF 60%, #E1ECF6 100%)" }}>
          <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
            <Mail className="h-3.5 w-3.5" />
            Stay in the loop
          </div>
          <h2 className="mt-4 max-w-md text-4xl font-extrabold italic leading-[1.05] tracking-[-0.04em] text-body">
            Get briefs in your inbox.
          </h2>
          <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-text-secondary">
            One curated digest a week. Closing-soon briefs, new programmes, sneaky bonuses.
          </p>
          <form className="mt-6 flex items-center gap-2 rounded-pill border border-border-strong bg-white py-2 pl-5 pr-2">
            <AtSign className="h-4 w-4 text-text-muted" />
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-body placeholder:text-text-muted focus:outline-none"
            />
            <button className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2.5 text-xs font-extrabold text-white" type="submit">
              Subscribe <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-3 text-xs font-medium text-text-muted">Once a week. No spam. Unsubscribe anytime.</p>
        </div>

        <div className="flex min-h-[360px] flex-col rounded-[24px]">
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-extrabold italic tracking-[-0.03em] text-body">From the wings.</h3>
            <span className="text-xs font-bold text-secondary">#creativewings</span>
          </div>
          <div className="mt-4 grid flex-1 grid-cols-2 gap-3">
            {["#F05A7E", "#125B9A", "#F4A95F", "#16A34A", "#A55EAE", "#0B1320"].map((color, index) => (
              <div
                key={`${color}-${index}`}
                className="rounded-2xl shadow-soft"
                style={{
                  backgroundImage: `linear-gradient(145deg, ${color} 0%, ${index % 2 === 0 ? "#0B1320" : "#FFFFFF"} 100%)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TicketCard({
  number,
  title,
  body,
  icon: Icon,
  color,
}: {
  number: string;
  title: string;
  body: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <article className="overflow-hidden rounded-[18px] border bg-white shadow-[0_8px_24px_rgb(11_19_32/0.08)]">
      <div className="flex items-center justify-between px-7 pb-4 pt-7">
        <span className="text-7xl font-extrabold italic leading-none tracking-[-0.08em]" style={{ color }}>
          {number}
        </span>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-black text-white">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="flex items-center justify-between px-4">
        <span className="-ml-7 h-6 w-6 rounded-full bg-surface" />
        <span className="flex gap-1.5">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="h-1.5 w-1.5 rounded-full bg-border-strong" />
          ))}
        </span>
        <span className="-mr-7 h-6 w-6 rounded-full bg-surface" />
      </div>
      <div className="space-y-2 px-7 pb-7 pt-4">
        <h3 className="text-2xl font-extrabold italic tracking-tight text-body">{title}</h3>
        <p className="text-sm font-medium leading-relaxed text-text-secondary">{body}</p>
      </div>
    </article>
  );
}

function KpiCard({
  icon: Icon,
  value,
  label,
  rotation,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  rotation: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-[#1F2A3D] bg-[#101A2E] p-4 shadow-[0_8px_24px_rgb(0_0_0/0.34)] ${rotation}`}>
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-2xl font-extrabold italic tracking-tight">{value}</span>
        <span className="block text-sm font-medium text-white/60">{label}</span>
      </span>
    </div>
  );
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${formatCurrency(value / 1_000_000, "MYR").replace("MYR", "").trim()}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return formatCurrency(value, "MYR").replace("MYR", "").trim();
}
