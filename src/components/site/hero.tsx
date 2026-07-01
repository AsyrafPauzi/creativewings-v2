"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
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
import { prefersReducedMotion, registerGsap } from "@/lib/gsap/register";

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
    fromRotation: -18,
    fromY: 80,
  },
  {
    title: "Type & Identity 2026 Awards",
    category: "Design",
    deadline: "6d 09h",
    prize: "RM 24,000",
    icon: Palette,
    className: "left-[30%] top-2 h-[340px] w-[260px] rotate-[6deg] md:h-[440px] md:w-[340px]",
    gradient: "linear-gradient(200deg, #F4A95F 0%, #C12E5B 100%)",
    fromRotation: 14,
    fromY: 100,
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
    fromRotation: -8,
    fromY: 120,
  },
] as const;

type HeroCard = (typeof HERO_CARDS)[number] & { featured?: boolean };

export function Hero({ kpis = [], liveStrip }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGsap();
      const section = sectionRef.current;
      if (!section) return;

      if (prefersReducedMotion()) {
        gsap.set(section.querySelectorAll("[data-hero]"), { clearProps: "all", opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      const fadeUp = (
        targets: gsap.TweenTarget,
        from: gsap.TweenVars,
        to: gsap.TweenVars,
        position?: gsap.Position,
      ) => {
        // Transform only — keep opacity at 1 so hero copy is never invisible
        tl.fromTo(targets, from, to, position);
      };

      fadeUp("[data-hero='badge']", { y: 20, scale: 0.9 }, { y: 0, scale: 1, duration: 0.6 });
      fadeUp(
        "[data-hero='line']",
        { y: 40 },
        { y: 0, duration: 0.85, stagger: 0.12 },
        "-=0.3",
      );
      fadeUp("[data-hero='desc']", { y: 28 }, { y: 0, duration: 0.7 }, "-=0.45");
      fadeUp("[data-hero='cta']", { y: 24, scale: 0.96 }, { y: 0, scale: 1, duration: 0.55, stagger: 0.1 }, "-=0.4");
      fadeUp("[data-hero='search']", { y: 20 }, { y: 0, duration: 0.6 }, "-=0.25");
      fadeUp("[data-hero='live']", { x: -12 }, { x: 0, duration: 0.5 }, "-=0.2");

      // KPI strip
      if (kpis.length > 0) {
        fadeUp("[data-hero='kpi']", { y: 24 }, { y: 0, duration: 0.55, stagger: 0.08 }, "-=0.15");
      }

      // Hero cards — fan in (opacity ok here — decorative)
      HERO_CARDS.forEach((card, i) => {
        gsap.fromTo(
          `[data-hero-card='${i}']`,
          {
            y: card.fromY,
            opacity: 0,
            rotation: card.fromRotation,
            scale: 0.88,
          },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 1,
            delay: 0.35 + i * 0.14,
            ease: "back.out(1.2)",
          },
        );
      });

      gsap.fromTo(
        "[data-hero='cards-hint']",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 1.1 },
      );

      // Floating stickers — gentle bob
      gsap.utils.toArray<HTMLElement>("[data-hero='sticker']").forEach((sticker, i) => {
        gsap.to(sticker, {
          y: "+=14",
          rotation: `+=${i % 2 === 0 ? 6 : -6}`,
          duration: 2.2 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });

      // Background orbs drift
      gsap.utils.toArray<HTMLElement>("[data-hero='orb']").forEach((orb, i) => {
        gsap.to(orb, {
          x: i === 0 ? 30 : -24,
          y: i === 0 ? 20 : -16,
          duration: 6 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Parallax on hero cards (desktop)
      const cardsEl = cardsRef.current;
      if (cardsEl && window.matchMedia("(min-width: 1024px)").matches) {
        const onMove = (e: MouseEvent) => {
          const rect = section.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          HERO_CARDS.forEach((_, i) => {
            const card = section.querySelector(`[data-hero-card='${i}']`);
            if (!card) return;
            const depth = (i + 1) * 8;
            gsap.to(card, {
              x: x * depth,
              y: y * depth * 0.6,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto",
            });
          });
        };

        section.addEventListener("mousemove", onMove);
        return () => section.removeEventListener("mousemove", onMove);
      }

      // Fallback if React strict-mode interrupts the timeline
      const safetyTimer = window.setTimeout(() => {
        section.querySelectorAll<HTMLElement>("[data-hero]").forEach((el) => {
          gsap.set(el, { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0, clearProps: "transform" });
        });
      }, 1500);

      return () => window.clearTimeout(safetyTimer);
    },
    { scope: sectionRef, dependencies: [kpis.length] },
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#F05A7E] text-white"
      style={{
        backgroundImage: "linear-gradient(135deg, #F05A7E 0%, #A55EAE 55%, #125B9A 100%)",
      }}
    >
      <div
        data-hero="orb"
        className="absolute -left-28 -top-28 h-[380px] w-[380px] rounded-full bg-white/10"
      />
      <div
        data-hero="orb"
        className="absolute -right-28 bottom-8 h-[420px] w-[420px] rounded-full bg-white/10"
      />

      <FloatingSticker
        dataHero="sticker"
        className="left-5 top-28 rotate-[-8deg]"
        icon={<Sparkles className="h-5 w-5 text-primary" />}
      />
      <FloatingSticker
        dataHero="sticker"
        className="left-4 top-[48%] rotate-[8deg]"
        icon={<Palette className="h-5 w-5 text-secondary" />}
      />
      <FloatingSticker
        dataHero="sticker"
        className="right-5 top-28 rotate-[-10deg]"
        icon={<Sparkles className="h-5 w-5 text-warning" />}
      />
      <FloatingSticker
        dataHero="sticker"
        className="right-5 bottom-16 rotate-[18deg]"
        icon={<ArrowUpRight className="h-5 w-5 text-primary" />}
      />

      <div className="cw-container relative grid min-h-[760px] items-center gap-10 py-[60px] lg:grid-cols-[700px_540px]">
        <div>
          <span
            data-hero="badge"
            className="inline-flex items-center gap-2 rounded-pill bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary"
          >
            <Sparkles className="h-3 w-3" />
            For creators · organizers · contestants
          </span>

          <h1 className="mt-7 max-w-3xl text-6xl font-extrabold italic leading-[0.96] tracking-[-0.06em] md:text-8xl">
            <span data-hero="line" className="block">
              Find a brief.
            </span>
            <span data-hero="line" className="block text-[#FCE6EC]">
              Win the wings.
            </span>
          </h1>

          <p data-hero="desc" className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-white md:text-xl">
            Malaysia&apos;s home for live competitions, workshops &amp; activities. Submit your work in
            minutes — get judged, get paid, get hired.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <div data-hero="cta">
              <Button asChild size="xl" className="rounded-pill bg-white text-primary hover:bg-white/90">
                <Link href="/campaigns">
                  Browse competitions <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div data-hero="cta">
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
          </div>

          <form
            data-hero="search"
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

          <div
            data-hero="live"
            className="mt-6 flex flex-wrap items-center gap-2.5 text-sm font-semibold text-white"
          >
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" />
            {liveStrip ?? "12 live now · RM 1.2M open · 240 new submissions today"}
          </div>
        </div>

        <div ref={cardsRef} className="relative hidden h-[580px] lg:block">
          {HERO_CARDS.map((card, index) => (
            <HeroCampaignCard key={card.title} index={index} {...card} />
          ))}
          <div
            data-hero="cards-hint"
            className="absolute bottom-4 right-8 inline-flex items-center gap-1.5 rounded-pill border border-white bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            8 more featured this week
          </div>
        </div>
      </div>

      {kpis.length > 0 && (
        <div className="border-t border-white/15 bg-white/10 backdrop-blur">
          <div className="cw-container grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} data-hero="kpi">
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
  index,
  title,
  category,
  deadline,
  prize,
  icon: Icon,
  gradient,
  className,
  featured,
}: HeroCard & { index: number }) {
  return (
    <div
      data-hero-card={index}
      className={`absolute overflow-hidden rounded-[18px] border-4 border-white shadow-[0_18px_32px_rgb(11_19_32/0.34)] will-change-transform ${className}`}
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

function FloatingSticker({
  className,
  icon,
  dataHero,
}: {
  className: string;
  icon: ReactNode;
  dataHero?: string;
}) {
  return (
    <div
      data-hero={dataHero}
      aria-hidden
      className={`absolute z-10 grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_8px_20px_rgb(11_19_32/0.26)] will-change-transform md:h-14 md:w-14 ${className}`}
    >
      {icon}
    </div>
  );
}
