"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveOrganizerBankAction(formData: FormData) {
  const { user } = await requireRole("organizer");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!org) throw new Error("Save your organization profile first.");

  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountName = String(formData.get("account_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();
  const swiftCode = String(formData.get("swift_code") ?? "").trim() || null;

  if (!bankName || !accountName || !accountNumber) {
    throw new Error("Bank name, account name, and account number are required.");
  }

  const { error } = await supabase.from("organizer_bank_accounts").upsert(
    {
      organizer_id: org.id,
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
      swift_code: swiftCode,
    },
    { onConflict: "organizer_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/organizer/bank");
}
