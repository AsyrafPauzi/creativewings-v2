"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { CWRole } from "@/lib/supabase/database.types";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return { user, profile };
}

export async function setUserRoleAction(userId: string, role: CWRole) {
  const { user } = await requireAdmin();
  if (userId === user.id) return;

  const supabase = createAdminClient();
  const { data: before } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .maybeSingle();

  await supabase.from("profiles").update({ role }).eq("id", userId);

  await writeAuditLog({
    action: "user.role_changed",
    objectType: "profile",
    objectId: userId,
    actorId: user.id,
    details: { from: before?.role, to: role, email: before?.email },
  });

  revalidatePath("/dashboard/admin/users");
}

export async function setUserAdminAction(userId: string, isAdmin: boolean) {
  const { user, profile } = await requireAdmin();
  if (userId === user.id && !isAdmin) return;

  const supabase = createAdminClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (!target) return;
  if (userId === user.id && profile.is_admin && !isAdmin) return;

  await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);

  await writeAuditLog({
    action: isAdmin ? "user.admin_granted" : "user.admin_revoked",
    objectType: "profile",
    objectId: userId,
    actorId: user.id,
    details: { email: target.email },
  });

  revalidatePath("/dashboard/admin/users");
}
