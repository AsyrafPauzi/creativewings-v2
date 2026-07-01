import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UploadCloud,
} from "lucide-react";

import { ContactMotion } from "@/components/site/animations/contact-motion";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Contact Creative Wings",
  description:
    "Contact Creative Wings for partnerships, press, support, creator questions, school campaigns, and parent or guardian enquiries.",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Say hi",
    body: "hello@creativewings.asia",
    action: "Open in mail",
    href: "mailto:hello@creativewings.asia",
    reply: "Replies in 4h",
  },
  {
    icon: MessageCircle,
    title: "Quick chat",
    body: "+60 12-345-6789",
    action: "Open WhatsApp",
    href: "https://wa.me/60123456789",
    reply: "Replies in 2h",
  },
  {
    icon: MapPin,
    title: "Visit us",
    body: "Kuala Lumpur, Malaysia",
    action: "View on map",
    href: "#studio",
    reply: "Mon-Fri 9-6",
  },
  {
    icon: Newspaper,
    title: "Press",
    body: "press@creativewings.asia",
    action: "Press kit",
    href: "mailto:press@creativewings.asia",
    reply: "Replies in 4h",
  },
];

const CATEGORIES = [
  "Partner / Brand / School",
  "Press",
  "Support / Bug",
  "Parent / Guardian",
  "Creator",
  "Just curious",
];

const FAQS = [
  { num: "01", question: "How do I list a campaign?", category: "Organizers" },
  {
    num: "02",
    question: "How long do payouts take?",
    category: "CommercePay",
    answer:
      "CommercePay holds funds in escrow until the brief closes. Once a winner is declared, payouts land in 2 business days via FPX or bank transfer. International creators get a 3-day window.",
  },
  { num: "03", question: "Are submissions auto-approved?", category: "Moderation" },
  { num: "04", question: "What's the PDPA stance?", category: "Privacy" },
  { num: "05", question: "How do I cancel my account?", category: "Account" },
  { num: "06", question: "Can I commission a creator directly?", category: "Booking" },
  { num: "07", question: "Do you have an API?", category: "Developers" },
  { num: "08", question: "How do schools get sponsored?", category: "Partnerships" },
];

const OFFICE_HOURS = [
  { day: "Monday-Thursday", hours: "9:00 - 6:00 PM" },
  { day: "Friday", hours: "9:00 - 4:00 PM" },
  { day: "Saturday", hours: "10:00 - 6:00 PM" },
  { day: "Sunday & Holidays", hours: "- closed -" },
];

const SOCIALS = [
  { count: "82K", name: "Instagram", handle: "@creativewings.asia" },
  { count: "54K", name: "Facebook", handle: "/creativewings.asia" },
  { count: "61K", name: "TikTok", handle: "@creativewings" },
  { count: "14K", name: "X / Twitter", handle: "@creativewings" },
  { count: "22K", name: "YouTube", handle: "@CreativeWingsAsia" },
  { count: "15K", name: "LinkedIn", handle: "/creative-wings-asia" },
];

