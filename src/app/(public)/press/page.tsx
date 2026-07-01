import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  Copy,
  Download,
  Feather,
  FileText,
  Lightbulb,
  Mail,
  Mic,
  Monitor,
  Newspaper,
  Palette,
  Quote,
  RadioTower,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { PageMotion } from "@/components/site/animations/page-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Press",
  description:
    "Press releases, brand assets, founder quotes, and media contacts for Creative Wings.",
};

const PRESS_EMAIL = "press@creativewings.asia";
const PRESS_PHONE = "+60 12-345-6789";

const pressItems = [
  {
    category: "Funding",
    title: "Creative Wings raises seed to grow Malaysia's creator economy.",
    body: "The Kuala Lumpur-based platform closed a multi-million ringgit round led by regional investors to expand its competition and workshop network.",
    publication: "The Edge",
    date: "Oct 2025",
    color: "from-[#F05A7E] via-[#5E2B6A] to-[#0B1320]",
    badge: "bg-primary",
  },
  {
    category: "Feature",
    title: "How a 14-year-old won RM 12k drawing for an oil company brief.",
    body: "A student from Penang topped the Wings Studio brief, beating 600+ entries and walking away with the largest open-brief prize so far.",
    publication: "Nikkei Asia",
    date: "Nov 2025",
    color: "from-[#F4A95F] to-[#C12E5B]",
    badge: "bg-info",
  },
  {
    category: "Brand",
    title: "The infinity-wing story, decoded — inside CW's logo philosophy.",
    body: "Founder Vion Pek breaks down the geometry behind the mark and what infinity means for the next generation of Malaysian creators.",
    publication: "Tatler Asia",
    date: "Dec 2025",
    color: "from-[#125B9A] to-[#0B1320]",
    badge: "bg-warning",
  },
  {
    category: "Award",
    title: "Creative Wings named MDEC PIKOM Star of the Year (Platform).",
    body: "The local platform takes home one of Malaysia's most-watched tech awards, citing impact on creative livelihoods.",
    publication: "MDEC PIKOM",
    date: "Jan 2026",
    color: "from-[#16A34A] to-[#0B1320]",
    badge: "bg-success",
  },
  {
    category: "Op-ed",
    title: "Why we mapped every brief to a UN SDG — and what changed.",
    body: "Mapping each campaign to one of 17 goals nudged organizers to brief better and creators to think bigger.",
    publication: "Malay Mail",
    date: "Feb 2026",
    color: "from-[#7C3AED] to-[#1F1147]",
    badge: "bg-[#7C3AED]",
  },
  {
    category: "Mention",
    title: "Vulcan Post lists Creative Wings among Malaysia's startups to watch.",
    body: "The annual roundup names CW one of 25 founder-led startups shaping the local tech scene in 2026.",
    publication: "Vulcan Post",
    date: "Mar 2026",
    color: "from-[#0B1320] to-[#125B9A]",
    badge: "bg-primary",
  },
];

const mediaLogos = [
  "The Edge",
  "Vulcan Post",
  "Nikkei Asia",
  "TechCrunch",
  "Tatler Asia",
  "BFM 89.9",
  "Astro Awani",
  "Malay Mail",
];

