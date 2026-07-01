import { createAdminClient } from "@/lib/supabase/server";

export type CampaignReport = {
  campaign: {
    id: string;
    title: string;
    slug: string;
    status: string;
    kpi_target: number;
    submissions_count: number;
    entry_fee: number;
    currency: string;
  };
  totals: {
    submissions: number;
    paid: number;
    staged: number;
    shortlisted: number;
    winners: number;
    revenue: number;
    votes: number;
  };
  byStatus: { status: string; count: number }[];
  byAgeBracket: { label: string; count: number }[];
  bySchool: { school_name: string; count: number }[];
  participantsByDay: { date: string; count: number }[];
  revenueByDay: { date: string; amount: number }[];
};

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function getCampaignReport(campaignId: string): Promise<CampaignReport> {
  const supabase = createAdminClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, title, slug, status, kpi_target, submissions_count, entry_fee, currency")
    .eq("id", campaignId)
    .single();

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      "id, status, vote_count, created_at, age_bracket_id, school_id, age_brackets:age_bracket_id(label), schools:school_id(school_name)",
    )
    .eq("campaign_id", campaignId);

  const { data: orders } = await supabase
    .from("payment_orders")
    .select("amount_cents, paid_at, status")
    .eq("campaign_id", campaignId)
    .eq("status", "paid");

  const subs = submissions ?? [];
  const statusMap = new Map<string, number>();
  const bracketMap = new Map<string, number>();
  const schoolMap = new Map<string, number>();
  const dayMap = new Map<string, number>();
  let votes = 0;
  let paid = 0;
  let staged = 0;
  let shortlisted = 0;
  let winners = 0;

  for (const s of subs) {
    statusMap.set(s.status, (statusMap.get(s.status) ?? 0) + 1);
    votes += s.vote_count ?? 0;
    if (s.status === "paid") paid += 1;
    if (s.status === "staged") staged += 1;
    if (s.status === "shortlisted") shortlisted += 1;
    if (s.status === "winner") winners += 1;

    const bracket = Array.isArray(s.age_brackets) ? s.age_brackets[0] : s.age_brackets;
    if (bracket?.label) {
      bracketMap.set(bracket.label, (bracketMap.get(bracket.label) ?? 0) + 1);
    }

    const school = Array.isArray(s.schools) ? s.schools[0] : s.schools;
    const schoolName = school?.school_name ?? "Direct";
    schoolMap.set(schoolName, (schoolMap.get(schoolName) ?? 0) + 1);

    const d = dayKey(s.created_at);
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
  }

  const revenueByDayMap = new Map<string, number>();
  let revenue = 0;
  for (const o of orders ?? []) {
    const amount = (o.amount_cents ?? 0) / 100;
    revenue += amount;
    if (o.paid_at) {
      const d = dayKey(o.paid_at);
      revenueByDayMap.set(d, (revenueByDayMap.get(d) ?? 0) + amount);
    }
  }

  return {
    campaign: {
      id: campaign.id,
      title: campaign.title,
      slug: campaign.slug,
      status: campaign.status,
      kpi_target: campaign.kpi_target ?? 0,
      submissions_count: campaign.submissions_count ?? 0,
      entry_fee: Number(campaign.entry_fee ?? 0),
      currency: campaign.currency ?? "MYR",
    },
    totals: {
      submissions: subs.length,
      paid,
      staged,
      shortlisted,
      winners,
      revenue,
      votes,
    },
    byStatus: [...statusMap.entries()].map(([status, count]) => ({ status, count })),
    byAgeBracket: [...bracketMap.entries()].map(([label, count]) => ({ label, count })),
    bySchool: [...schoolMap.entries()].map(([school_name, count]) => ({ school_name, count })),
    participantsByDay: [...dayMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    revenueByDay: [...revenueByDayMap.entries()]
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export type RosterRow = {
  submission_code: string | null;
  student_name: string | null;
  status: string;
  moderation_status: string;
  score: number | null;
  rank: number | null;
  vote_count: number;
  age_bracket: string | null;
  school_name: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  paid_at: string | null;
  created_at: string;
};

export async function getRosterRows(
  campaignId: string,
  includeStaged: boolean,
): Promise<RosterRow[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("submissions")
    .select(
      "submission_code, student_name, status, moderation_status, score, rank, vote_count, guardian_name, guardian_contact, paid_at, created_at, age_brackets:age_bracket_id(label), schools:school_id(school_name)",
    )
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (!includeStaged) {
    query = query.neq("status", "staged");
  }

  const { data } = await query;

  return (data ?? []).map((row) => {
    const bracket = Array.isArray(row.age_brackets) ? row.age_brackets[0] : row.age_brackets;
    const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    return {
      submission_code: row.submission_code,
      student_name: row.student_name,
      status: row.status,
      moderation_status: row.moderation_status,
      score: row.score,
      rank: row.rank,
      vote_count: row.vote_count ?? 0,
      age_bracket: bracket?.label ?? null,
      school_name: school?.school_name ?? null,
      guardian_name: row.guardian_name,
      guardian_contact: row.guardian_contact,
      paid_at: row.paid_at,
      created_at: row.created_at,
    };
  });
}
