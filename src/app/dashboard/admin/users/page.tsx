import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">100 most recent accounts.</p>
      </header>

      <Card>
        <ul className="divide-y">
          {(users ?? []).map((u) => (
            <li key={u.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{u.full_name || u.email}</div>
                <div className="text-xs text-muted-foreground">
                  {u.email} · Joined {formatDate(u.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                {u.is_admin && <Badge variant="default">Admin</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
