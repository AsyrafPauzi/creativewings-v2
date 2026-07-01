import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Award,
  Building2,
  Camera,
  Check,
  Crown,
  Feather,
  Flame,
  Gavel,
  Heart,
  Mail,
  Pencil,
  Sparkles,
  Star,
  Target,
  Wallet,
} from "lucide-react";

import { BrandStoryMotion } from "@/components/site/animations/brand-story-motion";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Brand Story" };

const HERO_META = ["✨ Founded 2024", "🎯 12,400 creators", "⚡ 17/17 SDGs"];

const STORY_POSTERS = [
  {
    chip: "WINNER — 2025",
    icon: Camera,
    title: "Wings of Steel",
    subtitle: "PETRONAS — RM 50k",
    className: "left-6 top-6 rotate-[-6deg] bg-gradient-to-br from-[#EC5B7D] to-[#A55EAE]",
    height: "h-60",
  },
  {
    chip: "COHORT 01",
    icon: Pencil,
    title: "Pencil-to-Pixel",
    subtitle: "Yibon Creative",
    className: "left-[38%] top-20 rotate-[5deg] bg-gradient-to-br from-[#406CB9] to-[#5F8AD0]",
    height: "h-60",
  },
  {
    chip: "HACKATHON",
    icon: Sparkles,
    title: "KL Maker Jam",
    subtitle: "Sunway iLabs",
    className: "left-10 top-[52%] rotate-[-9deg] bg-gradient-to-br from-[#F0A23A] to-[#EC5B7D]",
    height: "h-64",
  },
  {
    chip: "CERTIFICATE",
    icon: Award,
    title: "SDG 13 Champion",
    subtitle: "Climate Hack 2025",
    className: "right-4 top-[58%] rotate-[6deg] bg-gradient-to-br from-[#3F7E44] to-[#0B1320]",
    height: "h-60",
  },
];

const VISION_MISSION = [
  {
    label: "VISION",
    icon: Sparkles,
    title: "To make Malaysian creators visible to the world.",
    bullets: [
      "Every Malaysian creator has a paid pipeline.",
      "Every brief gets seen by judges who matter.",
      "Every win shows up beyond the kampung.",
    ],
    className: "rotate-[-1deg] bg-[#F05A7E]",
  },
  {
    label: "MISSION",
    icon: Target,
    title: "To turn briefs into wings — paid, judged, celebrated.",
    bullets: [
      "List briefs in 4 minutes, not 4 weeks.",
      "Pay creators within 7 days of results.",
      "Map every brief to a UN SDG — work with a why.",
    ],
    className: "rotate-[1deg] bg-[#125B9A]",
  },
];

const PARTNERS = [
  "Petronas",
  "Maybank",
  "Sunway",
  "Universiti Malaya",
  "INTI",
  "MAS",
  "Yibon Creative",
  "Proton",
  "Sime Darby",
  "Maxis",
  "CelcomDigi",
  "MoE",
];

const TEAM_STATS = ["12 humans", "3 cities", "17 SDGs", "1 mission"];

const TEAM = [
  {
    name: "Vion Pek",
    initials: "VP",
    role: "Operations",
    body: "Runs day-to-day at Wings. Ex-agency producer with 12 years across brand and film. Believes a tight brief beats a big budget.",
    gradient: "from-[#EC5B7D] to-[#0B1320]/40",
    icon: Flame,
  },
  {
    name: "Ashraf",
    initials: "AS",
    role: "Platform",
    body: "Builds the platform and ships Build-A-Wing for schools. Ex-Grab engineer. Lover of small batches and cleanup PRs.",
    gradient: "from-[#406CB9] to-[#0B1320]/40",
    icon: Pencil,
  },
  {
    name: "Sherene Chin",
    initials: "SC",
    role: "Strategy",
    body: "Owns story and partnerships. Brought MAS, Maybank, Sime Darby onto Wings in year one. Friday newsletter editor.",
    gradient: "from-[#A55EAE] to-[#0B1320]/40",
    icon: Star,
  },
  {
    name: "Amanda Yeo",
    initials: "AY",
    role: "Creative",
    body: "Owns design, the brand mark, every poster. Ex-illustrator turned design lead. Will fight you about kerning.",
    gradient: "from-[#F0A23A] to-[#0B1320]/40",
    icon: Crown,
  },
  {
    name: "Racheang Yiyi Chan",
    initials: "RC",
    role: "Programmes",
    body: "Runs the Programmes hub — schools, competitions, workshops. Former MoE teacher who loves a clipboard.",
    gradient: "from-[#3F7E44] to-[#0B1320]/40",
    icon: Heart,
  },
  {
    name: "Najwa Salim",
    initials: "NS",
    role: "Community",
    body: "First person creators talk to. Handles wallet questions, judge feedback, and the occasional birthday card.",
    gradient: "from-[#406CB9] to-[#0B1320]/40",
    icon: Mail,
  },
];

