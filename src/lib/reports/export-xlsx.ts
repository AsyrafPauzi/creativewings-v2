import ExcelJS from "exceljs";

import type { CampaignReport, RosterRow } from "@/lib/reports/aggregate";
import { createAdminClient } from "@/lib/supabase/server";

export async function buildReportXlsx(
  report: CampaignReport,
  roster: RosterRow[],
): Promise<Buffer> {
  const supabase = createAdminClient();
  const workbook = new ExcelJS.Workbook();

  const summary = workbook.addWorksheet("Summary");
  summary.addRow(["Campaign", report.campaign.title]);
  summary.addRow(["Slug", report.campaign.slug]);
  summary.addRow(["Status", report.campaign.status]);
  summary.addRow(["Submissions", report.totals.submissions]);
  summary.addRow(["Paid", report.totals.paid]);
  summary.addRow(["Revenue", report.totals.revenue]);
  summary.addRow(["Votes", report.totals.votes]);
  summary.addRow(["KPI target", report.campaign.kpi_target]);

  const subs = workbook.addWorksheet("Submissions");
  subs.addRow([
    "Code",
    "Name",
    "Status",
    "Moderation",
    "Score",
    "Rank",
    "Votes",
    "Bracket",
    "School",
    "Paid at",
    "Created",
  ]);
  for (const row of roster) {
    subs.addRow([
      row.submission_code,
      row.student_name,
      row.status,
      row.moderation_status,
      row.score,
      row.rank,
      row.vote_count,
      row.age_bracket,
      row.school_name,
      row.paid_at,
      row.created_at,
    ]);
  }

  const schools = workbook.addWorksheet("Schools");
  schools.addRow(["School", "Submissions"]);
  for (const row of report.bySchool) {
    schools.addRow([row.school_name, row.count]);
  }

  const { data: schoolsData } = await supabase
    .from("schools")
    .select("school_code, school_name, coupon_code")
    .eq("campaign_id", report.campaign.id);
  schools.addRow([]);
  schools.addRow(["School code", "Name", "Coupon"]);
  for (const s of schoolsData ?? []) {
    schools.addRow([s.school_code, s.school_name, s.coupon_code]);
  }

  const revenue = workbook.addWorksheet("Revenue");
  revenue.addRow(["Reference", "Amount", "Currency", "Paid at", "Status"]);
  const { data: orders } = await supabase
    .from("payment_orders")
    .select("reference_code, amount_cents, currency, paid_at, status")
    .eq("campaign_id", report.campaign.id)
    .order("paid_at", { ascending: false });
  for (const o of orders ?? []) {
    revenue.addRow([
      o.reference_code,
      (o.amount_cents ?? 0) / 100,
      o.currency,
      o.paid_at,
      o.status,
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
