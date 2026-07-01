import { createAdminClient } from "@/lib/supabase/server";

import type { CommercePayConfig } from "./commercepay/types";

export async function getCommercePayConfig(): Promise<CommercePayConfig | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_payment_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (!data?.enabled) return null;

  const testMode = data.test_mode;
  const tenantId = testMode ? data.test_tenant_id : data.live_tenant_id;
  const secretKey = testMode ? data.test_secret_key : data.live_secret_key;
  const currency = testMode ? data.test_currency : data.live_currency;

  if (!tenantId || !secretKey) return null;

  return {
    testMode,
    tenantId,
    secretKey,
    currency: currency ?? "MYR",
  };
}

export async function getPaymentSettingsForAdmin() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("platform_payment_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  return data;
}
