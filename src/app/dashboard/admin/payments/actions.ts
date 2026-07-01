"use server";

import { revalidatePath } from "next/cache";

import { getPaymentSettingsForAdmin } from "@/lib/payments/settings";
import { createAdminClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export interface PaymentSettingsState {
  error?: string;
  success?: string;
}

export async function savePaymentSettingsAction(
  _prev: PaymentSettingsState,
  formData: FormData,
): Promise<PaymentSettingsState> {
  const { user, profile } = await requireUser();
  if (!profile.is_admin) return { error: "Admin access required." };

  const enabled = formData.get("enabled") === "on";
  const testMode = formData.get("test_mode") === "on";
  const testTenantId = String(formData.get("test_tenant_id") ?? "").trim() || null;
  const testCurrency = String(formData.get("test_currency") ?? "MYR").trim() || "MYR";
  const liveTenantId = String(formData.get("live_tenant_id") ?? "").trim() || null;
  const liveCurrency = String(formData.get("live_currency") ?? "MYR").trim() || "MYR";

  const testSecretRaw = String(formData.get("test_secret_key") ?? "").trim();
  const liveSecretRaw = String(formData.get("live_secret_key") ?? "").trim();

  const existing = await getPaymentSettingsForAdmin();
  const updates = {
    enabled,
    test_mode: testMode,
    test_tenant_id: testTenantId,
    test_currency: testCurrency,
    live_tenant_id: liveTenantId,
    live_currency: liveCurrency,
    test_secret_key: testSecretRaw || existing?.test_secret_key || null,
    live_secret_key: liveSecretRaw || existing?.live_secret_key || null,
    updated_by: user.id,
  };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("platform_payment_settings")
    .upsert({ id: "default", ...updates });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin/payments");
  return { success: "Payment settings saved." };
}
