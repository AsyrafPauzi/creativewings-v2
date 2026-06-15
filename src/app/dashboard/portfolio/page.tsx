import { ComingSoon } from "@/components/dashboard/coming-soon";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  await requireUser();
  return (
    <ComingSoon
      title="My portfolio"
      description="Upload portfolio pieces, tag them, and link them to campaigns you've entered. This will appear on your public /profile/your-name page."
    />
  );
}
