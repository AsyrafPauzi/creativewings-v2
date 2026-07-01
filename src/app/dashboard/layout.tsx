import { Suspense } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BadgeEarnedToast } from "@/components/badges/badge-earned-toast";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = await requireUser();
  const supabase = await createClient();

  const { data: pendingRows } = await supabase
    .from("user_badges")
    .select("badges:badge_id(slug, name)")
    .eq("user_id", user.id)
    .is("notified_at", null);

  const pending = (pendingRows ?? [])
    .map((row) => {
      const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges;
      return badge ? { slug: badge.slug, name: badge.name } : null;
    })
    .filter((b): b is { slug: string; name: string } => !!b);

  return (
    <DashboardShell
      role={profile.role}
      isAdmin={profile.is_admin}
      user={{
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
      }}
    >
      {children}
      <Suspense>
        <BadgeEarnedToast pending={pending} />
      </Suspense>
    </DashboardShell>
  );
}