const VALUES = [
  {
    number: "01",
    icon: Flame,
    title: "Be brave with briefs",
    color: "text-[#F05A7E]",
    bg: "bg-[#FCE6EC]",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Pay creators on time",
    color: "text-[#125B9A]",
    bg: "bg-[#E1ECF6]",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Judge fair and loud",
    color: "text-[#A55EAE]",
    bg: "bg-[#F2E5F5]",
  },
  {
    number: "04",
    icon: Crown,
    title: "Make Malaysia proud",
    color: "text-[#F0A23A]",
    bg: "bg-[#FEEFD0]",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Wings, founded",
    body: "KL apartment, four humans, a brief.",
    color: "bg-[#F05A7E]",
  },
  {
    year: "2024",
    title: "First 100 campaigns live",
    body: "PETRONAS, MAS, Yibon onboard.",
    color: "bg-[#125B9A]",
  },
  {
    year: "2025",
    title: "RM 1M paid out",
    body: "To creators across all 17 SDGs.",
    color: "bg-[#A55EAE]",
  },
  {
    year: "2025",
    title: "Programmes Hub launched",
    body: "One home for competitions, activities, workshops.",
    color: "bg-[#F0A23A]",
  },
  {
    year: "Today",
    title: "SDG taxonomy mapped",
    body: "Every brief, every goal, every win.",
    color: "bg-[#3F7E44]",
  },
];

