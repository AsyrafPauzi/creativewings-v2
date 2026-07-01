import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const referenceCode = url.searchParams.get("ReferenceCode");
  const transactionNumber = url.searchParams.get("TransactionNumber");

  if (!referenceCode) {
    redirect("/payments/cancelled");
  }

  await new Promise((r) => setTimeout(r, 2000));

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("payment_orders")
    .select("status, reference_code")
    .eq("reference_code", referenceCode)
    .maybeSingle();

  if (order?.status === "paid") {
    redirect(`/payments/success?ref=${encodeURIComponent(referenceCode)}`);
  }

  if (transactionNumber) {
    redirect(`/payments/success?ref=${encodeURIComponent(referenceCode)}&txn=${encodeURIComponent(transactionNumber)}`);
  }

  redirect(`/payments/cancelled?ref=${encodeURIComponent(referenceCode)}`);
}
