"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  {
    text: "I paint life as I would like it to be.",
    author: "Norman Rockwell (1894 – 1978)",
  },
  {
    text: "Without thinking too much about it in specific terms, I was showing the America I knew and observed to others who might not have noticed.",
    author: "Norman Rockwell (1894 – 1978)",
  },
  {
    text: "I don't think there's anything mystical or magical about being a successful artist.",
    author: "Norman Rockwell (1894 – 1978)",
  },
];

export function RockwellHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#0d0d12] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 15% 25%, rgba(139,92,246,0.45), transparent 60%)," +
            "radial-gradient(50% 40% at 85% 35%, rgba(56,189,248,0.35), transparent 60%)," +
            "radial-gradient(70% 60% at 50% 110%, rgba(244,114,182,0.30), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container relative grid items-center gap-12 py-20 md:grid-cols-[1.1fr_1fr] md:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Creative Wings · Yibon Plt
          </div>

          <div className="relative min-h-[140px] md:min-h-[180px]">
            {QUOTES.map((q, i) => (
              <blockquote
                key={i}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <p className="text-2xl font-medium leading-snug text-white md:text-3xl">
                  &ldquo;{q.text}&rdquo;
                </p>
                <footer className="mt-4 text-sm uppercase tracking-[0.25em] text-white/60">
                  — {q.author}
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show quote ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-4 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-violet-500/30 via-sky-400/20 to-rose-400/20 blur-3xl" />
          <div className="aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/60">
                Together
              </div>
              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                We Help Young Talents Soar
              </h2>
              <p className="mt-4 max-w-xs text-sm text-white/70">
                Art · Sports · STEM · Storytelling — a national stage for every student to shine.
              </p>
              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                {[
                  { k: "01", l: "Art" },
                  { k: "02", l: "Sports" },
                  { k: "03", l: "STEM" },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="rounded-xl border border-white/15 bg-white/5 p-3 text-left"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                      {item.k}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{item.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
