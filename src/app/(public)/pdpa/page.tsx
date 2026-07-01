import Link from "next/link";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Download,
  Eye,
  Feather,
  FileText,
  Lock,
  Mail,
  MapPin,
  PauseCircle,
  Phone,
  Send,
  ShieldCheck,
  Trash2,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { getCurrentPolicyVersion } from "@/lib/pdpa";
import { PageMotion } from "@/components/site/animations/page-motion";

export const metadata = {
  title: "Privacy & PDPA Notice",
  description:
    "How Creative Wings collects, uses and protects your personal data — written in plain English under Malaysia's PDPA 2010.",
};

const TOC = [
  { id: "who-we-are", label: "1. Who we are" },
  { id: "what-we-collect", label: "2. What data we collect" },
  { id: "why", label: "3. Why we collect it" },
  { id: "lawful-basis", label: "4. Lawful basis & consent" },
  { id: "disclosure", label: "5. Disclosure to third parties" },
  { id: "security", label: "6. Security & retention" },
  { id: "rights", label: "7. Your rights" },
  { id: "minors", label: "8. Minors & guardians" },
  { id: "international", label: "9. International transfers" },
  { id: "cookies", label: "10. Cookies & tracking" },
  { id: "changes", label: "11. Changes to this notice" },
  { id: "contact", label: "12. Contact us" },
];

const DATA_TABLE: { category: string; examples: string; why: string }[] = [
  {
    category: "Identity",
    examples: "full_name, email, username, date_of_birth, age_category",
    why: "Account & age gating",
  },
  { category: "Contact", examples: "phone, country, city", why: "Verification, support" },
  {
    category: "Guardian",
    examples: "guardian_name, guardian_email, guardian_phone (under-18 only)",
    why: "Lawful consent for minors",
  },
  {
    category: "Submissions",
    examples: "uploaded files, captions, scores, judges' notes",
    why: "Run campaigns",
  },
  {
    category: "Payments",
    examples: "transaction_id, amount, currency (no card details stored)",
    why: "Receipts & payouts",
  },
  {
    category: "Tech",
    examples: "IP address, device, browser, audit_log entries",
    why: "Security & abuse prevention",
  },
];

const RIGHTS = [
  {
    icon: Download,
    title: "Right to portability",
    body: "Export everything we hold about you as a single JSON archive.",
  },
  {
    icon: Trash2,
    title: "Right to erasure",
    body: "Delete your account. Personal data is removed within 30 days.",
  },
  {
    icon: Eye,
    title: "Right of access",
    body: "View, audit and correct any of your data inside the dashboard.",
  },
  {
    icon: Ban,
    title: "Right to withdraw consent",
    body: "Toggle marketing, analytics or third-party consents at any time.",
  },
  {
    icon: PauseCircle,
    title: "Right to limit processing",
    body: "Pause optional uses of your data while keeping your account.",
  },
  {
    icon: Phone,
    title: "Right to lodge a complaint",
    body: "Contact our DPO or the JPDP if you believe we mishandled your data.",
  },
];

const TRUST_ITEMS: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "PDPA-compliant", body: "By the book", icon: ShieldCheck },
  { title: "ISO 27001", body: "In progress", icon: Lock },
  { title: "Built in Malaysia", body: "100%", icon: MapPin },
];

const QUICK_ACTIONS = [
  {
    icon: Download,
    title: "Export my data",
    body: "Download everything we hold as JSON",
    href: "/dashboard/privacy",
    meta: "Instant",
    tone: "pink",
  },
  {
    icon: Trash2,
    title: "Delete my account",
    body: "Remove your profile within 30 days",
    href: "/dashboard/privacy",
    meta: "30-day window",
    tone: "red",
  },
  {
    icon: FileText,
    title: "Download PDF",
    body: "Print-friendly copy of this notice",
    href: "/pdpa.pdf",
    meta: "Always current",
    tone: "blue",
  },
  {
    icon: ToggleRight,
    title: "Manage consents",
    body: "Toggle marketing, analytics & sharing",
    href: "/dashboard/privacy",
    meta: "Anytime",
    tone: "purple",
  },
] satisfies {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  meta: string;
  tone: keyof typeof ACCENT_STYLES;
}[];

