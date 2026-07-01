import { requireUser } from "@/lib/auth";
import { getWalletBalance } from "@/lib/payments/wallet";
import { createClient } from "@/lib/supabase/server";

import { WithdrawForm } from "./withdraw-form";

export const metadata = { title: "Withdraw" };

export default async function WithdrawPage() {
  const { user } = await requireUser();
  const balance = await getWalletBalance(user.id);
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: bank } = org
    ? await supabase
        .from("organizer_bank_accounts")
        .select("bank_name, account_name, account_number")
        .eq("organizer_id", org.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Withdraw funds</h1>
        <p className="text-text-secondary">Request a payout from your wallet balance.</p>
      </header>
      <WithdrawForm balance={balance} defaults={bank ?? undefined} />
    </div>
  );
}
