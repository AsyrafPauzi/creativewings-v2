import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

import { awardBadgeManualAction, revokeBadgeManualAction } from "./actions";

async function revokeForm(userId: string, badgeId: string) {
  "use server";
  await revokeBadgeManualAction(userId, badgeId);
}

export default async function AdminBadgesPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const { email: emailQuery } = await searchParams;
  const supabase = await createClient();

  const { data: catalog } = await supabase
    .from("badges")
    .select("*")
    .order("name");

  let targetUser: { id: string; email: string; full_name: string | null } | null = null;
  let earned: {
    badge_id: string;
    awarded_at: string;
    badges: { id: string; slug: string; name: string } | null;
  }[] = [];

  if (emailQuery?.trim()) {
    const { data: userRow } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .ilike("email", emailQuery.trim())
      .maybeSingle();
    if (userRow) {
      targetUser = userRow;
      const { data: rows } = await supabase
        .from("user_badges")
        .select("badge_id, awarded_at, badges:badge_id(id, slug, name)")
        .eq("user_id", userRow.id);
      earned = (rows ?? []).map((r) => ({
        ...r,
        badges: Array.isArray(r.badges) ? r.badges[0] : r.badges,
      }));
    }
  }

  const awardAction = awardBadgeManualAction;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard/admin" className="hover:underline">
            ← Admin
          </Link>
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Sparkles className="h-7 w-7" />
          Badge manager
        </h1>
        <p className="text-muted-foreground">Manually award or revoke badges for any user.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Find user</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="flex flex-wrap gap-2">
            <Input name="email" type="email" placeholder="user@example.com" defaultValue={emailQuery ?? ""} />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {targetUser ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{targetUser.full_name ?? targetUser.email}</CardTitle>
              <CardDescription>{targetUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={awardAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="email" value={targetUser.email} />
                <div className="space-y-2">
                  <Label htmlFor="badge_id">Award badge</Label>
                  <Select id="badge_id" name="badge_id" required>
                    <option value="">Select badge…</option>
                    {(catalog ?? []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit">Award</Button>
              </form>

              <ul className="divide-y rounded-md border">
                {earned.length === 0 ? (
                  <li className="p-4 text-sm text-muted-foreground">No badges earned yet.</li>
                ) : (
                  earned.map((row) => (
                    <li key={row.badge_id} className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <div className="font-bold">{row.badges?.name ?? row.badge_id}</div>
                        <div className="text-xs text-muted-foreground">
                          Awarded {formatDate(row.awarded_at)}
                        </div>
                      </div>
                      <form action={revokeForm.bind(null, targetUser!.id, row.badge_id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Revoke
                        </Button>
                      </form>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : emailQuery ? (
        <p className="text-sm text-muted-foreground">No user found for that email.</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Badge catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            {(catalog ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="font-medium">{b.name}</span>
                {b.tier ? <Badge variant="outline" className="capitalize">{b.tier}</Badge> : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
