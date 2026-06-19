import type { LucideIcon } from "lucide-react";
import { Feather } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  AUTH_CREATIVE,
  type AuthCreativeVariant,
  gradientStyle,
} from "./auth-config";

export function AuthCreativePanel({ variant }: { variant: AuthCreativeVariant }) {
  const config = AUTH_CREATIVE[variant];
  const stickers = config.stickers ?? [];
  const TagIcon = config.tagIcon ?? Feather;
  const glows = config.glows ?? DEFAULT_GLOWS;

  return (
    <div
      className="relative hidden min-h-full w-full flex-col justify-between overflow-hidden px-16 py-14 text-white md:flex"
      style={gradientStyle(config.gradient)}
    >
      {glows.map((glow, i) => (
        <div
          key={i}
          aria-hidden
          className={cn("pointer-events-none absolute", glow.className)}
          style={{ background: glow.background }}
        />
      ))}

      {stickers.map((Icon, i) => (
        <Sticker
          key={i}
          icon={Icon}
          className={
            config.stickerClassNames?.[i] ??
            STICKER_POSITIONS[i % STICKER_POSITIONS.length]
          }
        />
      ))}

      <div className="relative flex flex-wrap items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.075em] text-white/80">
        <span className="inline-flex items-center gap-2 rounded-pill border border-white/40 bg-white/15 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-white">
          <TagIcon className="h-3.5 w-3.5" aria-hidden />
          {config.tag}
        </span>
        {config.breadcrumb && (
          <span>{config.breadcrumb}</span>
        )}
      </div>

      <div className="relative max-w-[592px] space-y-[22px]">
        <h2 className="whitespace-pre-line text-[104px] font-black italic leading-[0.92] tracking-tight">
          {config.headline}
        </h2>

        {config.kicker && (
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#FFE6A3]">
            {config.kicker}
          </p>
        )}

        <p className="max-w-[592px] text-[19px] font-medium leading-[1.45] text-white/90">
          {config.body}
        </p>

        {config.testimonials && (
          <div className="space-y-3 pt-2">
            {config.testimonials.map((t) => (
              <div
                key={t.num}
                className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm font-black text-[#FFE6A3]">{t.num}</span>
                  <div>
                    <p className="text-sm font-bold">{t.who}</p>
                    <p className="mt-1 text-xs italic text-white/75">{t.quote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {config.card && (
          <div
            className={cn(
              "rounded-[18px] border border-white/35 bg-white/15 p-5 backdrop-blur-md",
              config.card.className,
            )}
          >
            <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#FFE6A3]">
              {config.card.stamp}
            </p>
            {config.card.title && (
              <p className={cn("mt-1 text-lg font-extrabold", config.card.titleClassName)}>
                {config.card.title}
              </p>
            )}
            <ul className="mt-4 space-y-2">
              {config.card.items.map((item) => (
                <li key={item.step + item.text} className="flex items-center gap-2.5 text-[13px]">
                  {item.icon ? (
                    <item.icon className="h-[18px] w-[18px] shrink-0 text-[#FFE6A3]" aria-hidden />
                  ) : (
                    <span className="font-black italic text-[#FFE6A3]">{item.step}</span>
                  )}
                  <span className="font-semibold text-white/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="relative grid grid-cols-3 gap-7">
        {config.stats.map(({ icon: Icon, value, label }) => (
          <div key={label}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#FFE6A3]" aria-hidden />
              <span className="text-[30px] font-black italic leading-none tracking-tight">
                {value}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-white/70">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const STICKER_POSITIONS = [
  "right-[18%] top-[7%] h-[46px] w-[46px] rotate-[18deg] text-[#FFE6A3] opacity-95",
  "left-[12%] top-[40%] h-8 w-8 -rotate-[20deg] text-white opacity-90",
  "right-[11%] top-[60%] h-10 w-10 rotate-[14deg] text-[#FFD66B] opacity-95",
  "left-[4%] bottom-[40%] h-11 w-11 -rotate-12 text-[#FCE6EC] opacity-85",
  "right-[10%] top-[34%] h-9 w-9 rotate-[25deg] text-white opacity-80",
];

const DEFAULT_GLOWS = [
  {
    className: "-left-28 -top-40 h-[520px] w-[520px] rounded-full opacity-85",
    background: "radial-gradient(circle, rgba(255,230,163,0.5) 0%, transparent 70%)",
  },
  {
    className: "bottom-20 right-0 h-[480px] w-[480px] rounded-full",
    background: "radial-gradient(circle, rgba(127,177,229,0.5) 0%, transparent 70%)",
  },
];

function Sticker({ icon: Icon, className }: { icon: LucideIcon; className: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute",
        className,
      )}
    >
      <Icon className="h-full w-full" />
    </div>
  );
}
