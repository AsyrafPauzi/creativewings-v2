import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { CampaignReport, RosterRow } from "@/lib/reports/aggregate";

export async function buildReportPdf(report: CampaignReport, roster: RosterRow[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;

  const draw = (text: string, size = 11, useBold = false) => {
    page.drawText(text, { x: left, y, size, font: useBold ? bold : font, color: rgb(0.1, 0.1, 0.1) });
    y -= size + 6;
  };

  draw(report.campaign.title, 18, true);
  draw(`Generated ${new Date().toLocaleString("en-MY")}`, 9);
  y -= 8;

  draw("Summary", 14, true);
  draw(`Submissions: ${report.totals.submissions}`);
  draw(`Paid entries: ${report.totals.paid}`);
  draw(`Revenue: ${report.campaign.currency} ${report.totals.revenue.toFixed(2)}`);
  draw(`Total votes: ${report.totals.votes}`);
  draw(`Shortlisted: ${report.totals.shortlisted} · Winners: ${report.totals.winners}`);
  y -= 8;

  draw("Top submissions", 14, true);
  const top = roster.slice(0, 20);
  for (const row of top) {
    if (y < 60) break;
    const line = `${row.submission_code ?? "—"} · ${row.student_name ?? "—"} · ${row.status} · score ${row.score ?? "—"} · ${row.vote_count} votes`;
    draw(line.slice(0, 90), 9);
  }

  return Buffer.from(await pdf.save());
}
