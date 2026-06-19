import Link from "next/link";
import { ArrowRight, Award, Layers, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgrammeTypePage } from "@/components/site/programme-type-page";

export const metadata = {
  title: "Workshops",
  description:
    "Hands-on, time-bound sessions led by industry creators. Learn by doing — and earn a verified certificate.",
};
export const revalidate = 60;

export default async function WorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<{ sub?: string }>;
}) {
  const { sub } = await searchParams;

  return (
    <>
      <ProgrammeTypePage type="workshop" activeSub={sub ?? null} />

      <section className="bg-surface py-20">
        <div className="cw-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">Why workshops</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-body md:text-4xl">
              Real outcomes, not just inspiration
            </h2>
            <p className="mt-3 text-text-secondary">
              Every workshop ends with something you can show — a finished piece, a portfolio update, or an
              SDG-aligned project.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: <Users className="h-6 w-6" />,
                tone: "primary",
                title: "Live with industry creators",
                body: "Cohorts are intentionally small so you can ask anything and get feedback on your own work.",
              },
              {
                icon: <Award className="h-6 w-6" />,
                tone: "secondary",
                title: "Earn a verified certificate",
                body: "Every completed workshop awards a CW certificate you can display on your public profile.",
              },
              {
                icon: <Layers className="h-6 w-6" />,
                tone: "success",
                title: "Ships into your portfolio",
                body: "Workshop outputs auto-import into your Behance-style portfolio with one click — zero friction.",
              },
            ].map((p) => (
              <div key={p.title} className="rounded-md border bg-card p-6 shadow-soft">
                <div
                  className={
                    "grid h-11 w-11 place-items-center rounded-md " +
                    (p.tone === "primary"
                      ? "bg-brand-soft text-primary"
                      : p.tone === "secondary"
                        ? "bg-secondary-soft text-secondary"
                        : "bg-success-soft text-success")
                  }
                >
                  {p.icon}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-body">{p.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-gradient-bg">
        <div className="cw-container py-16 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold md:text-4xl">
            Want to host a workshop?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Switch to Organizer mode and host live or recorded workshops on Creative Wings. Set your price,
            fill your seats, get paid.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/sign-up">
                Become an organizer <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/brand-story">Read host guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
