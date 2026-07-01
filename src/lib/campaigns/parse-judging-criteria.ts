import type { CWCampaignType } from "@/lib/supabase/database.types";

export type CriteriaRow = { name: string; weight: string; description?: string };

export function parseJudgingCriteria(
  raw: string | null | undefined,
  fallback: CriteriaRow[],
): { structured: CriteriaRow[]; prose: string | null } {
  const text = raw?.trim() ?? "";
  if (!text) {
    return { structured: fallback, prose: null };
  }

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const structured: CriteriaRow[] = [];
        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const row = item as Record<string, unknown>;
          const name = String(row.name ?? "").trim();
          if (!name) continue;
          structured.push({
            name,
            weight: String(row.weight ?? "—"),
            description: row.description ? String(row.description) : undefined,
          });
        }
        if (structured.length > 0) {
          return { structured, prose: null };
        }
      }
    } catch {
      // fall through to prose
    }
  }

  return { structured: fallback, prose: text };
}

export function defaultCriteriaForType(_type: CWCampaignType): CriteriaRow[] {
  return [];
}
