"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getWalletBalance, recordWalletDebit } from "@/lib/payments/wallet";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface WithdrawState {
  error?: string;
  success?: string;
}

export async function requestWithdrawalAction(
  _prev: WithdrawState,
  formData: FormData,
): Promise<WithdrawState> {
  const { user } = await requireUser();
  const supabase = await createClient();

  const amount = Number(formData.get("amount"));
  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountName = String(formData.get("account_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();
  const currency = String(formData.get("currency") ?? "MYR").trim() || "MYR";

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid withdrawal amount." };
  }
  if (!bankName || !accountName || !accountNumber) {
    return { error: "Bank details are required." };
  }

  const balance = await getWalletBalance(user.id);
  if (amount > balance) {
    return { error: "Amount exceeds your wallet balance." };
  }

  const { error } = await supabase.from("withdrawal_requests").insert({
    user_id: user.id,
    amount,
    currency,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/wallet/withdraw");
  return { success: "Withdrawal request submitted for admin review." };
}

export async function processWithdrawalAction(formData: FormData) {
  "use server";
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const note = String(formData.get("admin_note") ?? "").trim() || null;

  const supabase = await createClient();
  const { data: req } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!req || req.status !== "pending") return;

  if (action === "approve") {
    await recordWalletDebit({
      userId: req.user_id,
      amount: Number(req.amount),
      currency: req.currency,
      reason: "withdrawal",
      referenceId: req.id,
    });
    await supabase
      .from("withdrawal_requests")
      .update({ status: "approved", admin_note: note, processed_at: new Date().toISOString() })
      .eq("id", id);
  } else if (action === "reject") {
    await supabase
      .from("withdrawal_requests")
      .update({ status: "rejected", admin_note: note, processed_at: new Date().toISOString() })
      .eq("id", id);
  }

  revalidatePath("/dashboard/admin/withdrawals");
}