const PURPOSES = [
  "Run your account, sign-in, and provide the dashboard.",
  "Operate competitions, workshops and activities (the “Campaigns”).",
  "Issue digital certificates, badges and proof-of-work artefacts.",
  "Verify school affiliations and apply sponsor coupons.",
  "Process payments through CommercePay (we never store card data).",
  "Detect abuse, fraud, and content that breaches our community guidelines.",
  "Send transactional notices (always) and marketing notices (only if you opt in).",
];

const LAWFUL_BASES = [
  "Consent — e.g. marketing emails, analytics, third-party sharing.",
  "Performance of contract — to deliver the platform you signed up for.",
  "Legal obligation — e.g. tax records for paid campaigns.",
  "Legitimate interest — e.g. fraud prevention, service improvement.",
  "Guardian consent — required for any user under 18 years old before we process their data.",
];

const DISCLOSURES = [
  "Supabase (Singapore region) — our primary database & file storage.",
  "CommercePay — to process card payments.",
  "Resend / Postmark — to deliver transactional emails.",
  "Vercel — to host the public site.",
  "Organizers — only the data needed to operate a campaign you join.",
  "Authorities — if compelled by Malaysian law (with prior notice unless prohibited).",
];

const SECURITY_RETENTION = [
  "Account data — retained while your account is active. Deleted within 30 days of account closure.",
  "Submissions — retained for the duration of the campaign + 24 months for awards & verification.",
  "Audit log — retained 7 years to comply with anti-fraud requirements.",
  "Encryption — TLS 1.3 in transit, AES-256 at rest.",
  "Access control — row-level security on every table, least-privilege admin roles.",
];

const ACCENT_STYLES = {
  pink: {
    eyebrow: "text-[#F05A7E]",
    icon: "bg-[#FCE6EC] text-[#F05A7E]",
    row: "bg-[#FCE6EC] text-[#F05A7E]",
  },
  blue: {
    eyebrow: "text-[#125B9A]",
    icon: "bg-[#E1ECF6] text-[#125B9A]",
    row: "bg-[#E1ECF6] text-[#125B9A]",
  },
  green: {
    eyebrow: "text-[#16A34A]",
    icon: "bg-[#E7F6EE] text-[#16A34A]",
    row: "bg-[#E7F6EE] text-[#16A34A]",
  },
  amber: {
    eyebrow: "text-[#D97706]",
    icon: "bg-[#FFF3D0] text-[#D97706]",
    row: "bg-[#FFF3D0] text-[#D97706]",
  },
  red: {
    eyebrow: "text-[#DC2626]",
    icon: "bg-[#FEE2E2] text-[#DC2626]",
    row: "bg-[#FEE2E2] text-[#DC2626]",
  },
  purple: {
    eyebrow: "text-[#7C3AED]",
    icon: "bg-[#EBE3FA] text-[#7C3AED]",
    row: "bg-[#EBE3FA] text-[#7C3AED]",
  },
};

