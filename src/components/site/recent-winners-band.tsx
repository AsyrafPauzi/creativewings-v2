import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export async function RecentWinnersBand() {
  const supabase = await createClient();

  const { data: winners } = await supabase
    .from("submissions")
    .select(
      "id, student_name, rank, status, artwork_url, campaigns:campaign_id(title, total_prize_value)",
    )
    .or("status.in.(shortlisted,winner),rank.not.is.null")
    .order("rank", { ascending: true, nullsFirst: false })
    .limit(5);

  const rows = (winners ?? []).map((w) => {
    const campaign = Array.isArray(w.campaigns) ? w.campaigns[0] : w.campaigns;
    const name = w.student_name ?? "Winner";
    const initials = name
      .split(" ")
      .map((p: string) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: w.id,
      name,
      campaign: campaign?.title ?? "Creative Wings",
      prize: campaign?.total_prize_value ?? (w.rank === 1 ? "Winner" : "Shortlisted"),
      initials,
      artwork: w.artwork_url,
    };
  });

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="cw-container">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-warning">
              <Trophy className="h-4 w-4" />
              Recent winners
            </div>
            <h2 data-gsap="section-head" className="mt-2 text-3xl font-extrabold italic tracking-[-0.04em] text-body md:text-4xl">
              Last week&apos;s wings.
            </h2>
          </div>
          <Link href="/winners" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-secondary">
            See all wins <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {rows.length === 0 ? (
            <p className="col-span-full text-sm text-text-muted">Winners will appear here after campaigns conclude.</p>
          ) : (
            rows.map((row) => (
              <article key={row.id} data-gsap="winner-card" className="overflow-hidden rounded-2xl border bg-white shadow-soft">
                <div className="relative grid h-40 place-items-center bg-gradient-to-br from-brand-soft to-secondary/20">
                  {row.artwork ? (
                    <Image src={row.artwork} alt={row.name} fill className="object-cover" sizes="200px" />
                  ) : (
                    <span className="grid h-[60px] w-[60px] place-items-center rounded-full border-[3px] border-white bg-white/90 text-sm font-extrabold text-body">
                      {row.initials}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 p-4">
                  <h3 className="text-sm font-extrabold text-body">{row.name}</h3>
                  <p className="text-xs font-medium text-text-muted">{row.campaign}</p>
                  <p className="text-xl font-extrabold italic tracking-tight text-primary">{row.prize}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
