import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("wallet_entries")
    .select("created_at, entry_type, amount, currency, reason, reference_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const header = "date,type,amount,currency,reason,reference_id\n";
  const rows = (entries ?? [])
    .map(
      (e) =>
        `${e.created_at},${e.entry_type},${e.amount},${e.currency},${e.reason},${e.reference_id ?? ""}`,
    )
    .join("\n");

  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wallet.csv"',
    },
  });
}
