import Image from "next/image";

import { cn, SDG_GOALS } from "@/lib/utils";

interface SdgIconProps {
  goal: number;
  size?: number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "none";
}

const radiusMap: Record<NonNullable<SdgIconProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};

export function SdgIcon({ goal, size = 56, className, rounded = "sm" }: SdgIconProps) {
  const meta = SDG_GOALS[goal];
  const num = String(goal).padStart(2, "0");
  return (
    <div
      className={cn("relative overflow-hidden shrink-0", radiusMap[rounded], className)}
      style={{ width: size, height: size }}
      title={meta ? `SDG ${goal} · ${meta.title}` : `SDG ${goal}`}
    >
      <Image
        src={`/sdg/${num}.png`}
        alt={meta ? `SDG ${goal}: ${meta.title}` : `SDG ${goal}`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}

export function SdgRow({
  goals,
  size = 32,
  max,
  className,
}: {
  goals: number[];
  size?: number;
  /** Cap the number of icons shown. Remaining count is rendered as a `+N` chip. */
  max?: number;
  className?: string;
}) {
  if (!goals || goals.length === 0) return null;
  const visible = max != null ? goals.slice(0, max) : goals;
  const hidden = max != null ? Math.max(0, goals.length - visible.length) : 0;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((g) => (
        <SdgIcon key={g} goal={g} size={size} />
      ))}
      {hidden > 0 && (
        <span
          className="grid shrink-0 place-items-center rounded-sm border border-border bg-surface text-[10px] font-extrabold text-text-secondary"
          style={{ width: size, height: size }}
          title={`${hidden} more SDG${hidden === 1 ? "" : "s"}`}
          aria-label={`${hidden} more SDG${hidden === 1 ? "" : "s"}`}
        >
          +{hidden}
        </span>
      )}
    </div>
  );
}

export function SdgChip({ goal, className }: { goal: number; className?: string }) {
  const meta = SDG_GOALS[goal];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-pill bg-surface px-2 py-1 text-xs font-semibold text-body",
        className,
      )}
    >
      <SdgIcon goal={goal} size={20} />
      <span>SDG {goal}</span>
      {meta && <span className="text-text-muted hidden sm:inline">· {meta.title}</span>}
    </div>
  );
}
