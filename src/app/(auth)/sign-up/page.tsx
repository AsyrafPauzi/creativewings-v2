import { ArrowRight, Flame, Palette, Sparkles, Star } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Create your account" };

export default async function SignUpPage() {
  return (
    <div className="grid min-h-[calc(100vh-9.25rem)] bg-white lg:grid-cols-2">
      <SignUpCreativePanel />

      <section data-auth-form className="flex justify-center bg-white px-6 py-10 sm:px-10 lg:px-20 lg:py-14">
        <div className="w-full max-w-[480px] space-y-[18px]">
          <div className="space-y-[18px]">
            <div data-motion="hero-item">
              <Logo size={28} />
            </div>
            <div className="space-y-1.5">
              <h1 data-motion="hero-item" className="text-[34px] font-black italic leading-[1.05] tracking-tight text-[#0B1320]">
                Make wings of your own.
              </h1>
              <p data-motion="hero-item" className="text-sm font-medium leading-[1.5] text-[#555555]">
                Create your account first. You&apos;ll pick your role on the next step.
              </p>
            </div>
          </div>

          <SignUpForm />
        </div>
      </section>
    </div>
  );
}

const JOIN_TICKETS = [
  {
    num: "01",
    who: "Aisha joined as a Contestant.",
    quote: "“The submission flow was so easy I forgot it was admin.”",
  },
  {
    num: "02",
    who: "Daniel joined as a Creator.",
    quote: "“The submission flow was so easy I forgot it was admin.”",
  },
  {
    num: "03",
    who: "Yibon joined as a Organizer.",
    quote: "“The submission flow was so easy I forgot it was admin.”",
  },
];

const SIGN_UP_STATS = [
  { icon: Sparkles, value: "12k", label: "CREATORS" },
  { icon: Flame, value: "RM1.2M", label: "PAID OUT" },
  { icon: Star, value: "60+", label: "SCHOOLS" },
];

function SignUpCreativePanel() {
  return (
    <aside
      data-auth-creative
      className="relative hidden min-h-full w-[720px] overflow-hidden bg-[linear-gradient(200deg,#125B9A_0%,#7E69A6_40%,#F05A7E_100%)] px-16 py-14 text-white lg:flex lg:flex-col lg:justify-between lg:gap-9"
    >
      <div
        data-auth-glow
        aria-hidden
        className="pointer-events-none absolute left-[380px] top-[120px] h-[580px] w-[580px] rounded-full bg-[radial-gradient(circle,rgba(255,230,163,0.6)_0%,rgba(255,230,163,0)_68%)] opacity-90 will-change-transform"
      />
      <div
        data-auth-glow
        aria-hidden
        className="pointer-events-none absolute -left-40 top-[600px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(252,230,236,0.6)_0%,rgba(252,230,236,0)_68%)] will-change-transform"
      />

      <Sparkles
        data-auth-float
        aria-hidden
        className="absolute left-[60px] top-[60px] h-[34px] w-[34px] -rotate-12 text-[#FFE6A3] opacity-90 will-change-transform"
      />
      <Star
        data-auth-float
        aria-hidden
        className="absolute left-[600px] top-[80px] h-[38px] w-[38px] rotate-[22deg] text-white opacity-95 will-change-transform"
      />
      <Flame
        data-auth-float
        aria-hidden
        className="absolute left-[30px] top-[500px] h-[34px] w-[34px] -rotate-[18deg] text-[#FFD66B] opacity-90 will-change-transform"
      />
      <Palette
        data-auth-float
        aria-hidden
        className="absolute left-[620px] top-[480px] h-9 w-9 rotate-[14deg] text-[#FCE6EC] opacity-85 will-change-transform"
      />

      <div className="relative flex items-center gap-2.5">
        <span data-auth-creative-item className="inline-flex items-center gap-2 rounded-pill border border-white/40 bg-white/15 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">
            CREATE YOUR WINGS
          </span>
        </span>
        <span className="text-xs font-semibold tracking-[0.1em] text-white/80">
          — /sign-up · step 1 of 1
        </span>
      </div>

      <div className="relative w-full space-y-9">
        <div className="space-y-[22px]">
          <h2 data-auth-creative-item className="whitespace-pre-line text-[96px] font-black italic leading-[0.92] tracking-tight">
            {"Make wings\nof your own."}
          </h2>
          <p data-auth-creative-item className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#FFE6A3]">
            — FREE TO JOIN · 60 SECONDS
          </p>
          <p data-auth-creative-item className="w-full text-[19px] font-medium leading-[1.45] text-white/90">
            Join 12,000+ creators, contestants and organizers building Malaysia&apos;s most
            playful creative scene.
          </p>
        </div>

        <div className="space-y-3.5">
          {JOIN_TICKETS.map((ticket) => (
            <div
              key={ticket.num}
              data-auth-ticket
              className="flex items-center gap-3.5 rounded-[14px] border border-white/30 bg-white/15 px-4 py-3 will-change-transform"
            >
              <span className="text-[30px] font-black italic leading-none text-[#FFE6A3]">
                {ticket.num}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-extrabold leading-tight">{ticket.who}</p>
                <p className="truncate text-xs font-medium text-white/80">{ticket.quote}</p>
              </div>
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </div>
          ))}
        </div>
      </div>

      <div className="relative grid w-full grid-cols-3 items-end gap-7">
        {SIGN_UP_STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} data-auth-stat className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#FFE6A3]" aria-hidden />
              <span className="text-[30px] font-black italic leading-none">{value}</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
              {label}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