const brandAssets = [
  {
    title: "Logo — Mark",
    description: "Transparent, 2048x2048",
    format: "PNG",
    size: "1.2 MB",
    icon: null,
    image: "/brand/logo-cw-mark.png",
    surface: "cw-gradient-bg",
  },
  {
    title: "Logo — Mark",
    description: "Scalable, single-color",
    format: "SVG",
    size: "24 KB",
    icon: null,
    image: "/brand/logo-cw-mark.png",
    surface: "bg-surface",
  },
  {
    title: "Logo — Lockup",
    description: "Transparent, full wordmark",
    format: "PNG",
    size: "1.8 MB",
    icon: null,
    image: "/brand/logo-cw.png",
    surface: "bg-foreground",
  },
  {
    title: "Brand book",
    description: "32-page guidelines",
    format: "PDF",
    size: "6.4 MB",
    icon: BookOpen,
    surface: "bg-brand-soft",
  },
  {
    title: "Founder portraits",
    description: "6 photos, RAW + JPG",
    format: "ZIP",
    size: "18.2 MB",
    icon: Camera,
    surface: "bg-info-soft",
  },
  {
    title: "Product screenshots",
    description: "Web + mobile, 2x",
    format: "ZIP",
    size: "12.5 MB",
    icon: Monitor,
    surface: "bg-brand-soft",
  },
  {
    title: "Press kit one-pager",
    description: "Stats, bios, contacts",
    format: "PDF",
    size: "2.1 MB",
    icon: FileText,
    surface: "bg-success-soft",
  },
  {
    title: "Color & font tokens",
    description: "For embeds and articles",
    format: "TXT",
    size: "3 KB",
    icon: Palette,
    surface: "bg-warning-soft",
  },
];

const quotes = [
  {
    tag: "Use this in your story · Infinity-wing",
    quote:
      "We didn't build Creative Wings for unicorn dreams. We built it because Malaysian creators deserve briefs that pay, judges who care, and a wing big enough for everybody.",
    name: "Vion Pek",
    role: "Founder & brand lead",
    initials: "VP",
    color: "bg-primary",
  },
  {
    tag: "Use this in your story · Organizers",
    quote:
      "Brands keep telling us, we want authentic Gen-Z reach. Creative Wings is the only place in Malaysia where they can buy that without buying ads.",
    name: "Aisyah Daniel",
    role: "Organizer partnerships",
    initials: "AD",
    color: "bg-info",
  },
  {
    tag: "Use this in your story · Schools",
    quote:
      "Every sponsored slot we unlock means a kid in Sabah, Sarawak, or Kelantan can enter the same brief as KL. That's the real wing.",
    name: "Razin Halim",
    role: "School programmes",
    initials: "RH",
    color: "bg-warning",
  },
  {
    tag: "Use this in your story · CommercePay",
    quote:
      "Creators got burned for decades because briefs went viral but money didn't. CommercePay is our small refusal to repeat that.",
    name: "Iman Wong",
    role: "CommercePay operations",
    initials: "IW",
    color: "bg-[#7C3AED]",
  },
];

const storyAngles = [
  {
    title: "How a 14-year-old won RM 12k",
    subtitle: "Brief: Oil-co clean-energy campaign",
    icon: Trophy,
    color: "text-primary",
    surface: "bg-brand-soft",
    rotation: "-rotate-1",
  },
  {
    title: "Why we map briefs to SDGs",
    subtitle: "Brief mapping process — our quiet bet",
    icon: Target,
    color: "text-info",
    surface: "bg-info-soft",
    rotation: "rotate-1",
  },
  {
    title: "The infinity-wing logo, decoded",
    subtitle: "The geometry behind the mark",
    icon: Feather,
    color: "text-warning",
    surface: "bg-warning-soft",
    rotation: "-rotate-1",
  },
  {
    title: "Behind the certificate factory",
    subtitle: "40k digital cert badges shipped",
    icon: Award,
    color: "text-primary",
    surface: "bg-brand-soft",
    rotation: "rotate-1",
  },
  {
    title: "How CommercePay protects payouts",
    subtitle: "The escrow you didn't know existed",
    icon: ShieldCheck,
    color: "text-success",
    surface: "bg-success-soft",
    rotation: "-rotate-1",
  },
  {
    title: "What organizers say about us",
    subtitle: "Net-promoter, but for briefs",
    icon: Sparkles,
    color: "text-[#7C3AED]",
    surface: "bg-[#E9DDFA]",
    rotation: "rotate-1",
  },
];

