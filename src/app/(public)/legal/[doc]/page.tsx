import { notFound } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Gavel,
  Handshake,
  Mail,
  Scale,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type LegalSection = {
  id: string;
  title: string;
  intro: string;
  bullets?: string[];
  note?: string;
};

type LegalDoc = {
  title: string;
  eyebrow: string;
  description: string;
  effective: string;
  icon: LucideIcon;
  heroStat: string;
  sections: LegalSection[];
};

const DOCS: Record<string, LegalDoc> = {
  terms: {
    title: "Terms & Conditions",
    eyebrow: "PLATFORM TERMS · CREATIVE WINGS",
    description:
      "The rules for joining campaigns, submitting artwork, running programmes, earning rewards, and using Creative Wings safely.",
    effective: "18 June 2026",
    icon: Scale,
    heroStat: "Applies to contestants, creators, guardians, organisers and partners.",
    sections: [
      {
        id: "agreement",
        title: "Agreement to these terms",
        intro:
          "By creating an account, joining a campaign, submitting work, or browsing Creative Wings, you agree to follow these Terms & Conditions together with our Privacy & PDPA Notice and any campaign-specific rules.",
        bullets: [
          "If you use Creative Wings on behalf of an organisation, school, brand or organiser, you confirm that you are authorised to accept these terms for them.",
          "If a campaign page has additional entry rules, judging criteria, prize terms or deadlines, those campaign rules apply on top of these platform terms.",
          "If you do not agree, please do not create an account, submit entries or run campaigns on Creative Wings.",
        ],
      },
      {
        id: "accounts",
        title: "Accounts, roles & guardian-linked students",
        intro:
          "Creative Wings supports contestants, creators, organisers and administrators. You are responsible for the accuracy of your profile, account activity and login credentials.",
        bullets: [
          "Students under 18 may sign in independently, but their account must be linked to a parent or guardian for monitoring and consent.",
          "Guardian details must be truthful. We may pause a minor account if guardian consent cannot be confirmed.",
          "You must not impersonate another person, create accounts with false details, or share account access in a way that weakens security.",
          "Organisers must keep campaign details, deadlines, fees, prize promises and contact information accurate.",
        ],
        note:
          "Guardian-linked student accounts are still student accounts. The guardian is the main monitoring contact, not the person submitting on behalf of the student unless a campaign says otherwise.",
      },
      {
        id: "campaigns",
        title: "Campaign participation",
        intro:
          "Campaigns may include competitions, workshops, public activities, submissions, exhibitions, voting rounds, certificates, sponsor slots and digital badges.",
        bullets: [
          "Read the campaign detail page before joining, including category, subcategory, entry fee, dates, timeline, submission rules, judging criteria, resources and FAQ.",
          "Submit before the stated deadline. Late, incomplete or incorrectly formatted entries may be rejected.",
          "You are responsible for choosing the correct age bracket, category, school or participant details when submitting.",
          "Creative Wings may moderate entries for safety, eligibility, plagiarism, abuse, duplicate uploads or rule violations.",
        ],
      },
      {
        id: "submissions",
        title: "Artwork, content & licence",
        intro:
          "You keep ownership of your original creative work. To operate the platform and campaigns, you grant Creative Wings and the relevant organiser a limited licence to display and process your submitted content.",
        bullets: [
          "You confirm your submission is your own work or that you have permission to use every included asset.",
          "You must not upload content that is illegal, harmful, discriminatory, sexually explicit, abusive, misleading or infringes another person's rights.",
          "We may resize, crop, watermark, preview, archive or display submissions for judging, moderation, galleries, certificates, reports and campaign promotion.",
          "Winning, shortlisted or featured entries may be shown on Creative Wings channels and organiser channels with credit where practical.",
        ],
      },
      {
        id: "fees",
        title: "Fees, payments, refunds & prizes",
        intro:
          "Some campaigns are free and some require an entry fee. Any fee, sponsor coupon, prize pool or reward is shown on the campaign detail page.",
        bullets: [
          "Entry fees are processed through approved payment providers. Creative Wings does not store raw card details.",
          "Unless a campaign is cancelled or a refund rule says otherwise, paid entry fees may be non-refundable after submission or campaign close.",
          "Prize fulfilment may require identity, eligibility, guardian, bank, delivery or tax information.",
          "Prizes, certificates and badges may be withheld if an entry breaches rules, fails verification or is suspected of fraud.",
        ],
      },
      {
        id: "organisers",
        title: "Organiser responsibilities",
        intro:
          "Organisers and partners using Creative Wings must run fair, accurate and lawful campaigns.",
        bullets: [
          "Provide complete campaign information, including timeline, entry mechanics, fees, prize terms, judging criteria, eligibility and contact details.",
          "Only collect participant information that is necessary for the campaign and handle it according to PDPA obligations.",
          "Honour published prize commitments unless a clear force majeure or cancellation term applies.",
          "Do not manipulate judging, votes, submissions, sponsor coupons, analytics or public galleries.",
        ],
      },
      {
        id: "conduct",
        title: "Community conduct",
        intro:
          "Creative Wings is designed for young talent, schools, families, organisers and brands. We expect respectful, lawful and age-appropriate behaviour.",
        bullets: [
          "Do not harass, threaten, exploit, spam, scrape, hack, reverse engineer or disrupt the platform.",
          "Do not submit plagiarised work, stolen files, vote-buying activity, fake accounts, malware or misleading claims.",
          "Do not attempt to bypass moderation, age checks, guardian checks, payment checks or campaign eligibility controls.",
          "We may remove content, reject submissions, suspend accounts, reverse rewards or report unlawful activity when needed.",
        ],
      },
      {
        id: "data",
        title: "Privacy, PDPA & platform records",
        intro:
          "Our Privacy & PDPA Notice explains how personal data is collected, used, stored, shared and deleted.",
        bullets: [
          "Some data is required to operate accounts, campaigns, judging, certificates, payments, safety checks and support.",
          "Guardian information is collected for users under 18 so the student account can remain monitored.",
          "Audit logs, moderation records and payment records may be retained where required for security, compliance or dispute handling.",
          "You can manage privacy choices, exports and deletion requests from your privacy dashboard where available.",
        ],
      },
      {
        id: "changes",
        title: "Changes, suspension & termination",
        intro:
          "We may improve the platform, change features, update these terms, or pause access where necessary to keep Creative Wings safe and reliable.",
        bullets: [
          "We may update these terms by posting a newer version with a revised effective date.",
          "We may suspend or terminate accounts that breach these terms, campaign rules, payment rules, safety rules or law.",
          "You may stop using Creative Wings at any time and request account deletion, subject to retention needed for legal, payment, safety or campaign records.",
        ],
      },
      {
        id: "contact",
        title: "Contact & disputes",
        intro:
          "If something is unclear, contact Creative Wings before escalating a dispute. We aim to resolve issues fairly and quickly.",
        bullets: [
          "General support: hello@creativewings.asia",
          "Privacy and PDPA: dpo@creativewings.asia",
          "Campaign disputes should include the campaign title, submission code, account email and a clear explanation.",
          "These terms are intended to operate under Malaysian law unless a mandatory law says otherwise.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    eyebrow: "PRIVACY",
    description:
      "For the full privacy notice, please read the Creative Wings Privacy & PDPA Notice.",
    effective: "18 June 2026",
    icon: ShieldCheck,
    heroStat: "Privacy details live in the PDPA Notice.",
    sections: [
      {
        id: "pdpa",
        title: "Privacy notice",
        intro:
          "Creative Wings keeps one canonical privacy page so users always see the latest PDPA notice.",
        bullets: ["Read the full notice at /pdpa.", "Manage exports, consents and deletion from /dashboard/privacy."],
      },
    ],
  },
  "service-delivery": {
    title: "Service Delivery Policy",
    eyebrow: "SERVICE DELIVERY",
    description:
      "How Creative Wings delivers dashboards, certificates, judging tools, campaign access, downloads and partner fulfilment.",
    effective: "18 June 2026",
    icon: BadgeCheck,
    heroStat: "Digital delivery first; physical fulfilment depends on each campaign.",
    sections: [
      {
        id: "digital",
        title: "Digital services",
        intro:
          "Most Creative Wings services are delivered online through account dashboards, campaign pages, upload flows, judging tools and email notices.",
        bullets: [
          "Account access is available after sign-up and login.",
          "Campaign resources are delivered as downloads or links where organisers provide them.",
          "Certificates, badges and reports may be generated after campaign milestones are completed.",
        ],
      },
      {
        id: "physical",
        title: "Physical items",
        intro:
          "Some campaigns involve sponsor merchandise, exhibition items or prizes. Delivery timing depends on organiser and partner fulfilment.",
        bullets: [
          "Delivery requirements are shown in the campaign details or winner notification.",
          "Participants must provide accurate contact and delivery information when requested.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refund & Returns Policy",
    eyebrow: "REFUNDS",
    description:
      "How entry fee refunds, campaign cancellations and sponsor fulfilment issues are handled.",
    effective: "18 June 2026",
    icon: CreditCard,
    heroStat: "Refund handling depends on campaign status and payment provider rules.",
    sections: [
      {
        id: "entry-fees",
        title: "Entry fees",
        intro:
          "Entry fees are generally used to reserve access to a campaign submission flow, judging process, workshop seat or activity.",
        bullets: [
          "Fees may be non-refundable after a submission is made or after the campaign closes.",
          "If an organiser cancels a campaign, eligible fees may be returned to the original payment method or platform wallet.",
          "Payment provider processing timelines may apply.",
        ],
      },
      {
        id: "prizes",
        title: "Prizes and physical returns",
        intro:
          "Physical prizes, sponsor items and printed materials are handled according to each campaign&apos;s published terms.",
        bullets: [
          "Damaged or incorrect items should be reported with photos and delivery details.",
          "Replacement or return eligibility depends on the organiser, sponsor and delivery partner.",
        ],
      },
    ],
  },
};

const QUICK_ACTIONS = [
  {
    icon: UserCheck,
    title: "Student safe",
    body: "Guardian-linked minor accounts can still sign in independently.",
  },
  {
    icon: Trophy,
    title: "Campaign ready",
    body: "Covers submissions, judging, prizes, certificates and galleries.",
  },
  {
    icon: ShieldCheck,
    title: "PDPA aligned",
    body: "Connects directly to the public PDPA Notice and privacy dashboard.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = DOCS[doc];
  return {
    title: meta?.title ?? "Legal",
    description: meta?.description,
  };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = DOCS[doc];
  if (!meta) notFound();
  const Icon = meta.icon;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#F05A7E_0%,#A55EAE_55%,#125B9A_100%)] text-white">
        <div className="pointer-events-none absolute -left-28 -top-28 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-24 bottom-8 h-[28rem] w-[28rem] rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-[48%] top-16 grid h-14 w-14 rotate-12 place-items-center rounded-full bg-[#FFF3D0] text-[#0B1320] shadow-elevated">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>

        <div className="cw-container relative grid gap-10 py-20 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-pill border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/90">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {meta.eyebrow}
            </span>
            <h1 className="mt-5 text-5xl font-black italic leading-[0.95] tracking-tight md:text-7xl">
              {meta.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/86 md:text-lg">
              {meta.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-pill bg-white text-body hover:bg-white/90">
                <Link href="/sign-up">
                  Accept & join Creative Wings <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-pill border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Link href="/pdpa">
                  <ShieldCheck className="h-4 w-4" /> Read PDPA Notice
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/25 bg-white/16 p-6 shadow-elevated backdrop-blur">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">
              Current version
            </p>
            <p className="mt-2 text-3xl font-black italic">{meta.effective}</p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/80">
              {meta.heroStat}
            </p>
            <div className="mt-5 grid gap-2 text-xs font-bold text-white/82">
              <div className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2">
                <CalendarDays className="h-4 w-4 text-[#FFF3D0]" /> Effective date recorded
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2">
                <Gavel className="h-4 w-4 text-[#FFF3D0]" /> Malaysian platform terms
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/12 px-3 py-2">
                <Handshake className="h-4 w-4 text-[#FFF3D0]" /> Campaign rules apply too
              </div>
            </div>
          </div>
        </div>
      </section>

      {doc === "terms" && (
        <section className="bg-white py-10">
          <div className="cw-container">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
                  Quick actions
                </p>
                <h2 className="mt-2 text-3xl font-black italic tracking-tight text-body">
                  Read the essentials first.
                </h2>
              </div>
              <Button asChild variant="outline" className="rounded-pill">
                <a href="mailto:hello@creativewings.asia">
                  <Mail className="h-4 w-4" /> Ask a question
                </a>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {QUICK_ACTIONS.map(({ icon: ActionIcon, title, body }) => (
                <div key={title} className="rounded-[22px] border bg-card p-5 shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-primary">
                    <ActionIcon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-black text-body">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-text-secondary">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[linear-gradient(180deg,#FCE6EC_0%,#F8F9FB_28%,#F8F9FB_100%)] py-14">
        <div className="cw-container grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-[22px] border bg-card p-4 shadow-soft">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
                On this page
              </p>
              <ul className="mt-3 space-y-1">
                {meta.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-2 rounded-xl px-3 py-2 text-xs font-bold text-text-secondary hover:bg-brand-soft hover:text-primary"
                    >
                      <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 rounded-[22px] border border-success/30 bg-success-soft p-5">
              <ShieldCheck className="h-5 w-5 text-success" aria-hidden />
              <p className="mt-3 text-sm font-black text-success">Trust note</p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-success">
                These terms work together with the PDPA Notice, campaign rules, and dashboard consent controls.
              </p>
            </div>
          </aside>

          <div className="space-y-5">
            {meta.sections.map((section, index) => (
              <LegalSectionCard key={section.id} section={section} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0E0F12] py-14 text-white">
        <div className="cw-container grid gap-8 md:grid-cols-[1fr_1fr_1fr]">
          {[
            {
              icon: FileText,
              label: "Plain English",
              body: "Written for real users, guardians and organisers, not only lawyers.",
            },
            {
              icon: ClipboardList,
              label: "Campaign specific",
              body: "Each campaign can add rules, dates, fees, judging criteria and prize terms.",
            },
            {
              icon: AlertTriangle,
              label: "Safety first",
              body: "Moderation, guardian checks and fraud controls protect young creators.",
            },
          ].map(({ icon: TrustIcon, label, body }) => (
            <div key={label} className="rounded-[22px] border border-white/10 bg-white/6 p-5">
              <TrustIcon className="h-6 w-6 text-[#FFE6A3]" aria-hidden />
              <h3 className="mt-4 text-lg font-black italic">{label}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="cw-container flex flex-col justify-between gap-5 rounded-[28px] border bg-card p-6 shadow-soft md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
              Need legal help?
            </p>
            <h2 className="mt-2 text-2xl font-black italic tracking-tight text-body">
              Contact Creative Wings before you submit.
            </h2>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              We can help clarify account, guardian, campaign, prize or payment questions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-pill">
              <a href="mailto:hello@creativewings.asia">
                <Mail className="h-4 w-4" /> Email support
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-pill">
              <Link href="/pdpa">Privacy notice</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LegalSectionCard({
  section,
  index,
}: {
  section: LegalSection;
  index: number;
}) {
  return (
    <section id={section.id} className="scroll-mt-24 rounded-[24px] border bg-card p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-lg font-black italic text-primary">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black italic tracking-tight text-body md:text-3xl">
            {section.title}
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-text-secondary md:text-base">
            {section.intro}
          </p>

          {section.bullets && (
            <ul className="mt-5 space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm font-medium leading-relaxed text-body">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}

          {section.note && (
            <div className="mt-5 rounded-2xl border border-info/30 bg-info-soft p-4 text-sm font-semibold leading-relaxed text-secondary">
              <BookOpen className="mb-2 h-4 w-4" aria-hidden />
              {section.note}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
