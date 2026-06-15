import { ComingSoon } from "@/components/dashboard/coming-soon";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return (
    <ComingSoon
      title="Admin"
      description="Platform-wide moderation queue, user management, campaign approvals, audit log, sync center, and bulk image optimisation."
    />
  );
}