export default function ContactPage() {
  return (
    <ContactMotion>
    <div className="bg-background text-body">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-[#4A1D8F] via-[#7C3AED] to-[#F05A7E] text-white">
        <div data-contact-blob className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl will-change-transform" />
        <div data-contact-blob className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-secondary/30 blur-3xl will-change-transform" />
        <div data-contact-hero className="cw-container relative grid min-h-[660px] gap-10 py-20 md:grid-cols-[1.35fr_0.85fr] md:items-center md:py-28">
          <div>
            <span data-motion="hero-item" className="inline-flex rounded-pill border border-white/25 bg-white/15 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
              Partners · Press · Creators · Parents · Curious
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">
              <span data-motion="hero-item" className="block">Say hello.</span>
              <span data-motion="hero-item" className="block text-white/80">We answer in person, fast.</span>
            </h1>
            <p data-motion="hero-item" className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82">
              Pick the door that fits - partners, press, parents, creators, organizers,
              or just curious. A real human at Creative Wings replies in under 24 hours
              on weekdays.
            </p>
            <div data-motion="hero-cta" className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl" className="rounded-pill bg-white text-body hover:bg-white/90">
                <a href="#contact-form">
                  Open the form <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-pill border-white/35 bg-white/10 text-white hover:bg-white/20"
              >
                <a href="https://wa.me/60123456789">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              </Button>
            </div>
            <p data-motion="hero-item" className="mt-5 text-sm font-semibold text-white/75">
              Online now · 4 humans on rotation · Mon-Fri 9am-6pm MYT
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <EnvelopeCard label="to: press" stamp="AIR MAIL" className="-rotate-6" />
            <EnvelopeCard label="to: support" stamp="FIRST CLASS" className="mt-4 rotate-3" />
            <EnvelopeCard label="to: founder" stamp="URGENT · PERSONAL" className="mt-4 -rotate-2" />
          </div>
        </div>
      </section>

      <section className="cw-section bg-surface">
        <div className="cw-container">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
                Pick a door
              </span>
              <h2 data-motion="head" className="mt-3 text-3xl font-black tracking-tight text-body md:text-4xl">
                Reach us, the easy way.
              </h2>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-success-soft px-4 py-2 text-xs font-extrabold text-success">
              <CheckCircle2 className="h-4 w-4" /> All channels live · 4h avg reply
            </span>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CONTACT_CHANNELS.map((channel) => (
              <ContactCard key={channel.title} {...channel} />
            ))}
          </div>
        </div>
      </section>

      <section id="contact-form" className="cw-section">
        <div className="cw-container grid gap-10 lg:grid-cols-[1.45fr_0.9fr]">
          <div data-contact-form className="rounded-[28px] border bg-card p-6 shadow-elevated md:p-8 will-change-transform">
            <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
              Write to us
            </span>
            <h2 data-motion="head" className="mt-3 text-3xl font-black tracking-tight text-body md:text-4xl">
              Tell us what you need.
            </h2>
            <p className="mt-3 max-w-2xl text-text-secondary">
              Pick a category and we&apos;ll route you to the right human - not a bot,
              not a junior intern.
            </p>

            <form className="mt-8 space-y-6">
              <div data-motion="field">
                <label className="text-sm font-extrabold text-body">I&apos;m reaching out as a...</label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((category, index) => (
                    <button
                      key={category}
                      type="button"
                      className={`rounded-pill border px-4 py-2 text-xs font-extrabold transition-colors ${
                        index === 0
                          ? "border-primary bg-brand-soft text-primary"
                          : "bg-background text-text-secondary hover:border-primary/40 hover:text-body"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Full name" placeholder="Siti Aminah Binti Daud" />
                <Field label="Email" type="email" placeholder="siti@brand.com" />
                <Field label="Organization (optional)" placeholder="Where you work, or a brand name" />
                <Field label="Phone (optional)" placeholder="+60 12-345-6789" />
              </div>

              <div data-motion="field">
                <label className="text-sm font-extrabold text-body" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Tell us what you're working on, what you need from us, and when you need it by. The more specific, the faster we route."
                  className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="rounded-[22px] border border-dashed bg-surface p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-extrabold text-body">
                      <Paperclip className="h-4 w-4 text-primary" /> Attach a brief or screenshot (optional)
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Drop a file here or click to upload
                    </p>
                    <p className="mt-1 text-xs font-semibold text-text-muted">PDF, PNG, JPG - max 10 MB</p>
                  </div>
                  <Button type="button" variant="outline">
                    <UploadCloud className="h-4 w-4" /> Upload
                  </Button>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t pt-5 md:flex-row md:items-center">
                <p className="max-w-md text-xs leading-relaxed text-text-secondary">
                  We respect your privacy - your message is processed under our{" "}
                  <Link href="/pdpa" className="font-bold text-primary underline-offset-2 hover:underline">
                    PDPA notice
                  </Link>
                  .
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="rounded-pill">
                    <a href="mailto:hello@creativewings.asia?subject=Creative%20Wings%20contact%20request">
                      <Send className="h-4 w-4" /> Send message
                    </a>
                  </Button>
                  <Button type="button" variant="outline" className="rounded-pill">
                    Save draft
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[28px] border bg-card p-6 shadow-soft">
              <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary">
                Who you&apos;ll hear from
              </span>
              <div className="mt-5 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl cw-gradient-bg text-xl font-black text-white">
                  VP
                </div>
                <div>
                  <h3 className="text-lg font-black text-body">Vion Pek</h3>
                  <p className="text-sm text-text-secondary">Head of Creative &amp; Operations</p>
                  <span className="mt-2 inline-flex rounded-pill bg-success-soft px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-success">
                    Online
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <Stat value="4h" label="avg reply" />
                <Stat value="24h" label="max promise" />
                <Stat value="98%" label="answered" />
              </div>
              <p className="mt-5 text-sm font-semibold text-text-secondary">
                Mon-Fri 9am-6pm MYT · Sat 10-6 (support only)
              </p>
            </div>

            <div className="rounded-[28px] border bg-[#0B1320] p-6 text-white shadow-elevated">
              <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">
                Pro tip
              </span>
              <p className="mt-3 text-xl font-black leading-snug">
                Need it fast? Drop the campaign brief PDF straight in.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                We respond 2x quicker when we already see the scope.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="cw-section bg-surface">
        <div className="cw-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
                Frequently asked
              </span>
              <h2 data-motion="head" className="mt-3 text-3xl font-black tracking-tight text-body md:text-4xl">
                Quick answers.
              </h2>
              <p className="mt-3 max-w-2xl text-text-secondary">
                The 8 questions we get most. If yours isn&apos;t here, the form&apos;s right above.
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                placeholder="Search help articles..."
                className="h-11 w-full rounded-pill border bg-background pl-10 pr-4 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-10 overflow-hidden rounded-[28px] border bg-card shadow-soft">
            {FAQS.map((faq) => (
              <FaqRow key={faq.num} {...faq} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="font-extrabold text-text-secondary">Still curious?</span>
            <Button asChild variant="ghost">
              <a href="#contact-form">
                Browse the full help centre <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="studio" className="grid bg-card md:grid-cols-2">
        <div className="px-6 py-16 md:px-20">
              <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
                The studio
              </span>
              <h2 data-motion="head" className="mt-3 text-3xl font-black tracking-tight text-body md:text-4xl">
            Find the studio.
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            We&apos;re not always there - we&apos;re often in schools, on set, or in a bus
            to Penang - but you&apos;re welcome to knock.
          </p>
          <div className="mt-8 rounded-[24px] border bg-background p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl cw-gradient-bg text-white">
                <Star className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="font-black text-body">Creative Wings HQ · Malaysia</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Level 14, Wisma Wings
                  <br />
                  Jalan Sultan Ismail, 50250 Kuala Lumpur
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3 border-t pt-5">
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-text-muted">
                Office hours
              </span>
              {OFFICE_HOURS.map((item) => (
                <div key={item.day} className="flex justify-between gap-4 text-sm">
                  <span className="font-semibold text-text-secondary">{item.day}</span>
                  <span className="font-extrabold text-body">{item.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-pill">
                <a href="https://www.google.com/maps/search/?api=1&query=Kuala%20Lumpur%20Malaysia">
                  Get directions
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-pill">
                <a href="https://www.google.com/maps/search/?api=1&query=Wisma%20Wings%20Kuala%20Lumpur">
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div data-contact-map className="relative min-h-[520px] overflow-hidden bg-[#EEF3FF] will-change-transform">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:100px_80px]" />
          <div className="absolute left-1/3 top-1/3 h-32 w-32 rounded-full bg-primary/15" />
          <div className="absolute right-16 top-20 h-24 w-36 rounded-[28px] bg-secondary/25" />
          <div className="absolute bottom-28 left-16 h-24 w-44 rounded-[28px] bg-success/20" />
          <div className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-elevated">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute left-8 top-8 rounded-2xl bg-white/90 px-4 py-3 text-sm font-extrabold text-body shadow-soft backdrop-blur">
            Wisma Wings, KL
          </div>
          <div className="absolute bottom-8 right-8 rounded-2xl bg-white/90 px-4 py-3 text-sm font-extrabold text-body shadow-soft backdrop-blur">
            3.1521° N, 101.7100° E
          </div>
        </div>
      </section>

      <section className="cw-section bg-surface">
        <div className="cw-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span data-motion="head" className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
                Community
              </span>
              <h2 data-motion="head" className="mt-3 text-3xl font-black tracking-tight text-body md:text-4xl">
                Find the gang.
              </h2>
              <p className="mt-3 max-w-xl text-text-secondary">
                Pick your home feed. Same brand, slightly different vibe per platform.
              </p>
            </div>
            <div className="rounded-[24px] border bg-card px-6 py-4 text-center shadow-soft">
              <div className="text-3xl font-black text-body">248K</div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-text-muted">
                Combined followers
              </div>
            </div>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {SOCIALS.map((social) => (
              <SocialCard key={social.name} {...social} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-[#0B1320] py-14 text-white">
        <div className="cw-container flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-secondary">
              Our promise
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-tight">We reply, fast.</h2>
            <p className="mt-3 max-w-2xl text-white/70">
              Every message gets answered within 24 hours on weekdays. Press in 4.
              Support is open weekends 10-6.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Promise icon={<ShieldCheck className="h-5 w-5" />} title="PDPA-compliant" body="By the book" />
            <Promise icon={<FileText className="h-5 w-5" />} title="ISO 9001" body="In progress" />
            <Promise icon={<Building2 className="h-5 w-5" />} title="Built in Malaysia" body="100%" />
          </div>
        </div>
      </section>

      <section className="bg-card py-12">
        <div className="cw-container flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">
              Monthly drop - no spam
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-body">
              Stay in the loop, not in your inbox.
            </h2>
          </div>
          <form className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="you@yourbrand.com"
              className="h-12 min-w-0 flex-1 rounded-pill border bg-background px-5 text-sm shadow-soft outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="button" className="rounded-pill">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
    </ContactMotion>
  );
}

function EnvelopeCard({
  label,
  stamp,
  className = "",
}: {
  label: string;
  stamp: string;
  className?: string;
}) {
  return (
    <div data-contact-envelope className={`rounded-[28px] border border-white/25 bg-white/92 p-6 text-body shadow-elevated backdrop-blur will-change-transform ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{label}</span>
        <span className="rounded-pill border border-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
          {stamp}
        </span>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <div className="h-3 flex-1 rounded-full bg-primary/15" />
        <Sparkles className="h-5 w-5 text-secondary" />
        <div className="h-3 flex-1 rounded-full bg-secondary/15" />
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  body,
  action,
  href,
  reply,
}: (typeof CONTACT_CHANNELS)[number]) {
  return (
    <a
      href={href}
      data-motion="card"
      className="group rounded-[24px] border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated will-change-transform"
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-black text-body">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-text-secondary">{body}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
          {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
        <span className="rounded-pill bg-surface px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
          {reply}
        </span>
      </div>
    </a>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div data-motion="field">
      <label className="text-sm font-extrabold text-body" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3 text-center">
      <div className="text-xl font-black text-body">{value}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-text-muted">{label}</div>
    </div>
  );
}

function FaqRow({ num, question, category, answer }: (typeof FAQS)[number]) {
  return (
    <div data-motion="faq" className="border-b p-5 last:border-b-0 will-change-transform">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <span className="text-sm font-black text-primary">{num}</span>
        <div className="flex-1">
          <h3 className="font-black text-body">{question}</h3>
          {answer && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{answer}</p>}
        </div>
        <span className="w-fit rounded-pill bg-brand-soft px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary">
          {category}
        </span>
      </div>
      {answer && (
        <Link
          href="/contact"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary"
        >
          Read full help article <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function SocialCard({ count, name, handle }: (typeof SOCIALS)[number]) {
  return (
    <a
      href="/contact"
      data-motion="social"
      className="rounded-[24px] border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated will-change-transform"
    >
      <div className="text-2xl font-black text-body">{count}</div>
      <h3 className="mt-4 font-black text-body">{name}</h3>
      <p className="mt-1 text-sm text-text-secondary">{handle}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
        Follow <ArrowRight className="h-4 w-4" />
      </span>
    </a>
  );
}

function Promise({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <div className="text-secondary">{icon}</div>
      <h3 className="mt-3 text-sm font-black">{title}</h3>
      <p className="mt-1 text-xs font-semibold text-white/60">{body}</p>
    </div>
  );
}
