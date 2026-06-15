import { ComingSoon } from "@/components/dashboard/coming-soon";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  await requireRole("business");
  return (
    <ComingSoon
      title="Reports"
      description="Generate PDF and Excel exports for your campaigns: submission counts, age-bracket breakdowns, school participation, KPI progress, and judging rosters."
    />
  );
}
