import { ComingSoon } from "@/components/dashboard/coming-soon";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Schools & coupons" };

export default async function CampaignSchoolsPage() {
  await requireRole("business");
  return (
    <ComingSoon
      title="Schools & sponsor coupons"
      description="Register schools that take part in your campaign, generate tokenised upload links for each school, and manage sponsor coupons that waive the entry fee."
    />
  );
}
