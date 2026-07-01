import { createAdminClient } from "@/lib/supabase/server";

export async function recordWalletCredit(opts: {
  userId: string;
  amount: number;
  currency?: string;
  reason: string;
  referenceId?: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("wallet_entries").insert({
    user_id: opts.userId,
    entry_type: "credit",
    amount: opts.amount,
    currency: opts.currency ?? "MYR",
    reason: opts.reason,
    reference_id: opts.referenceId ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function recordWalletDebit(opts: {
  userId: string;
  amount: number;
  currency?: string;
  reason: string;
  referenceId?: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("wallet_entries").insert({
    user_id: opts.userId,
    entry_type: "debit",
    amount: opts.amount,
    currency: opts.currency ?? "MYR",
    reason: opts.reason,
    reference_id: opts.referenceId ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function getWalletBalance(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("wallet_entries")
    .select("entry_type, amount")
    .eq("user_id", userId);

  return (data ?? []).reduce((acc, e) => {
    return acc + (e.entry_type === "credit" ? e.amount : -e.amount);
  }, 0);
}
