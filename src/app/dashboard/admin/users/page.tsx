import { redirect } from "next/navigation";

import { UserAdminControls } from "@/components/admin/user-admin-controls";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

const ROLE_TONES: Record<string, "default" | "secondary" | "info" | "soft"> = {
  contestant: "soft",
  creator: "info",
  organizer: "secondary",
  admin: "default",
};

export default async function AdminUsersPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_admin, age_category, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Users</h1>
        <p className="text-text-secondary">100 most recent accounts. Change roles and admin access.</p>
      </header>

      <Card>
        <ul className="divide-y">
          {(users ?? []).map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="line-clamp-1 font-bold text-body">{u.full_name || u.email}</div>
                <div className="text-xs text-text-muted">
                  {u.email} · Joined {formatDate(u.created_at)}
                  {u.age_category ? ` · ${u.age_category.replace(/_/g, " ")}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge variant={ROLE_TONES[u.role] ?? "soft"} className="capitalize">{u.role}</Badge>
                {u.is_admin && <Badge variant="default">Admin</Badge>}
                <UserAdminControls
                  userId={u.id}
                  currentRole={u.role}
                  isAdmin={u.is_admin}
                  isSelf={u.id === profile.id}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
