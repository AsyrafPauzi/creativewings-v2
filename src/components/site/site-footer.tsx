import Link from "next/link";
import { Mail, Globe } from "lucide-react";

import { Logo } from "@/components/brand/logo";

const SECTIONS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { href: "/campaigns", label: "Campaigns" },
      { href: "/sustainable-development-goals", label: "SDG Goals" },
      { href: "/brand-story", label: "Brand Story" },
      { href: "/press", label: "Press" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "For You",
    links: [
      { href: "/sign-up", label: "Join as Contestant" },
      { href: "/sign-up?role=creator", label: "Join as Creator" },
      { href: "/sign-up?role=organizer", label: "Run a Campaign" },
      { href: "/creators", label: "Browse Creators" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/legal/terms", label: "Terms & Conditions" },
      { href: "/pdpa", label: "Privacy & PDPA Notice" },
      { href: "/dashboard/privacy", label: "Manage my data" },
      { href: "/legal/refunds", label: "Refunds" },
      { href: "/legal/service-delivery", label: "Service Delivery" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-white">
      <div className="cw-container py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_repeat(3,1fr)]">
          <div>
            <Logo wordmark="bilingual" size={44} />
            <p className="mt-5 max-w-sm text-base font-semibold leading-snug">
              &ldquo;Together, we help young talents soar.&rdquo;
            </p>
            <p className="mt-3 max-w-sm text-sm text-white/70">
              Creative Wings is Malaysia&apos;s national platform for art competitions, school activities, and creator portfolios — connecting students, educators, and brands with purpose.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
              <a href="mailto:hello@creativewings.asia" className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" /> hello@creativewings.asia
              </a>
              <a href="https://creativewings.asia" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                <Globe className="h-4 w-4" /> creativewings.asia
              </a>
            </div>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                {section.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Yibon Plt (202004002939) — Creative Wings. All rights reserved.</p>
          <p>Made with care in Malaysia · EN / 中文</p>
        </div>
      </div>
    </footer>
  );
}
