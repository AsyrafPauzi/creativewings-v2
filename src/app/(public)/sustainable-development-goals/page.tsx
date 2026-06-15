import { SDG_GOALS } from "@/lib/utils";

export const metadata = { title: "Sustainable Development Goals" };

export default function SDGPage() {
  return (
    <div>
      <section className="bg-[#0d0d12] py-20 text-white">
        <div className="container max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            United Nations · 2030 Agenda
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Sustainable Development Goals
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/80">
            Every Creative Wings campaign aligns with at least one of the 17 UN SDGs, so
            young talents don&apos;t just win prizes — they contribute to a better world.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(SDG_GOALS).map(([goalNum, meta]) => (
            <div
              key={goalNum}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className="flex items-center justify-between p-5 text-white"
                style={{ backgroundColor: meta.color }}
              >
                <div className="text-3xl font-black">{goalNum}</div>
                <div className="text-xs font-semibold uppercase tracking-wider">SDG</div>
              </div>
              <div className="p-5">
                <h2 className="text-base font-semibold leading-tight">{meta.title}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="container max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Designing campaigns that matter
          </h2>
          <p className="mt-4 text-muted-foreground">
            Whether it&apos;s a children&apos;s drawing competition under Quality Education (SDG 4)
            or a community wellness run under Good Health (SDG 3), every campaign on Creative
            Wings is tagged with the goals it supports — so participants, schools, and
            sponsors can see the real impact of joining in.
          </p>
        </div>
      </section>
    </div>
  );
}
