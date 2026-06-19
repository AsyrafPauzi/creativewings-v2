import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Clapperboard,
  CornerDownRight,
  Palette,
  Search,
  Sparkles,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroProps {
  kpis?: { label: string; value: string }[];
  liveStrip?: string;
}

const HERO_CARDS = [
  {
    title: "After Hours: Urban Cinematography",
    category: "Film",
    deadline: "12d 04h",
    prize: "RM 18,000",
    icon: Clapperboard,
    className: "left-0 top-16 h-[330px] w-[250px] rotate-[-8deg] md:h-[430px] md:w-[330px]",
    gradient: "linear-gradient(160deg, #125B9A 0%, #0B1320 100%)",
  },
  {
    title: "Type & Identity 2026 Awards",
    category: "Design",
    deadline: "6d 09h",
    prize: "RM 24,000",
    icon: Palette,
    className: "left-[30%] top-2 h-[340px] w-[260px] rotate-[6deg] md:h-[440px] md:w-[340px]",
    gradient: "linear-gradient(200deg, #F4A95F 0%, #C12E5B 100%)",
  },
  {
    title: "Wings of Steel: Industrial Photography",
    category: "Photography",
    deadline: "4d 12h",
    prize: "RM 50,000",
    icon: Camera,
    className: "left-[10%] top-12 h-[370px] w-[290px] rotate-[-3deg] md:h-[480px] md:w-[380px]",
    gradient: "linear-gradient(220deg, #F05A7E 0%, #5E2B6A 55%, #0B1320 100%)",
    featured: true,
  },
] as const;

type HeroCard = {
  title: string;
  category: string;
  deadline: string;
  prize: string;
  icon: typeof Camera;
  gradient: string;
  className: string;
  featured?: boolean;
};

export function Hero({ kpis = [], liveStrip }: HeroProps) {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#F05A7E] text-white"
      style={{
        backgroundImage:
          "linear-gradient(135deg, #F05A7E 0%, #A55EAE 55%, #125B9A 100%)",
      }}
    >
      <div className="absolute -left-28 -top-28 h-[380px] w-[380px] rounded-full bg-white/10" />
      <div className="absolute -right-28 bottom-8 h-[420px] w-[420px] rounded-full bg-white/10" />
      <FloatingSticker className="left-5 top-28 rotate-[-8deg]" icon={<Sparkles className="h-5 w-5 text-primary" />} />
      <FloatingSticker className="left-4 top-[48%] rotate-[8deg]" icon={<Palette className="h-5 w-5 text-secondary" />} />
      <FloatingSticker className="right-5 top-28 rotate-[-10deg]" icon={<Sparkles className="h-5 w-5 text-warning" />} />
      <FloatingSticker className="right-5 bottom-16 rotate-[18deg]" icon={<ArrowUpRight className="h-5 w-5 text-primary" />} />

      <div className="cw-container relative grid min-h-[760px] items-center gap-10 py-[60px] lg:grid-cols-[700px_540px]">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-pill bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3 w-3" />
            For creators · organizers · contestants
          </span>

          <h1 className="mt-7 max-w-3xl text-6xl font-extrabold italic leading-[0.96] tracking-[-0.06em] md:text-8xl">
            Find a brief.
            <span className="block text-[#FCE6EC]">Win the wings.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-white md:text-xl">
            Malaysia&apos;s home for live competitions, workshops &amp; activities. Submit your work in
            minutes — get judged, get paid, get hired.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <Button asChild size="xl" className="rounded-pill bg-white text-primary hover:bg-white/90">
              <Link href="/campaigns">
                Browse competitions <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="rounded-pill border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/sign-up?role=organizer">
                Become an organizer <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <form
            action="/"
            method="get"
            className="mt-6 flex max-w-xl items-center gap-2 rounded-pill border border-white/35 bg-white/15 py-2 pl-5 pr-2 shadow-elevated backdrop-blur focus-within:border-white"
          >
            <Search className="h-4 w-4 text-white/80" />
            <input
              type="search"
              name="q"
              placeholder="Search by skill, school or sub-category..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-xs font-extrabold text-primary transition-colors hover:bg-white/90"
            >
              Find <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 text-sm font-semibold text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            {liveStrip ?? "12 live now · RM 1.2M open · 240 new submissions today"}
          </div>
        </div>

        <div className="relative hidden h-[580px] lg:block">
          {HERO_CARDS.map((card) => (
            <HeroCampaignCard key={card.title} {...card} />
          ))}
          <div className="absolute bottom-4 right-8 inline-flex items-center gap-1.5 rounded-pill border border-white bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <CornerDownRight className="h-3.5 w-3.5" />
            8 more featured this week
          </div>
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="border-t border-white/15 bg-white/10 backdrop-blur">
          <div className="cw-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label}>
                <div className="text-3xl font-extrabold italic tracking-tight text-white md:text-4xl">
                  {k.value}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function HeroCampaignCard({
  title,
  category,
  deadline,
  prize,
  icon: Icon,
  gradient,
  className,
  featured,
}: HeroCard) {
  return (
    <div
      className={`absolute overflow-hidden rounded-[18px] border-4 border-white shadow-[0_18px_32px_rgb(11_19_32/0.34)] ${className}`}
      style={{ backgroundImage: gradient }}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
        <Icon className="h-3 w-3" />
        {category}
      </div>
      <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-[#0B1320] px-3 py-1.5 text-[11px] font-bold text-white">
        <Timer className="h-3 w-3" />
        {deadline}
      </div>
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <h2 className="max-w-[210px] text-lg font-extrabold italic leading-[1.05] tracking-tight text-white md:text-xl">
          {title}
        </h2>
        <div className="text-right">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/65">Prize</div>
          <div className={`font-extrabold italic tracking-tight text-white ${featured ? "text-3xl" : "text-2xl"}`}>
            {prize}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingSticker({ className, icon }: { className: string; icon: ReactNode }) {
  return (
    <div
      aria-hidden
      className={`absolute z-10 grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_20px_rgb(11_19_32/0.26)] md:h-14 md:w-14 ${className}`}
    >
      {icon}
    </div>
  );
}