export default async function PdpaPage() {
  const policy = await getCurrentPolicyVersion();
  const versionLabel = policy?.version ?? "1.0.0";
  const effective = policy?.effective_from
    ? new Date(policy.effective_from).toLocaleDateString("en-MY", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "16 June 2026";

  return (
    <PageMotion hero>
    <div className="overflow-hidden bg-white text-[#0B1320]">
      <section data-motion="hero" className="relative isolate min-h-[760px] overflow-hidden bg-[linear-gradient(135deg,#F05A7E_0%,#A55EAE_55%,#125B9A_100%)]">
        <div data-motion-blob className="absolute -left-28 -top-28 h-[380px] w-[380px] rounded-full bg-white/10 will-change-transform" />
        <div data-motion-blob className="absolute -right-40 bottom-10 h-[420px] w-[420px] rounded-full bg-white/10 will-change-transform" />
        <FloatingIcon className="left-4 top-20 rotate-[-8deg]" icon={ShieldCheck} tone="pink" />
        <FloatingIcon className="left-[39%] bottom-10 rotate-[-12deg]" icon={Lock} tone="blue" />
        <FloatingIcon className="right-[47%] top-16 rotate-[14deg]" icon={Feather} tone="amber" />

        <div className="relative mx-auto grid min-h-[760px] w-full max-w-[1280px] items-center gap-10 px-4 py-24 md:grid-cols-[minmax(0,760px)_480px] md:px-8 lg:px-0">
          <div className="max-w-[760px]">
            <div data-motion="hero-item" className="inline-flex items-center gap-2 rounded-pill bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#F05A7E]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Privacy & PDPA
            </div>
            <h1 className="mt-7 font-display text-[clamp(4rem,9vw,5.25rem)] font-extrabold italic leading-[1.05] tracking-[-0.045em] text-white">
              <span data-motion="hero-item" className="block">Your data.</span>
              <span data-motion="hero-item" className="block text-[clamp(3rem,6vw,3.375rem)] text-[#FCE6EC]">
                Your rights.
              </span>
            </h1>
            <p data-motion="hero-item" className="mt-7 max-w-[600px] text-lg font-medium leading-[1.4] text-white md:text-xl">
              How Creative Wings collects, uses and protects your personal data — written
              in plain English, governed by Malaysia&apos;s Personal Data Protection Act 2010
              (PDPA), and inspired by GDPR principles of access, portability and the
              right to be forgotten.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" aria-hidden="true" />
              PDPA-compliant · Effective {effective} · Version {versionLabel}
            </div>
          </div>

          <div className="relative hidden h-[560px] w-[480px] md:block" aria-hidden="true">
            <HeroCard
              className="left-[130px] top-5 rotate-[-10deg]"
              icon={ShieldCheck}
              label="Privacy Notice"
              gradient="from-[#125B9A] to-[#0B1320]"
            />
            <HeroCard
              className="left-[60px] top-[170px] rotate-[6deg]"
              icon={Download}
              label="Export Data"
              gradient="from-[#F4A95F] to-[#C12E5B]"
            />
            <HeroCard
              className="left-[90px] top-[330px] rotate-[-3deg]"
              icon={Trash2}
              label="Delete Account"
              gradient="from-[#F05A7E] to-[#0B1320]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F05A7E]">
                Your controls
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-extrabold italic tracking-[-0.03em] text-[#0B1320]">
                Act on your data, fast.
              </h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-[#E7F6EE] px-3 py-1.5 text-xs font-bold text-[#0F5C2A]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" aria-hidden="true" />
              Self-service · Instant access
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#FCE6EC_0%,#F8F9FB_40%,#F8F9FB_100%)] px-4 py-16 md:px-8 md:pb-[72px]">
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-lg border border-[#E6E8EE] bg-white p-[18px] shadow-[0_18px_32px_-6px_rgb(11_19_32/0.08)]" aria-label="PDPA notice sections">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#555555]">
                On this page
              </div>
              <ul className="mt-3 space-y-1.5">
                {TOC.map((t, index) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className={`flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-xs font-bold transition hover:bg-[#FCE6EC] hover:text-[#F05A7E] ${
                        index === 0 ? "bg-[#FCE6EC] text-[#F05A7E]" : "text-[#555555]"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-[18px] rounded-lg border border-[#16A34A] bg-[#E7F6EE] p-[18px] text-[#16A34A]">
              <ShieldCheck className="h-5.5 w-5.5" />
              <div className="mt-2.5 text-[13px] font-extrabold">
                Compliance summary
              </div>
              <div className="mt-2 text-[11px] font-medium leading-[1.5]">
                This notice complies with PDPA 2010 and the Personal Data Protection
                Standard 2015. Last review: {effective} · Version {versionLabel}.
              </div>
            </div>
          </aside>

          <div className="space-y-9">
            <Section
              num="01"
              id="who-we-are"
              title="Who we are"
              accent="pink"
              intro="Creative Wings is operated by Yibon Pte Ltd (we, us, our), registered in Malaysia. We act as the Data Controller for personal data you give us when you sign up for and use Creative Wings."
            >
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  "Registered office: Kuala Lumpur, Malaysia.",
                  "Data Protection Officer: dpo@creativewings.asia",
                  "Regulator: Personal Data Protection Department (JPDP), Malaysia.",
                ].map((b) => (
                  <Bullet key={b} text={b} />
                ))}
              </ul>
            </Section>

            <Section
              num="02"
              id="what-we-collect"
              title="What personal data we collect"
              accent="blue"
              intro="We only collect what we need to run the platform. Categories of data we collect, and the field names where they are stored:"
            >
              <div className="mt-4 overflow-hidden rounded-sm border border-[#E6E8EE]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FB] text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8A8F99]">
                      <th className="w-44 px-3 py-2">Category</th>
                      <th className="px-3 py-2">Examples</th>
                      <th className="w-44 px-3 py-2">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DATA_TABLE.map((r) => (
                      <tr key={r.category} className="border-t border-[#E6E8EE]">
                        <td className="px-3 py-2 font-extrabold text-[#0B1320]">{r.category}</td>
                        <td className="px-3 py-2 leading-relaxed text-[#555555]">
                          {r.examples}
                        </td>
                        <td className="px-3 py-2 font-bold text-[#125B9A]">{r.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              num="03"
              id="why"
              title="Why we collect it"
              accent="green"
              intro="We process your data only for the purposes you'd expect from a campaigns platform. Specifically:"
            >
              <ul className="mt-4 space-y-2 text-sm">
                {PURPOSES.map((b) => (
                  <Bullet key={b} text={b} />
                ))}
              </ul>
            </Section>

            <Section
              num="04"
              id="lawful-basis"
              title="Lawful basis & consent"
              accent="amber"
              intro="Under PDPA we rely on:"
            >
              <ul className="mt-4 space-y-2 text-sm">
                {LAWFUL_BASES.map((b) => (
                  <Bullet key={b} text={b} />
                ))}
              </ul>
            </Section>

            <Section
              num="05"
              id="disclosure"
              title="Disclosure to third parties"
              accent="pink"
              intro="We never sell your data. We share only with the parties below, all bound by data-processing agreements:"
            >
              <ul className="mt-4 space-y-2 text-sm">
                {DISCLOSURES.map((b) => (
                  <Bullet key={b} text={b} />
                ))}
              </ul>
            </Section>

            <Section
              num="06"
              id="security"
              title="Security & retention"
              accent="blue"
              intro="How long we keep your data and how we protect it:"
            >
              <ul className="mt-4 space-y-2 text-sm">
                {SECURITY_RETENTION.map((b) => (
                  <Bullet key={b} text={b} />
                ))}
              </ul>
            </Section>

            <Section
              num="07"
              id="rights"
              title="Your rights"
              accent="green"
              intro="You have the following rights and you can exercise them at any time from your account settings:"
            >
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {RIGHTS.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="rounded-md border border-[#E6E8EE] bg-[#F8F9FB] p-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#FCE6EC] text-[#F05A7E]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-extrabold text-[#0B1320]">{title}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#555555]">{body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#555555]">
                Exercise any of these rights from your{" "}
                <Link href="/dashboard/privacy" className="font-semibold text-[#F05A7E] underline-offset-2 hover:underline">
                  Privacy & Data dashboard
                </Link>
                . We respond within 21 days as required by PDPA.
              </p>
            </Section>

            <Section
              num="08"
              id="minors"
              title="Minors & guardians"
              accent="amber"
              intro="Users under 18 must obtain consent from a parent or guardian during sign-up. We collect the guardian's name, email and phone, and store guardian_consent_at as proof of consent. A guardian can revoke consent at any time by contacting dpo@creativewings.asia — the affected account will be locked within 48 hours and deleted within 30 days unless the user is now 18 or older."
            />

            <Section
              num="09"
              id="international"
              title="International transfers"
              accent="blue"
              intro="Your data may be processed outside Malaysia (primarily Singapore for hosting). Any cross-border transfer happens only to providers that contractually meet PDPA's data-protection principles."
            />

            <Section
              num="10"
              id="cookies"
              title="Cookies & tracking"
              accent="pink"
              intro="We use a minimal set of cookies: a session cookie (required for sign-in) and an opt-in analytics cookie. We do not run advertising trackers. You can opt out of analytics from your privacy settings."
            />

            <Section
              num="11"
              id="changes"
              title="Changes to this notice"
              accent="green"
              intro="We may update this notice. Material changes are emailed to all registered users 14 days before they take effect. Older versions are archived and accessible from your privacy settings."
            />

            <Section
              num="12"
              id="contact"
              title="Contact us"
              accent="pink"
              intro="Questions, concerns or compliance requests:"
            >
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  { icon: Mail, label: "Data Protection Officer", value: "dpo@creativewings.asia" },
                  { icon: Phone, label: "Compliance hotline", value: "+603 7785 1248" },
                  { icon: MapPin, label: "Postal", value: "Yibon Pte Ltd, KL, Malaysia" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-md border border-[#E6E8EE] bg-[#F8F9FB] p-4">
                    <Icon className="h-4 w-4 text-[#F05A7E]" />
                    <div className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8A8F99]">
                      {label}
                    </div>
                    <div className="mt-0.5 text-sm font-extrabold text-[#0B1320]">{value}</div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>

      <section className="bg-[#0E0F12] px-4 py-14 text-white md:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[540px]">
            <div className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FCE6EC]">
              <ShieldCheck className="h-3 w-3" />
              Our commitment
            </div>
            <h2 className="mt-3 font-display text-4xl font-extrabold italic tracking-[-0.035em]">
              We take PDPA seriously.
            </h2>
            <p className="mt-2.5 text-[15px] font-medium leading-[1.5] text-white/70">
              Every request is answered within 14 days. Export and deletion are
              self-service. Material changes are notified 14 days in advance. Manage
              all consents from your dashboard privacy settings.
            </p>
            <Link
              href="/dashboard/privacy"
              className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[#FCE6EC] underline-offset-4 hover:underline"
            >
              Open privacy dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {TRUST_ITEMS.map(({ title, body, icon: Icon }) => (
              <div
                key={title}
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] p-[18px] sm:w-[200px]"
              >
                <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-[linear-gradient(200deg,#F05A7E_0%,#5E2B6A_60%,#125B9A_100%)]">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="mt-2.5 font-display text-sm font-extrabold italic text-white">
                  {title}
                </div>
                <div className="mt-1 text-[11px] font-semibold tracking-[0.04em] text-white/60">
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F9FB] px-4 py-11 md:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[560px]">
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#F05A7E]">
              <Mail className="h-3.5 w-3.5" />
              Monthly drop — no spam
            </div>
            <h2 className="mt-1.5 font-display text-[28px] font-extrabold italic leading-[1.1] tracking-[-0.03em] text-[#0B1320]">
              Stay in the loop, not in your inbox.
            </h2>
          </div>

          <form
            className="flex w-full max-w-[560px] items-center gap-3 rounded-pill border border-[#E6E8EE] bg-white px-5 py-3.5"
            action="/sign-up"
            aria-label="Join Creative Wings updates"
          >
            <Mail className="h-4 w-4 flex-shrink-0 text-[#8A8F99]" />
            <label className="sr-only" htmlFor="pdpa-newsletter-email">
              Email address
            </label>
            <input
              id="pdpa-newsletter-email"
              name="email"
              type="email"
              placeholder="you@yourbrand.com"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#0B1320] outline-none placeholder:text-[#8A8F99]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-pill bg-[#F05A7E] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#C12E5B] focus:outline-none focus:ring-2 focus:ring-[#F05A7E]/40"
            >
              Join <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </section>
    </div>
    </PageMotion>
  );
}

function Section({
  num,
  id,
  title,
  intro,
  accent,
  children,
}: {
  num: string;
  id: string;
  title: string;
  intro?: string;
  accent: keyof typeof ACCENT_STYLES;
  children?: ReactNode;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <section
      id={id}
      data-motion="section"
      className="scroll-mt-24 rounded-md border border-[#E6E8EE] bg-white p-8 will-change-transform"
    >
      <div className="space-y-3.5">
        <div className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${styles.eyebrow}`}>
          Section {num}
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-extrabold italic leading-[1.1] tracking-[-0.035em] text-[#0B1320] md:text-4xl">
            {title}
          </h2>
          {intro && (
            <p className="text-base font-medium leading-[1.65] text-[#555555]">{intro}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 leading-relaxed text-[#0B1320]">
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F05A7E]" />
      <span>{text}</span>
    </li>
  );
}

function QuickAction({
  icon: Icon,
  title,
  body,
  href,
  meta,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  meta: string;
  tone: keyof typeof ACCENT_STYLES;
}) {
  const styles = ACCENT_STYLES[tone];
  const content = (
    <>
      <span className={`grid h-[46px] w-[46px] place-items-center rounded-full ${styles.icon}`}>
        <Icon className="h-5.5 w-5.5" />
      </span>
      <span className="font-display text-2xl font-extrabold italic tracking-[-0.02em] text-[#0B1320]">
        {title}
      </span>
      <span className="text-[13px] font-bold text-black">{body}</span>
      <span className="mt-auto h-px w-full bg-[#E6E8EE]" />
      <span className="flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1.5 font-extrabold ${styles.eyebrow}`}>
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
        <span className="font-semibold text-[#8A8F99]">{meta}</span>
      </span>
    </>
  );

  if (href.endsWith(".pdf")) {
    return (
      <a
        href={href}
        className="flex min-h-[220px] flex-col gap-3.5 rounded-lg border border-[#E6E8EE] bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-[#F05A7E]/40"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="flex min-h-[220px] flex-col gap-3.5 rounded-lg border border-[#E6E8EE] bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-elevated focus:outline-none focus:ring-2 focus:ring-[#F05A7E]/40"
    >
      {content}
    </Link>
  );
}

function HeroCard({
  className,
  icon: Icon,
  label,
  gradient,
}: {
  className: string;
  icon: LucideIcon;
  label: string;
  gradient: string;
}) {
  return (
    <div
      className={`absolute h-60 w-[340px] rounded-[14px] border-[3px] border-white bg-gradient-to-br ${gradient} shadow-[0_18px_30px_rgb(11_19_32/0.4)] ${className}`}
    >
      <span className="absolute bottom-8 left-[18px] rounded-pill bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#0B1320]">
        {label}
      </span>
      <Icon className="absolute bottom-[34px] right-6 h-5.5 w-5.5 text-white/90" />
    </div>
  );
}

function FloatingIcon({
  className,
  icon: Icon,
  tone,
}: {
  className: string;
  icon: LucideIcon;
  tone: keyof Pick<typeof ACCENT_STYLES, "pink" | "blue" | "amber">;
}) {
  const styles = ACCENT_STYLES[tone];

  return (
    <div
      className={`absolute z-10 hidden h-14 w-14 place-items-center rounded-full bg-white shadow-[0_8px_20px_rgb(11_19_32/0.27)] md:grid ${className}`}
      aria-hidden="true"
    >
      <Icon className={`h-6 w-6 ${styles.eyebrow}`} />
    </div>
  );
}
