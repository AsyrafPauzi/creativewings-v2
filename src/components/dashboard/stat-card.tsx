import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export type StatCardTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive";

const TONE_BG: Record<StatCardTone, string> = {
  primary: "bg-brand-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  destructive: "bg-destructive-soft text-destructive",
};

const TONE_STRIP: Record<StatCardTone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

/**
 * Shared dashboard KPI card.
 *
 * - Coloured top accent strip ties cards to a tone (matches the warmer
 *   admin treatment used in Pencil).
 * - Optional delta line (e.g. "+12% this week") rendered with a tone color.
 */
export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  delta,
  deltaTone = "success",
  href,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: StatCardTone;
  delta?: string;
  deltaTone?: StatCardTone;
  href?: string;
}) {
  const inner = (
    <Card className="overflow-hidden">
      <span aria-hidden className={`block h-1 w-full ${TONE_STRIP[tone]}`} />
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-text-muted">
            {label}
          </div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-body md:text-3xl">
            {value}
          </div>
          {delta && (
            <div className={`mt-1 text-[11px] font-semibold ${TONE_BG[deltaTone].split(" ")[1]}`}>
              {delta}
            </div>
          )}
        </div>
        <div className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-md ${TONE_BG[tone]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
  if (href) {
    return (
      <a href={href} className="block transition-transform hover:-translate-y-0.5">
        {inner}
      </a>
    );
  }
  return inner;
}