const awards = [
  {
    title: "Star of the Year — Platform",
    source: "MDEC PIKOM",
    year: "2026",
    icon: Award,
    gradient: "from-[#F4A95F] to-[#C12E5B]",
  },
  {
    title: "Gen.T Honoree",
    source: "Tatler Asia",
    year: "2026",
    icon: Sparkles,
    gradient: "from-[#0B1320] to-[#5E2B6A]",
  },
  {
    title: "Top 25 Startups to Watch",
    source: "Vulcan Post",
    year: "2025",
    icon: TrendingUp,
    gradient: "from-[#7C3AED] to-[#1F1147]",
  },
  {
    title: "Brief of the Year (Open)",
    source: "AAPA Awards",
    year: "2025",
    icon: Trophy,
    gradient: "from-[#16A34A] to-[#0B1320]",
  },
  {
    title: "Creator-friendly Platform 2025",
    source: "CONTENT.kuala",
    year: "2025",
    icon: Feather,
    gradient: "from-[#125B9A] to-[#F05A7E]",
  },
];

const chips = ["All", "Releases", "Features", "Mentions", "Awards", "Op-eds"];

export default function PressPage() {
  return (
    <PageMotion hero>
    <div className="overflow-hidden bg-background">
      <HeroSection />
      <PressFeed />
      <AsSeenIn />
      <BrandAssets />
      <QuotesSection />
      <StoryAngles />
      <PressContactBand />
      <AwardsStrip />
      <NewsletterRibbon />
    </div>
    </PageMotion>
  );
}

function HeroSection() {
  return (
    <section data-motion="hero" className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#F05A7E_0%,#A55EAE_55%,#125B9A_100%)]">
      <div data-motion-blob className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-white/10 will-change-transform" />
      <div data-motion-blob className="absolute -bottom-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-white/10 will-change-transform" />
      <FloatingIcon icon={Newspaper} className="left-6 top-24 -rotate-6 text-primary" />
      <FloatingIcon icon={Mic} className="left-[47%] top-20 rotate-12 bg-warning-soft text-warning" />
      <FloatingIcon icon={Quote} className="left-10 top-[48%] rotate-6 text-info" />
      <FloatingIcon icon={Camera} className="bottom-24 left-8 -rotate-6 bg-brand-soft text-primary" />
      <FloatingIcon icon={Star} className="bottom-20 right-10 rotate-12 bg-warning-soft text-warning" />
      <FloatingIcon icon={Feather} className="bottom-16 left-[40%] -rotate-12 bg-info-soft text-info" />

      <div className="cw-container relative z-10 grid min-h-[720px] items-center gap-12 py-20 text-white lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="max-w-3xl">
          <Badge data-motion="hero-item" className="border-transparent bg-white px-3.5 py-1.5 text-primary">
            <Newspaper className="h-3.5 w-3.5" />
            Press · Media Room · Malaysia
          </Badge>
          <h1 className="mt-7 text-5xl font-extrabold italic leading-[0.95] tracking-tight md:text-7xl">
            <span data-motion="hero-item" className="block">Press the wing.</span>
            <span data-motion="hero-item" className="block text-brand-soft">Stories worth telling.</span>
          </h1>
          <p data-motion="hero-item" className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
            Press releases, brand assets, founder bios, and the contact you actually need —
            straight from Malaysia&apos;s home for creative competitions.
          </p>
          <div data-motion="hero-cta" className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="xl" className="rounded-pill bg-white text-primary hover:bg-white/90">
              <Link href="#brand-assets">
                Download press kit <Download className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="rounded-pill border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a href={`mailto:${PRESS_EMAIL}`}>
                Email press team <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="mt-7 flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-soft" />
            24h press response · {PRESS_EMAIL} · {PRESS_PHONE}
          </p>
        </div>

        <div className="relative mx-auto h-[540px] w-full max-w-lg">
          <MagazineCard
            className="left-0 top-24 -rotate-6 from-[#125B9A] to-[#0B1320]"
            publication="Nikkei Asia"
            date="Nov 2025"
            title="How a school art club won RM 50k"
            kicker="Feature"
          />
          <MagazineCard
            className="left-32 top-8 rotate-3 from-[#F4A95F] to-[#C12E5B]"
            publication="The Edge"
            date="Oct 2025"
            title="Creative Wings raises seed round"
            kicker="Funding"
          />
          <MagazineCard
            className="left-16 top-20 z-10 -rotate-3 from-[#F05A7E] via-[#5E2B6A] to-[#0B1320]"
            publication="Tatler Asia"
            date="Dec 2025"
            title="The infinity-wing story, decoded"
            kicker="Brand deep dive"
            large
          />
        </div>
      </div>
    </section>
  );
}

