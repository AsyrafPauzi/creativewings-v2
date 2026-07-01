import type { RosterRow } from "@/lib/reports/aggregate";

export function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const ROSTER_HEADERS = [
  "submission_code",
  "student_name",
  "status",
  "moderation_status",
  "score",
  "rank",
  "vote_count",
  "age_bracket",
  "school_name",
  "guardian_name",
  "guardian_contact",
  "paid_at",
  "created_at",
] as const;

export function buildRosterCsv(rows: RosterRow[]) {
  const lines = [ROSTER_HEADERS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.submission_code ?? "",
        row.student_name ?? "",
        row.status,
        row.moderation_status,
        row.score != null ? String(row.score) : "",
        row.rank != null ? String(row.rank) : "",
        String(row.vote_count),
        row.age_bracket ?? "",
        row.school_name ?? "",
        row.guardian_name ?? "",
        row.guardian_contact ?? "",
        row.paid_at ?? "",
        row.created_at,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }
  return lines.join("\n");
}
