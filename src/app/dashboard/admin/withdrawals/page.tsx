import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

import { processWithdrawalAction } from "@/app/dashboard/wallet/withdraw/actions";

export const metadata = { title: "Withdrawal requests" };

export default async function AdminWithdrawalsPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const userIds = [...new Set((requests ?? []).map((r) => r.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Withdrawal requests</h1>
        <p className="text-text-secondary">Approve or reject user payout requests.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Pending & recent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!requests?.length ? (
            <p className="text-sm text-text-secondary">No withdrawal requests yet.</p>
          ) : (
            requests.map((r) => {
              const user = profileMap.get(r.user_id);
              return (
                <div key={r.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-body">
                        {formatCurrency(Number(r.amount), r.currency)} — {user?.full_name ?? user?.email}
                      </div>
                      <div className="text-xs text-text-muted">{formatDate(r.created_at)}</div>
                      <div className="mt-2 text-sm text-text-secondary">
                        {r.bank_name} · {r.account_name} · {r.account_number}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{r.status}</Badge>
                  </div>
                  {r.status === "pending" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={processWithdrawalAction} className="flex gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="action" value="approve" />
                        <Button type="submit" size="sm">Approve</Button>
                      </form>
                      <form action={processWithdrawalAction} className="flex gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="action" value="reject" />
                        <Input name="admin_note" placeholder="Rejection note" className="h-9 w-48" />
                        <Button type="submit" size="sm" variant="outline">Reject</Button>
                      </form>
                    </div>
                  )}
                  {r.admin_note && (
                    <p className="mt-2 text-xs text-text-muted">Note: {r.admin_note}</p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