function PressFeed() {
  return (
    <section className="cw-section bg-background" id="latest-press">
      <div className="cw-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Latest Press</span>
            <h2 className="mt-3 text-4xl font-extrabold italic tracking-tight text-body md:text-5xl">
              Recent stories.
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-pill border bg-surface px-4 py-2 text-sm font-bold">
            Sort: Newest first
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <span
              key={chip}
              className={cn(
                "rounded-pill border px-4 py-2 text-sm font-bold",
                index === 0
                  ? "border-foreground bg-foreground text-white"
                  : "border-border bg-surface text-body",
              )}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pressItems.map((item) => (
            <article key={item.title} data-motion="card" className="overflow-hidden rounded-3xl border bg-card shadow-soft will-change-transform">
              <div className={cn("h-48 bg-gradient-to-br", item.color)} />
              <div className="space-y-4 p-5">
                <span
                  className={cn(
                    "inline-flex rounded-pill px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white",
                    item.badge,
                  )}
                >
                  {item.category}
                </span>
                <h3 className="text-xl font-extrabold italic leading-tight tracking-tight text-body">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">{item.body}</p>
                <div className="flex items-center justify-between border-t pt-4 text-xs font-bold text-text-muted">
                  <span>
                    {item.publication} · {item.date}
                  </span>
                  <Link href="#press-contact" className="inline-flex items-center gap-1 text-info">
                    Read <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg" className="rounded-pill border-info text-info">
            <Link href="#latest-press">
              All press releases <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function AsSeenIn() {
  return (
    <section className="bg-surface py-14">
      <div className="cw-container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Badge variant="outline" className="w-fit bg-white text-primary">
            <RadioTower className="h-3.5 w-3.5" />
            As Seen In
          </Badge>
          <p className="text-sm font-medium text-text-secondary">
            Selected coverage of Creative Wings in regional and Malaysian media.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {mediaLogos.map((name) => (
            <div
              key={name}
              className="grid h-16 place-items-center rounded-2xl border bg-white px-4 text-center text-sm font-extrabold tracking-wide text-text-muted"
            >
              {name}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm font-semibold text-text-secondary">
          42 articles · 16 broadcast features · 4 podcast interviews · 2 awards ·{" "}
          <span className="text-text-muted">Updated weekly</span>
        </p>
      </div>
    </section>
  );
}

function BrandAssets() {
  return (
    <section className="cw-section bg-background" id="brand-assets">
      <div className="cw-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-info">Brand Assets</span>
            <h2 className="mt-3 text-4xl font-extrabold italic tracking-tight text-body md:text-5xl">
              Tools for the press.
            </h2>
            <p className="mt-3 text-text-secondary">
              Logos, founder portraits, product shots — high-res and ready. Hot-link if you must,
              but please use the right colorways.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-pill bg-foreground text-white hover:bg-foreground/90">
            <Link href="#brand-assets">
              <Download className="h-4 w-4" /> Download everything (.zip)
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {brandAssets.map((asset) => (
            <AssetCard key={`${asset.title}-${asset.description}`} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuotesSection() {
  return (
    <section className="cw-section bg-surface">
      <div className="cw-container">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Founder & Leadership
          </span>
          <h2 className="mt-3 text-4xl font-extrabold italic tracking-tight text-body md:text-5xl">
            Quote us, properly.
          </h2>
          <p className="mt-3 text-text-secondary">
            Pre-approved quotes by topic. Hit copy, drop into your story.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quotes.map((item) => (
            <article key={item.name} data-motion="card" className="rounded-3xl border bg-white p-6 shadow-soft will-change-transform">
              <Badge variant="info" className="text-[9px] uppercase tracking-[0.12em]">
                {item.tag}
              </Badge>
              <Quote className="mt-5 h-6 w-6 text-primary" />
              <p className="mt-4 text-base font-bold italic leading-relaxed text-body">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center justify-between border-t pt-5">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white",
                      item.color,
                    )}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-body">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-pill border px-3 py-1.5 text-xs font-bold">
                  <Copy className="h-3 w-3" /> Copy
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryAngles() {
  return (
    <section className="cw-section bg-background">
      <div className="cw-container">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-primary">
            <Lightbulb className="h-4 w-4" /> Want a story?
          </span>
          <h2 className="mt-3 text-4xl font-extrabold italic tracking-tight text-body md:text-5xl">
            Story angles we love.
          </h2>
          <p className="mt-3 text-text-secondary">
            Six beats our team is ready to talk about — with sources, stats, and a quote.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {storyAngles.map((angle, index) => (
            <article
              key={angle.title}
              className={cn(
                "rounded-3xl border p-6 shadow-soft transition-transform hover:rotate-0",
                angle.surface,
                angle.rotation,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
                  <angle.icon className={cn("h-5 w-5", angle.color)} />
                </div>
                <span className={cn("rounded-pill bg-white px-3 py-1 text-xs font-extrabold", angle.color)}>
                  #{index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold italic leading-tight tracking-tight text-body">
                {angle.title}
              </h3>
              <p className="mt-3 text-sm font-semibold text-body">{angle.subtitle}</p>
              <div className="mt-6 flex items-center justify-between text-xs font-bold">
                <a href={`mailto:${PRESS_EMAIL}`} className={cn("inline-flex items-center gap-1", angle.color)}>
                  <Send className="h-3 w-3" /> Pitch this angle
                </a>
                <span className="text-text-muted">3-5 min read</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PressContactBand() {
  return (
    <section className="bg-surface py-16" id="press-contact">
      <div className="cw-container">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#F05A7E_0%,#A55EAE_55%,#125B9A_100%)] p-8 text-white shadow-elevated md:p-12">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-white/10" />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className="border-white/30 bg-white/15 text-white">
                <Mail className="h-3.5 w-3.5" /> Direct Line
              </Badge>
              <h2 className="mt-4 text-4xl font-extrabold italic tracking-tight md:text-5xl">
                Press inquiry?
              </h2>
              <p className="mt-3 text-white/80">We respond in 24 hours, on weekdays. Press in 4.</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                <a href={`mailto:${PRESS_EMAIL}`} className="rounded-pill border border-white/30 bg-foreground/30 px-4 py-2">
                  {PRESS_EMAIL}
                </a>
                <a href={`tel:${PRESS_PHONE.replace(/\s/g, "")}`} className="rounded-pill border border-white/30 bg-foreground/30 px-4 py-2">
                  {PRESS_PHONE}
                </a>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="mb-4 flex gap-2 md:justify-end">
                <span className="grid h-11 w-11 -rotate-6 place-items-center rounded-full bg-white text-primary shadow-soft">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="grid h-11 w-11 rotate-6 place-items-center rounded-full bg-warning-soft text-warning shadow-soft">
                  <RadioTower className="h-5 w-5" />
                </span>
              </div>
              <Button asChild size="xl" className="rounded-pill bg-white text-primary hover:bg-white/90">
                <a href={`mailto:${PRESS_EMAIL}?subject=Press%20request`}>
                  Send a press request <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <p className="mt-3 text-xs font-semibold text-white/75">Goes to press inbox · Vion replies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AwardsStrip() {
  return (
    <section className="bg-background py-14">
      <div className="cw-container">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Recent Awards & Shout-outs
            </span>
            <span className="text-sm font-semibold text-text-secondary">
              Things people gave us, in chronological order
            </span>
          </div>
          <Link href="#press-contact" className="inline-flex items-center gap-1 text-sm font-extrabold text-info">
            View all 14 awards <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-5">
          {awards.map((award) => (
            <article key={award.title} data-motion="card" className="rounded-3xl border bg-white p-5 shadow-soft will-change-transform">
              <div className={cn("grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-white shadow-soft", award.gradient)}>
                <award.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold italic leading-tight text-body">{award.title}</h3>
              <p className="mt-3 text-xs font-bold">
                {award.source} <span className="text-text-muted">·</span>{" "}
                <span className="text-primary">{award.year}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterRibbon() {
  return (
    <section className="bg-foreground py-11 text-white">
      <div className="cw-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-soft">
            <Newspaper className="h-3.5 w-3.5" /> Press list — one press release a month
          </span>
          <h2 className="mt-3 text-3xl font-extrabold italic tracking-tight">
            Skip the pitch deck. Get it in your inbox.
          </h2>
        </div>
        <form className="flex w-full max-w-xl flex-col gap-3 rounded-3xl bg-white p-3 text-sm shadow-soft sm:flex-row sm:items-center">
          <label htmlFor="press-email" className="sr-only">
            Reporter email
          </label>
          <div className="flex flex-1 items-center gap-3 px-3 text-text-muted">
            <Mail className="h-4 w-4" />
            <input
              id="press-email"
              type="email"
              placeholder="reporter@yourpublication.com"
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </div>
          <Button type="submit" className="rounded-pill">
            Subscribe <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </section>
  );
}

function FloatingIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div
      data-motion-float
      className={cn(
        "absolute z-0 hidden h-14 w-14 place-items-center rounded-full bg-white shadow-elevated will-change-transform md:grid",
        className,
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  );
}

function MagazineCard({
  className,
  publication,
  date,
  title,
  kicker,
  large,
}: {
  className: string;
  publication: string;
  date: string;
  title: string;
  kicker: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute h-[25rem] w-72 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br p-5 shadow-elevated",
        large && "h-[29rem] w-80",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-pill bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-body">
          {publication}
        </span>
        <span className="rounded-pill bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {date}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pt-28">
        <h3 className={cn("font-extrabold italic leading-tight tracking-tight text-white", large ? "text-2xl" : "text-xl")}>
          {title}
        </h3>
        <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
          {kicker}
        </p>
      </div>
    </div>
  );
}

function AssetCard({
  asset,
}: {
  asset: {
    title: string;
    description: string;
    format: string;
    size: string;
    icon: LucideIcon | null;
    image?: string;
    surface: string;
  };
}) {
  const Icon = asset.icon;

  return (
    <article className="overflow-hidden rounded-3xl border bg-white shadow-soft">
      <div className={cn("grid h-36 place-items-center", asset.surface)}>
        {asset.image ? (
          <Image src={asset.image} alt="" width={120} height={64} className="max-h-16 w-auto object-contain" />
        ) : Icon ? (
          <Icon className="h-12 w-12 text-body" />
        ) : (
          <Logo size={48} />
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-body">{asset.title}</h3>
          <span className="rounded-md bg-foreground px-2 py-1 text-[10px] font-extrabold text-white">
            {asset.format}
          </span>
        </div>
        <p className="text-sm text-text-muted">{asset.description}</p>
        <div className="flex items-center justify-between border-t pt-3 text-xs font-bold">
          <span className="text-text-muted">{asset.size}</span>
          <Link href="#brand-assets" className="inline-flex items-center gap-1 text-primary">
            Download <Download className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
