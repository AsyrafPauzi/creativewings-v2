import Link from "next/link";

import { SdgMotion } from "@/components/site/animations/sdg-motion";
import { SdgIcon } from "@/components/site/sdg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SDG_GOALS } from "@/lib/utils";

export const metadata = {
  title: "Sustainable Development Goals",
  description: "Every Creative Wings campaign aligns with at least one of the 17 UN SDGs.",
};

const goalDescriptions: Record<number, string> = {
  1: "End poverty in all its forms everywhere",
  2: "End hunger, achieve food security & nutrition",
  3: "Healthy lives & well-being for all ages",
  4: "Inclusive & equitable quality education",
  5: "Achieve gender equality & empower all women",
  6: "Sustainable water management for all",
  7: "Affordable, reliable, sustainable energy",
  8: "Inclusive & sustainable economic growth",
  9: "Resilient infrastructure, innovation",
  10: "Reduce inequality within & among countries",
  11: "Inclusive, safe, resilient cities",
  12: "Sustainable consumption & production",
  13: "Urgent action to combat climate change",
  14: "Conserve & sustainably use oceans",
  15: "Protect & restore terrestrial ecosystems",
  16: "Peaceful societies, access to justice",
  17: "Strengthen global partnerships",
};

const impactStats = [
  { value: "12,400", label: "Creators", detail: "active across 17 goals" },
  { value: "RM 1.2M", label: "Paid out", detail: "to creators since 2024" },
  { value: "60+", label: "Schools", detail: "running CW programmes" },
  { value: "17/17", label: "SDGs", detail: "covered. Every wing flying." },
];

const climateBriefs = [
  "Low-carbon school poster challenge",
  "Community flood-ready mural brief",
  "Plastic-free weekend video prompt",
  "Youth climate pledge badge design",
];

const voices = [
  {
    quote:
      "SDG mapping made it easy to pitch my brief to schools - they instantly knew it fit their curriculum.",
    name: "Sherene Chin",
    role: "Organizer",
  },
  {
    quote:
      "As a young creator, knowing my work counts toward a global goal makes me push harder.",
    name: "Aina H.",
    role: "Student creator",
  },
  {
    quote:
      "We judged a Climate Action brief last month. Best 48 hours of my year. Real impact, real talent.",
    name: "Cikgu Faiz",
    role: "Teacher judge",
  },
];

const resources = [
  {
    title: "SDG one-pager",
    detail: "Quick overview of the 17 goals",
    color: "#F05A7E",
  },
  {
    title: "CW SDG taxonomy mapping",
    detail: "How we map briefs to UN goals",
    color: "#125B9A",
  },
  {
    title: "Brand assets pack",
    detail: "Logos, icons, color tokens",
    color: "#A55EAE",
  },
  {
    title: "Align your campaign with an SDG",
    detail: "A step-by-step guide for organizers",
    color: "#3F7E44",
  },
];

const orbitGoals = Array.from({ length: 17 }, (_, index) => {
  const angle = -90 + index * (360 / 17);
  const radius = 210;

  return {
    goal: index + 1,
    x: 260 + Math.cos((angle * Math.PI) / 180) * radius - 32,
    y: 260 + Math.sin((angle * Math.PI) / 180) * radius - 32,
  };
});

