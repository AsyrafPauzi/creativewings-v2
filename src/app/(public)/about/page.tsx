import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Award, GraduationCap, Sparkles, Trophy } from "lucide-react";

import { AboutMotion } from "@/components/site/animations/about-motion";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About Creative Wings" };

const FEATURES = [
  {
    icon: Trophy,
    title: "Run national campaigns",
    body: "Organisers launch competitions with age brackets, prize pools, judging criteria, sponsor coupons and KPI tracking.",
  },
  {
    icon: GraduationCap,
    title: "Connect with schools",
    body: "Schools register, receive tokenised upload portals and bulk-submit student artwork for partners to review.",
  },
  {
    icon: Sparkles,
    title: "Build a creator profile",
    body: "Every creator gets a public portfolio at /profile/your-name to showcase work and history across campaigns.",
  },
  {
    icon: Award,
    title: "Earn certificates and badges",
    body: "Automatic e-certificates for participants, plus a badge ledger that grows with every submission.",
  },
];

export default function AboutPage() {
  return (
    <AboutMotion>
      <div className="bg-background text-body">
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-[#406CB9] via-[#7C3AED] to-[#F05A7E] text-white">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
          <div data-about-hero className="cw-container relative py-20 md:py-28">
            <span
              data-motion="hero-item"
              className="inline-flex rounded-pill border border-white/25 bg-white/15 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/85 backdrop-blur"
            >
              Yibon Mag Enterprise · Since 2024
            </span>
            <h1
              data-motion="hero-item"
              className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl"
            >
              About <span className="text-white/80">Creative Wings</span>
            </h1>
            <p data-motion="hero-item" className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82">
              Creative Wings is a national platform run by Yibon Mag Enterprise to make creative
              competitions and school activities accessible — for contestants, creators, schools, and
              the organisations that sponsor them.
            </p>
            <div data-motion="hero-cta" className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl" className="rounded-pill bg-white text-body hover:bg-white/90">
                <Link href="/brand-story">
                  Our brand story <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-pill border-white/35 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="cw-section">
          <div className="cw-container">
            <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
              What we do
            </span>
            <h2 data-motion="head" className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-body md:text-4xl">
              One platform for campaigns, schools, and creators.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <Feature key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </AboutMotion>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div data-motion="card" className="rounded-2xl border bg-card p-6 shadow-soft will-change-transform">
      <div
        data-motion="icon"
        className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary will-change-transform"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
