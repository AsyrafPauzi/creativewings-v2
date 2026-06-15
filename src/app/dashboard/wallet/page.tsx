import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Wallet" };

export default async function WalletPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("wallet_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const balance = (entries ?? []).reduce((acc, e) => {
    const signed = e.entry_type === "credit" ? e.amount : -e.amount;
    return acc + signed;
  }, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Credits, refunds, and sponsor grants.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current balance</CardTitle>
          <CardDescription>Across all campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(balance)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="divide-y">
              {entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium capitalize">{e.reason.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(e.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={e.entry_type === "credit" ? "success" : "destructive"}>
                      {e.entry_type === "credit" ? "+" : "−"} {formatCurrency(e.amount, e.currency)}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
