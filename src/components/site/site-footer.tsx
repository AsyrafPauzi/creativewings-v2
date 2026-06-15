import Link from "next/link";
import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-[#0d0d12] text-white">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg cw-gradient-bg font-bold">
                CW
              </span>
              <span className="font-semibold">Creative Wings</span>
            </Link>
            <p className="mt-5 text-2xl font-semibold leading-tight md:text-3xl">
              &ldquo;Together, We Help Young Talents Soar&rdquo;
            </p>
          </div>

          <div className="md:text-center">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Discover
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <Link href="/sustainable-development-goals" className="hover:text-white">
                  Sustainable Development Goals
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="hover:text-white">
                  Brand Story
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-white">
                  Activities
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-white">
                  Competitions
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:text-right">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Let&apos;s chat
            </h4>
            <a
              href="mailto:hello@creativewings.asia"
              className="mt-4 inline-flex items-center gap-2 text-sm hover:text-white"
            >
              <Mail className="h-4 w-4" /> hello@creativewings.asia
            </a>
            <div className="mt-6">
              <Link
                href="/sign-up?role=business"
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-[#0d0d12]"
              >
                Run a campaign
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center">
          <p>
            Copyright © {new Date().getFullYear()} Yibon Plt (202004002939) — Creative Wings. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/legal/service-delivery" className="hover:text-white">
                Service Delivery Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-white">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/refunds" className="hover:text-white">
                Refund &amp; Returns Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