export default function SDGPage() {
  const goals = Object.entries(SDG_GOALS).map(([num, meta]) => {
    const goal = Number.parseInt(num, 10);

    return {
      goal,
      num,
      ...meta,
      description: goalDescriptions[goal],
    };
  });

  return (
    <SdgMotion>
    <div className="bg-background text-body">
      <section className="overflow-hidden bg-[#0B1320]">
        <div data-sdg-hero className="cw-container grid min-h-[620px] items-center gap-12 py-20 md:py-24 lg:grid-cols-[1fr_520px]">
          <div className="max-w-2xl">
            <span data-motion="hero-item" className="inline-flex rounded-pill bg-[#F05A7E] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              SDG Taxonomy &middot; Briefs With Purpose
            </span>
            <h1 className="mt-6 text-6xl font-extrabold italic leading-[0.96] tracking-[-0.06em] text-white md:text-8xl">
              <span data-motion="hero-item" className="block">The 17 wings</span>
              <span data-motion="hero-item" className="block text-[#FFE5DE]">of the world.</span>
            </h1>
            <p data-motion="hero-item" className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Every brief on Creative Wings is mapped to a UN Sustainable Development Goal. Pick
              a wing, find your brief, leave a mark.
            </p>
            <div data-motion="hero-cta" className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="xl"
                className="rounded-pill bg-[#F05A7E] px-7 font-extrabold hover:bg-[#e44d72]"
              >
                <Link href="/campaigns">Browse SDG briefs</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-pill border-white/35 bg-white/10 px-7 font-extrabold text-white hover:bg-white/20"
              >
                <Link href="#sdg-grid">Explore all 17</Link>
              </Button>
            </div>
            <div data-motion="hero-item" className="mt-7 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.04em] text-white">
              <span className="rounded-pill bg-white/15 px-3 py-2">17/17 covered</span>
              <span className="rounded-pill bg-white/15 px-3 py-2">240 briefs mapped</span>
              <span className="rounded-pill bg-white/15 px-3 py-2">Updated weekly</span>
            </div>
          </div>

          <div data-sdg-orbit className="relative mx-auto hidden h-[520px] w-[520px] lg:block" aria-hidden="true">
            <div data-sdg-ring className="absolute left-[120px] top-[120px] h-[280px] w-[280px] rounded-full border border-white/20 bg-white/10" />
            <div data-sdg-ring className="absolute left-[170px] top-[170px] h-[180px] w-[180px] rounded-full border border-white/30 bg-white/15" />
            <div className="absolute left-[170px] top-[170px] grid h-[180px] w-[180px] place-items-center rounded-full">
              <div className="text-center">
                <div className="text-8xl font-extrabold italic leading-none tracking-[-0.08em] text-white">
                  17
                </div>
                <div className="text-sm font-extrabold uppercase tracking-[0.28em] text-white/80">
                  Wings
                </div>
              </div>
            </div>
            {orbitGoals.map(({ goal, x, y }) => (
              <div key={goal} data-sdg-orbit-icon className="absolute will-change-transform" style={{ left: x, top: y }}>
                <SdgIcon
                  goal={goal}
                  size={64}
                  rounded="md"
                  className="shadow-[0_10px_30px_-12px_rgb(11_19_32/0.7)]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-sdg-partner className="border-b bg-surface px-4 py-7 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-center gap-5 text-center lg:flex-row lg:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#125B9A] text-lg font-extrabold text-white">
              UN
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-text-muted">
                Partnered with
              </p>
              <p className="text-base font-extrabold">
                United Nations Sustainable Development Goals
              </p>
            </div>
          </div>
          <div className="hidden h-9 w-px bg-border-strong lg:block" />
          <p className="text-sm font-semibold text-text-secondary">
            We&apos;re a signatory partner since 2024 - every campaign aligns to a goal.
          </p>
          <span className="inline-flex rounded-pill bg-[#16A34A] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white">
            Verified Partner
          </span>
        </div>
      </section>

      <section id="sdg-grid" className="cw-container py-16 md:py-[72px]">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
              The 17 Wings &middot; Pick Yours
            </p>
            <h2 data-motion="head" className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] md:text-[42px]">
              Browse all goals.
            </h2>
          </div>
          <p className="text-sm font-bold text-text-secondary">Sort: most active ↓</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((meta) => (
            <Link
              key={meta.num}
              data-motion="card"
              href={`/campaigns?sdg=${meta.num}`}
              className="group flex min-h-[340px] flex-col rounded-[16px] border bg-card p-5 shadow-[0_8px_18px_-12px_rgb(11_19_32/0.18)] transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <SdgIcon goal={meta.goal} size={96} rounded="md" />
              <div
                className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: meta.color }}
              >
                SDG {meta.num}
              </div>
              <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-[-0.02em] group-hover:text-primary">
                {meta.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-text-secondary">{meta.description}</p>
              <span className="mt-auto pt-6 text-xs font-extrabold" style={{ color: meta.color }}>
                Browse Goal {meta.num}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#406CB9_0%,#A55EAE_55%,#EC5B7D_100%)] py-16 text-white md:py-[72px]">
        <div className="cw-container text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
            Live Impact &middot; All 17 Goals
          </p>
          <h2 data-motion="head" className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] md:text-5xl">
            Wings in motion.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {impactStats.map((stat) => (
              <div key={stat.label} data-motion="stat" className="rounded-[18px] bg-white/10 p-5 backdrop-blur">
                <div className="text-5xl font-extrabold italic leading-none tracking-[-0.06em] md:text-[64px]">
                  {stat.value}
                </div>
                <div className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                  {stat.label}
                </div>
                <p className="mt-1 text-xs leading-5 text-white/75">{stat.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">
            Tap a wing to filter briefs
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {goals.map((meta) => (
              <Link
                key={meta.num}
                data-motion="sdg-chip"
                href={`/campaigns?sdg=${meta.num}`}
                aria-label={`Browse SDG ${meta.num}`}
              >
                <SdgIcon
                  goal={meta.goal}
                  size={44}
                  rounded="sm"
                  className="shadow-soft transition-transform hover:-translate-y-0.5"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-20">
        <div className="cw-container">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#3F7E44]">
                Pick A Wing &middot; See Briefs
              </p>
              <h2 data-motion="head" className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] md:text-[42px]">
                Currently flying: Climate Action.
              </h2>
            </div>
            <p className="text-sm font-bold text-[#3F7E44]">Switch wing ↓</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[520px_1fr]">
            <div className="rounded-[22px] border bg-card p-7 shadow-[0_18px_36px_-22px_rgb(11_19_32/0.25)]">
              <SdgIcon goal={13} size={128} rounded="md" />
              <h3 className="mt-5 text-3xl font-extrabold italic tracking-[-0.04em]">
                Climate Action
              </h3>
              <p className="mt-3 text-sm font-semibold italic leading-6 text-text-secondary">
                &quot;Take urgent action to combat climate change and its impacts.&quot; - UN SDG
                13
              </p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="font-extrabold">Sample briefs aligned to SDG 13</span>
                <span className="text-xs font-semibold text-text-muted">4 of 24 shown</span>
              </div>
              <Link
                href="/campaigns?sdg=13"
                className="mt-5 inline-flex text-sm font-extrabold text-[#3F7E44]"
              >
                View all 24 SDG 13 briefs →
              </Link>
            </div>

            <div className="grid gap-3">
              {climateBriefs.map((brief, index) => (
                <Link
                  key={brief}
                  data-motion="brief"
                  href="/campaigns?sdg=13"
                  className="flex items-center justify-between rounded-[16px] border bg-white p-5 shadow-soft transition-colors hover:border-[#3F7E44]"
                >
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#3F7E44]">
                      Brief 0{index + 1}
                    </p>
                    <p className="mt-1 font-extrabold">{brief}</p>
                  </div>
                  <span className="text-xl text-[#3F7E44]">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cw-container py-16">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
          Voices &middot; Why The Mapping Matters
        </p>
        <h2 data-motion="head" className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] md:text-[42px]">
          When briefs have a why.
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {voices.map((voice) => (
            <figure key={voice.name} data-motion="alt" className="rounded-[18px] border bg-card p-6">
              <blockquote className="text-[15px] font-semibold italic leading-7">
                &quot;{voice.quote}&quot;
              </blockquote>
              <figcaption className="mt-5">
                <div className="font-extrabold">{voice.name}</div>
                <div className="text-xs font-semibold text-text-muted">{voice.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16 md:py-20">
        <div className="cw-container grid items-center gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
              CW Story &middot; On SDG Taxonomy
            </p>
            <h2 className="mt-3 text-4xl font-extrabold italic leading-tight tracking-[-0.04em] md:text-5xl">
              Why we map briefs to SDGs.
            </h2>
            <p className="mt-5 max-w-3xl leading-7">
              We started Creative Wings to pay Malaysian creators for real briefs. We mapped each
              brief to the UN&apos;s 17 Sustainable Development Goals because work without a why
              fades fast.
            </p>
            <p className="mt-4 max-w-3xl leading-7">
              Goal mapping helps organizers find their audience, helps creators see their impact,
              and helps schools justify time on creative briefs. One small tag, three big wins.
            </p>
          </div>
          <div className="relative mx-auto h-[420px] w-full max-w-[380px]" aria-hidden="true">
            <div data-sdg-story-card className="absolute left-10 top-8 flex h-[360px] w-[280px] -rotate-3 flex-col justify-between rounded-[18px] bg-[linear-gradient(135deg,#406CB9,#A55EAE)] p-6 text-white shadow-[0_24px_42px_-18px_rgb(11_19_32/0.4)]">
              <span className="w-fit rounded-pill bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#0B1320]">
                Our Brand Wing
              </span>
              <div>
                <SdgIcon goal={17} size={86} rounded="md" />
                <p className="mt-4 text-lg font-extrabold italic">Creative Wings</p>
                <p className="text-xs font-semibold text-white/70">
                  Since 2024 &middot; 17/17 SDGs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-container py-16">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
              Resources &middot; Open Assets
            </p>
            <h2 className="mt-2 text-3xl font-extrabold italic tracking-[-0.04em] md:text-4xl">
              Open kit. Take what you need.
            </h2>
          </div>
          <p className="text-xs font-bold text-text-muted">CC-BY 4.0 &middot; Free to use</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {resources.map((resource) => (
            <Link
              key={resource.title}
              data-motion="card"
              href="/sustainable-development-goals"
              className="rounded-[16px] border bg-card p-5 transition-colors hover:bg-surface"
            >
              <h3 className="font-extrabold tracking-[-0.02em]">{resource.title}</h3>
              <p className="mt-2 text-xs leading-5 text-text-secondary">{resource.detail}</p>
              <span
                className="mt-5 inline-flex text-xs font-extrabold"
                style={{ color: resource.color }}
              >
                Download
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden bg-[#0B1320] py-16 text-white md:py-20">
        <div className="cw-container grid items-center gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <span className="inline-flex rounded-pill bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/80">
              For Organizers &middot; Schools &middot; Brands
            </span>
            <h2 className="mt-5 max-w-4xl text-4xl font-extrabold italic leading-tight tracking-[-0.04em] md:text-5xl">
              Have a brief that fits an SDG? List it on Creative Wings.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              We help you tag your brief, find the right audience, and report impact at the end
              of the campaign.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="xl"
                className="rounded-pill bg-[#F05A7E] px-7 font-extrabold hover:bg-[#e44d72]"
              >
                <Link href="/dashboard/campaigns/new">List a brief</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-pill border-white/35 bg-white/10 px-7 font-extrabold text-white hover:bg-white/20"
              >
                <Link href="/organizers">Talk to us</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden h-[200px] lg:block" aria-hidden="true">
            <div data-sdg-cta-icon className="absolute left-8 top-8 -rotate-6">
              <SdgIcon goal={13} size={96} rounded="md" className="shadow-[0_18px_36px_-18px_rgb(255_255_255/0.3)]" />
            </div>
            <div data-sdg-cta-icon className="absolute left-[140px] top-8 rotate-3">
              <SdgIcon goal={4} size={96} rounded="md" className="shadow-[0_18px_36px_-18px_rgb(255_255_255/0.3)]" />
            </div>
            <div data-sdg-cta-icon className="absolute left-[250px] top-8 -rotate-3">
              <SdgIcon goal={11} size={96} rounded="md" className="shadow-[0_18px_36px_-18px_rgb(255_255_255/0.3)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FCE6EC] px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#F05A7E]">
              Weekly Drop
            </p>
            <h2 className="text-[22px] font-extrabold italic tracking-[-0.03em]">
              Friday: new SDG briefs, in your inbox.
            </h2>
          </div>
          <form className="flex w-full max-w-[480px] gap-2">
            <Input
              type="email"
              aria-label="Email address"
              placeholder="name@school.edu.my"
              className="h-11 rounded-pill border-border-strong bg-white shadow-none"
            />
            <Button
              type="submit"
              className="h-11 rounded-pill bg-[#F05A7E] px-5 font-extrabold hover:bg-[#e44d72]"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
    </SdgMotion>
  );
}