export default function BrandStoryPage() {
  return (
    <BrandStoryMotion>
    <main className="overflow-hidden bg-white text-black">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#406CB9] via-[#A55EAE] to-[#EC5B7D]">
        <div data-brand-hero className="cw-container grid min-h-[692px] items-center gap-12 py-20 md:grid-cols-[1fr_480px] md:py-24">
          <div className="max-w-3xl">
            <span data-motion="hero-item" className="inline-flex rounded-full bg-[#F05A7E] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
              Brand Story · Since 2024 · Kuala Lumpur
            </span>
            <h1 className="mt-6 text-5xl font-extrabold italic leading-[1.05] tracking-[-0.05em] text-white md:text-7xl lg:text-[80px]">
              <span data-motion="hero-item" className="block">Together, we help</span>
              <span data-motion="hero-item" className="block text-[#FFE5DE]">young talents soar.</span>
            </h1>
            <p data-motion="hero-item" className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              无限创翼 · The wings story — a Malaysian platform paying creators for real briefs.
            </p>
            <div data-motion="hero-cta" className="mt-7 flex flex-wrap gap-3.5">
              <Button asChild size="xl" className="rounded-full bg-white text-black shadow-elevated hover:bg-white/95">
                <Link href="#founder">Read the founder letter</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-full border-white bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/brand/logo-cw.png">Press kit <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {HERO_META.map((item) => (
                <span key={item} className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-[480px] w-full max-w-[480px]">
            <div className="absolute left-[60px] top-[60px] h-[360px] w-[360px] rounded-full border border-white/20 bg-white/10" />
            <img
              data-brand-logo
              src="/brand/logo-cw-mark.png"
              alt="Creative Wings mark"
              className="absolute left-[60px] top-[60px] h-[360px] w-[360px] -rotate-2 object-contain drop-shadow-2xl"
            />
            <Sticker data-brand-sticker icon={Sparkles} className="-left-5 top-8 -rotate-12 bg-[#F05A7E]" />
            <Sticker data-brand-sticker icon={Star} className="right-0 top-0 rotate-[14deg] bg-[#125B9A]" />
            <Sticker data-brand-sticker icon={Flame} className="-left-7 bottom-14 -rotate-6 bg-[#F0A23A]" />
            <Sticker data-brand-sticker icon={Feather} className="right-3 bottom-5 rotate-[18deg] bg-[#A55EAE]" />
            <Sticker data-brand-sticker icon={Heart} className="left-[200px] -top-7 -rotate-3 bg-[#16A34A]" />
            <Sticker data-brand-sticker icon={Crown} className="left-[200px] bottom-[-38px] rotate-6 bg-white text-[#F0A23A]" />
          </div>
        </div>
      </section>

      <section className="bg-[#F8F9FB]">
        <div className="cw-container grid gap-16 py-20 md:grid-cols-[1fr_480px]">
          <div className="max-w-3xl space-y-5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">Our Story</span>
            <h2 data-motion="head" className="text-4xl font-extrabold italic leading-[1.08] tracking-[-0.04em] md:text-[56px]">
              Why we built this.
            </h2>
            <p className="leading-7">
              It started in 2024 with a simple itch. Malaysia had loads of young creators with no real pipeline from
              school brief to paid work. Asher Yap was teaching, judging, hiring — and seeing the same gap on every side
              of the table.
            </p>
            <p className="leading-7">
              So we built Creative Wings. A platform where briefs from brands, schools and NGOs land in one place, get
              tagged to UN SDGs, get judged by real industry folks, and pay creators on time. No invoices, no chasing, no
              “exposure” as currency.
            </p>
            <p className="leading-7">
              One year in, 12,400 creators have signed up. RM 1.2M has flowed to their wallets. 60+ schools run
              programmes on the platform. Every brief is mapped to a UN goal so impact stays measurable.
            </p>
            <p className="leading-7">
              Wings is still tiny. But it’s ours, it’s Malaysian, and it pays. That’s the brand. That’s the why.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F05A7E] text-sm font-extrabold text-white">
                AY
              </div>
              <div>
                <p className="text-sm font-extrabold">Asher Yap</p>
                <p className="text-[11px] font-semibold text-[#8A8F99]">Founder &amp; Visionary · Kuala Lumpur</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[560px]">
            {STORY_POSTERS.map((poster) => (
              <Poster key={poster.title} {...poster} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="cw-container grid gap-6 py-16 md:grid-cols-2 md:py-20">
          {VISION_MISSION.map((card) => (
            <section
              key={card.label}
              data-motion="card"
              className={`min-h-[440px] rounded-[24px] p-9 text-white shadow-[0_18px_36px_-6px_rgba(11,19,32,0.15)] ${card.className}`}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]">
                <card.icon className="h-3 w-3" />
                {card.label}
              </span>
              <h2 className="mt-5 max-w-xl text-3xl font-extrabold italic leading-[1.08] tracking-[-0.04em] md:text-4xl">
                {card.title}
              </h2>
              <ul className="mt-8 space-y-3">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm font-semibold leading-6 text-white/90">
                    <Check className="mt-1 h-4 w-4 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section data-brand-photo className="relative h-[420px] overflow-hidden bg-gradient-to-br from-[#406CB9] via-[#A55EAE] to-[#EC5B7D]">
        <FloatingIcon data-brand-float icon={Sparkles} className="left-[8%] top-[14%] -rotate-12 text-white" />
        <FloatingIcon data-brand-float icon={Star} className="right-[8%] top-[18%] rotate-[14deg] text-[#FFE5DE]" />
        <FloatingIcon data-brand-float icon={Feather} className="bottom-[16%] left-[14%] rotate-6 text-white" />
        <FloatingIcon data-brand-float icon={Heart} className="bottom-[12%] right-[14%] -rotate-6 text-white" />
        <Feather data-brand-feather className="absolute left-1/2 top-[60px] h-60 w-60 -translate-x-1/2 text-white/80" />
        <div className="absolute left-8 top-12 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold tracking-wide text-white md:left-20">
          <Camera className="h-3.5 w-3.5" />
          PHOTO · Climate Walk 2025, Penang
        </div>
        <div className="absolute bottom-12 left-8 md:left-20">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">Every kid deserves wings</p>
          <h2 className="mt-1 text-4xl font-extrabold italic tracking-[-0.04em] text-white md:text-[46px]">
            Every kid deserves wings.
          </h2>
        </div>
      </section>

      <section className="bg-white">
        <div className="cw-container py-[72px]">
          <SectionHeader
            eyebrow="Our Partners · Trusted By"
            title="The names backing the wings."
            action="Become a partner →"
            href="/organizers"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {PARTNERS.map((partner) => (
              <div
                key={partner}
                data-motion="partner"
                className="flex h-20 items-center justify-center gap-2 rounded-[14px] border border-[#E6E8EE] bg-[#F8F9FB] px-3 text-center text-sm font-extrabold tracking-wide text-[#555555]"
              >
                <Building2 className="h-[18px] w-[18px] shrink-0 text-[#8A8F99]" />
                {partner}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs font-semibold text-[#8A8F99]">
            {PARTNERS.join(" · ")}
          </p>
        </div>
      </section>

      <section id="founder" className="bg-[#F8F9FB]">
        <div className="cw-container py-20 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">Organization &amp; Leadership</p>
          <h2 className="mt-3 text-4xl font-extrabold italic leading-[1.1] tracking-[-0.04em] md:text-[52px]">
            The crew behind the wings.
          </h2>
          <p className="mt-3 text-[17px] text-[#555555]">Builders, judges, and dreamers.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {TEAM_STATS.map((stat) => (
              <span key={stat} className="rounded-full border border-[#E6E8EE] bg-white px-3 py-1.5 text-[11px] font-extrabold tracking-wide">
                {stat}
              </span>
            ))}
          </div>
        </div>

        <div className="cw-container pb-12">
          <div data-brand-founder className="mx-auto grid max-w-[1080px] overflow-hidden rounded-[24px] border border-[#E6E8EE] bg-white shadow-[0_22px_48px_-6px_rgba(11,19,32,0.15)] md:grid-cols-[400px_1fr]">
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 bg-gradient-to-br from-[#EC5B7D] to-[#A55EAE] p-9 text-center md:min-h-[560px]">
              <div className="grid h-[200px] w-[200px] place-items-center rounded-full border-4 border-white bg-white/90 text-[88px] font-extrabold italic leading-none tracking-[-0.08em] text-[#F05A7E]">
                AY
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">Founder · Asher Yap</p>
                <h3 className="mt-1 text-[22px] font-extrabold italic tracking-[-0.03em] text-white">Founder &amp; Visionary</h3>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
              <div>
                <div className="space-y-2 text-3xl font-extrabold italic leading-tight tracking-[-0.04em] md:text-4xl">
                  <p>“Pay young creators properly.</p>
                  <p>Give judges a real stage.</p>
                  <p>Make Malaysia proud.”</p>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#555555]">
                  Asher Yap is a Malaysian designer, educator, and entrepreneur. He started Creative Wings in 2024 after a
                  decade of teaching, hiring, and judging in the local creative industry. Based in Kuala Lumpur. Believer in
                  paid work and Friday newsletters.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Founder", "Designer", "Educator", "Kuala Lumpur"].map((fact) => (
                    <span key={fact} className="rounded-full bg-[#F8F9FB] px-3 py-1.5 text-xs font-bold text-[#555555]">
                      {fact}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 border-t border-[#E6E8EE] pt-5 text-sm font-extrabold text-[#F05A7E] sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[#555555]">LinkedIn · Instagram · Threads</span>
                <a href="mailto:asher@creativewings.my">asher@creativewings.my →</a>
              </div>
            </div>
          </div>
        </div>

        <div className="cw-container pb-20 pt-6">
          <SectionHeader eyebrow="Core Leadership Team" title="Six humans, one flock." action="Full team →" href="/organizers" />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="cw-container py-[72px]">
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">Our Values · Four Stubs</p>
            <h2 className="mt-2 text-4xl font-extrabold italic tracking-[-0.04em] md:text-[42px]">How we show up.</h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {VALUES.map((value) => (
              <ValueCard key={value.number} value={value} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F9FB]">
        <div className="cw-container py-16">
          <SectionHeader eyebrow="Timeline · Our First Chapters" title="Wings in motion." action="2024 → today" />
          <div className="mt-6 hidden h-0.5 w-full bg-[#C9CDD6] md:block" data-brand-timeline-line />
          <div data-brand-timeline className="mt-6 grid gap-4 md:grid-cols-5">
            {TIMELINE.map((item) => (
              <div key={`${item.year}-${item.title}`} data-motion="timeline-item">
                <div className="flex items-center gap-2">
                  <span className={`h-3.5 w-3.5 rounded-full border-[3px] border-white ${item.color}`} />
                  <span className="rounded-full border border-[#E6E8EE] bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#555555]">
                    {item.year}
                  </span>
                </div>
                <div className="mt-2 rounded-[14px] border border-[#E6E8EE] bg-white p-4">
                  <h3 className="text-base font-extrabold italic leading-tight tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#555555]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#0B1320]">
        <div className="cw-container grid items-center gap-12 py-20 md:grid-cols-[1fr_380px]">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/80">
              Say Hello · Partners · Schools · Parents
            </span>
            <h2 className="mt-5 max-w-4xl text-4xl font-extrabold italic leading-[1.08] tracking-[-0.04em] text-white md:text-[56px]">
              Got a brief, a story, or a kid with wings?
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-white/70">
              We&apos;d love to hear from you — partners, schools, parents, creators, the lot.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <Button asChild size="xl" className="rounded-full bg-white text-black hover:bg-white/95">
                <Link href="mailto:hello@creativewings.my">Say hello</Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-full border-white bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/organizers">Become a partner</Link>
              </Button>
            </div>
            <p className="mt-5 text-xs font-semibold text-white/60">
              hello@creativewings.my · +60 3 0000 0000 · KL HQ, Sentul Depot
            </p>
          </div>
          <div className="relative h-[280px]">
            <Sticker icon={Sparkles} className="left-8 top-8 -rotate-12 bg-[#F05A7E]" large />
            <Sticker icon={Star} className="left-36 top-0 rotate-6 bg-[#125B9A]" large />
            <Sticker icon={Flame} className="right-20 top-10 -rotate-6 bg-[#F0A23A]" large />
            <Sticker icon={Feather} className="left-16 bottom-16 rotate-6 bg-[#A55EAE]" large />
            <Sticker icon={Heart} className="right-28 bottom-10 -rotate-12 bg-[#16A34A]" large />
            <Sticker icon={Mail} className="right-6 bottom-10 rotate-[14deg] bg-white/90 text-[#F05A7E]" large />
          </div>
        </div>
      </section>

      <section className="bg-[#FCE6EC]">
        <div className="cw-container flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#F05A7E]">Weekly Drop · Fridays 8PM MYT</p>
            <h2 className="mt-1 text-[22px] font-extrabold italic tracking-[-0.03em]">
              Brand updates, fresh briefs, a few jokes.
            </h2>
          </div>
          <form className="flex w-full max-w-[480px] flex-col gap-2 sm:flex-row">
            <label className="flex min-h-10 flex-1 items-center gap-2 rounded-full border border-[#C9CDD6] bg-white px-4 text-xs text-[#8A8F99]">
              <Mail className="h-3.5 w-3.5" />
              <span className="sr-only">Email address</span>
              <input
                type="email"
                placeholder="name@school.edu.my"
                className="w-full bg-transparent outline-none placeholder:text-[#8A8F99]"
              />
            </label>
            <Button type="submit" className="rounded-full">Subscribe</Button>
          </form>
        </div>
      </section>
    </main>
    </BrandStoryMotion>
  );
}

function Sticker({
  icon: Icon,
  className,
  large = false,
  "data-brand-sticker": dataSticker,
}: {
  icon: LucideIcon;
  className: string;
  large?: boolean;
  "data-brand-sticker"?: boolean;
}) {
  return (
    <div
      data-brand-sticker={dataSticker ? "" : undefined}
      className={`absolute grid place-items-center rounded-full text-white shadow-[0_8px_16px_-2px_rgba(11,19,32,0.25)] will-change-transform ${
        large ? "h-14 w-14" : "h-12 w-12"
      } ${className}`}
    >
      <Icon className={large ? "h-6 w-6" : "h-[22px] w-[22px]"} />
    </div>
  );
}

function FloatingIcon({ icon: Icon, className, "data-brand-float": dataFloat }: { icon: LucideIcon; className: string; "data-brand-float"?: boolean }) {
  return (
    <div data-brand-float={dataFloat ? "" : undefined} className={`absolute grid h-9 w-9 place-items-center rounded-full bg-white/15 will-change-transform ${className}`}>
      <Icon className="h-[18px] w-[18px]" />
    </div>
  );
}

function Poster({
  chip,
  icon: Icon,
  title,
  subtitle,
  className,
  height,
}: {
  chip: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className: string;
  height: string;
}) {
  return (
    <div
      data-brand-poster
      className={`absolute flex w-[200px] flex-col justify-between rounded-[14px] p-3.5 text-white shadow-[0_18px_36px_-6px_rgba(11,19,32,0.25)] will-change-transform ${height} ${className}`}
    >
      <span className="w-fit rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-[#0B1320]">
        {chip}
      </span>
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white/80">
        <Icon className="h-[18px] w-[18px] text-[#EC5B7D]" />
      </div>
      <div>
        <h3 className="text-sm font-extrabold italic leading-tight">{title}</h3>
        <p className="mt-1 text-[10px] font-semibold text-white/70">{subtitle}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  href?: string;
}) {
  const actionNode = action ? (
    href ? (
      <Link href={href} className="text-sm font-extrabold text-[#F05A7E]">
        {action}
      </Link>
    ) : (
      <span className="text-sm font-bold text-[#8A8F99]">{action}</span>
    )
  ) : null;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-extrabold italic tracking-[-0.04em] md:text-4xl" data-motion="head">{title}</h2>
      </div>
      {actionNode}
    </div>
  );
}

function TeamCard({ member }: { member: (typeof TEAM)[number] }) {
  return (
    <article data-motion="team" className="overflow-hidden rounded-[18px] border border-[#E6E8EE] bg-white shadow-[0_14px_30px_-6px_rgba(11,19,32,0.08)]">
      <div className={`relative flex h-[200px] items-end bg-gradient-to-br ${member.gradient} p-6`}>
        <div className="grid h-24 w-24 place-items-center rounded-full border-[3px] border-white bg-white/90 text-2xl font-extrabold italic text-[#F05A7E]">
          {member.initials}
        </div>
        <div className="absolute right-7 top-5 grid h-[42px] w-[42px] -rotate-6 place-items-center rounded-full bg-white/90">
          <member.icon className="h-5 w-5 text-[#F05A7E]" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold italic tracking-[-0.03em]">{member.name}</h3>
            <p className="mt-1 rounded-full bg-[#F8F9FB] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#8A8F99]">
              {member.role}
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#F05A7E]">View →</span>
        </div>
        <p className="mt-3 text-[13px] leading-6 text-[#555555]">{member.body}</p>
        <div className="mt-5 flex items-center justify-between border-t border-[#E6E8EE] pt-3 text-xs font-bold text-[#8A8F99]">
          <span>LinkedIn</span>
          <span>Say hi →</span>
        </div>
      </div>
    </article>
  );
}

function ValueCard({ value }: { value: (typeof VALUES)[number] }) {
  return (
    <article data-motion="value" className="flex min-h-[126px] overflow-hidden rounded-[18px] border border-[#E6E8EE] bg-white shadow-[0_14px_30px_-6px_rgba(11,19,32,0.08)]">
      <div className={`flex w-[88px] shrink-0 flex-col items-center justify-center gap-2 ${value.bg} ${value.color}`}>
        <value.icon className="h-[22px] w-[22px]" />
        <span className="text-4xl font-extrabold italic leading-none tracking-[-0.04em]">{value.number}</span>
      </div>
      <div className="flex w-3 shrink-0 flex-col justify-center gap-[5px] px-1.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} className="h-0.5 w-0.5 rounded-full bg-[#C9CDD6]" />
        ))}
      </div>
      <div className="p-5">
        <h3 className="text-[15px] font-extrabold italic leading-snug tracking-[-0.02em]">{value.title}</h3>
        <p className="mt-5 text-xs leading-5 text-[#8A8F99]">One line. One promise. Posted on every laptop.</p>
      </div>
    </article>
  );
}
