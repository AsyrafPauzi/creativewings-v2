"use client";

import { useActionState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  Compass,
  ImageIcon,
  Palette,
  ShieldCheck,
  Sparkles,
  Ticket,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pickRoleAction, type OnboardingState } from "./actions";

const initial: OnboardingState = {};

const ROLE_CARDS: {
  id: "creator" | "organizer";
  eyebrow: string;
  title: string;
  tagline: string;
  color: string;
  soft: string;
  shadow: string;
  tiles: { icon: LucideIcon; fill: string; tone: string; rotation: string }[];
  bullets: string[];
  pill: string;
  pillIcon: LucideIcon;
  cta: string;
}[] = [
  {
    id: "creator",
    eyebrow: "MOST PICKED",
    title: "I’m a Creator",
    tagline: "Build a portfolio, enter competitions, win prizes.",
    color: "#F05A7E",
    soft: "#FCE6EC",
    shadow: "shadow-[0_8px_18px_rgba(224,58,106,0.25)]",
    tiles: [
      { icon: ImageIcon, fill: "bg-[#F05A7E]", tone: "text-white", rotation: "-rotate-6" },
      { icon: Camera, fill: "bg-[#F8F9FB]", tone: "text-primary", rotation: "rotate-3" },
      { icon: Palette, fill: "bg-[#E1ECF6]", tone: "text-secondary", rotation: "-rotate-[10deg]" },
    ],
    bullets: [
      "Public Behance-style portfolio",
      "Submit to any campaign in one tap",
      "Earn badges as you grow",
      "Get discovered by organizers",
    ],
    pill: "Free forever",
    pillIcon: Sparkles,
    cta: "Start as a Creator",
  },
  {
    id: "organizer",
    eyebrow: "FOR BRANDS / SCHOOLS",
    title: "I’m an Organizer",
    tagline: "Run campaigns, manage entries, sponsor schools.",
    color: "#125B9A",
    soft: "#E1ECF6",
    shadow: "shadow-[0_8px_18px_rgba(30,79,164,0.25)]",
    tiles: [
      { icon: TrendingUp, fill: "bg-[#125B9A]", tone: "text-white", rotation: "-rotate-[8deg]" },
      { icon: Ticket, fill: "bg-[#F8F9FB]", tone: "text-secondary", rotation: "rotate-6" },
      { icon: Trophy, fill: "bg-[#FCE6EC]", tone: "text-primary", rotation: "-rotate-[10deg]" },
    ],
    bullets: [
      "Launch competitions, workshops, activities",
      "Bulk-import schools & coupon codes",
      "Track KPIs, exports, certificates",
      "Payouts handled by CommercePay",
    ],
    pill: "Verified profile included",
    pillIcon: ShieldCheck,
    cta: "Start as an Organizer",
  },
];

export function PickRoleForm({ intendedRole }: { intendedRole: string }) {
  const [state, formAction, pending] = useActionState(pickRoleAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid justify-center gap-8 xl:grid-cols-2">
        {ROLE_CARDS.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            pending={pending}
            defaultActive={intendedRole === role.id}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 px-10">
        <span className="h-px w-40 max-w-[30vw] bg-border" />
        <span className="rounded-pill border bg-surface px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          or
        </span>
        <span className="h-px w-40 max-w-[30vw] bg-border" />
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 rounded-xl border border-border-strong bg-surface px-5 py-5 md:flex-row md:items-center md:justify-between md:px-7">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border bg-card text-text-muted">
            <Compass className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-base font-semibold text-body">
              Just want to compete? Skip ahead and join as a Contestant.
            </p>
            <p className="mt-0.5 text-sm text-text-muted">
              You can upgrade to Creator anytime.
            </p>
          </div>
        </div>
        <Button
          type="submit"
          name="role"
          value="contestant"
          variant="outline"
          className="h-11 rounded-pill border-border-strong bg-card px-5 font-semibold"
          disabled={pending}
        >
          {pending ? "Continuing…" : "Skip → join as Contestant"}
          {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </div>

      {state.error && (
        <p className="text-center text-sm font-semibold text-destructive">{state.error}</p>
      )}
    </form>
  );
}

function RoleCard({
  role,
  pending,
  defaultActive,
}: {
  role: (typeof ROLE_CARDS)[number];
  pending: boolean;
  defaultActive: boolean;
}) {
  const PillIcon = role.pillIcon;

  return (
    <article
      className={`relative w-full max-w-[580px] overflow-hidden rounded-[20px] border bg-card shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-1 ${
        defaultActive ? "border-primary" : "border-[#C9CDD6]"
      }`}
    >
      <div className="relative h-[200px] overflow-hidden" style={{ backgroundColor: role.soft }}>
        {role.tiles.map(({ icon: Icon, fill, tone, rotation }, index) => (
          <div
            key={`${role.id}-${index}`}
            className={`absolute top-9 flex h-[120px] w-[152px] flex-col gap-2 rounded-[10px] border-[3px] border-white p-3 shadow-[0_6px_14px_rgba(15,23,42,0.15)] ${fill} ${rotation}`}
            style={{ left: 48 + index * 160 }}
          >
            <Icon className={`h-[22px] w-[22px] ${tone}`} aria-hidden />
            <span className={`h-1.5 w-20 rounded ${index === 0 ? "bg-white/60" : "bg-current"} ${tone}`} />
            <span className={`h-1.5 w-14 rounded ${index === 0 ? "bg-white/80" : "bg-current"} ${tone} opacity-70`} />
          </div>
        ))}
        <span
          className="absolute right-8 top-5 rounded-pill px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-soft"
          style={{ backgroundColor: role.color }}
        >
          {role.eyebrow}
        </span>
      </div>

      <div className="space-y-4 px-8 py-6">
        <div>
          <h2 className="font-primary text-4xl font-bold tracking-tight text-body">
            {role.title}
          </h2>
          <p className="mt-1 text-[15px] leading-relaxed text-text-secondary">
            {role.tagline}
          </p>
        </div>

        <ul className="space-y-2.5">
          {role.bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-2.5 text-sm text-body">
              <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <Check className="h-3.5 w-3.5" aria-hidden />
              </span>
              {bullet}
            </li>
          ))}
        </ul>

        <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-soft px-2.5 py-1.5 text-xs font-semibold text-success">
          <PillIcon className="h-3 w-3" aria-hidden />
          {role.pill}
        </span>
      </div>

      <div className="px-8 pb-8">
        <Button
          type="submit"
          name="role"
          value={role.id}
          className={`h-14 w-full rounded-pill text-base font-bold text-white ${role.shadow}`}
          style={{ backgroundColor: role.color }}
          disabled={pending}
        >
          {pending ? "Continuing…" : role.cta}
          {!pending && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
      </div>
    </article>
  );
}
