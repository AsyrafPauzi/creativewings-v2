import { createHash, randomBytes } from "crypto";

import { createAdminClient } from "@/lib/supabase/server";
import type { CWApiKeyScope } from "@/lib/supabase/database.types";

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export function generateApiKeySecret() {
  const raw = randomBytes(24).toString("hex");
  return `cw_live_${raw}`;
}

export async function validateApiKey(request: Request, requiredScope: CWApiKeyScope) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const keyHash = hashApiKey(token);
  const supabase = createAdminClient();

  const { data: key } = await supabase
    .from("api_keys")
    .select("id, organizer_id, scopes, is_active")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (!key?.is_active) return null;
  if (!key.scopes?.includes(requiredScope)) return null;

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", key.id);

  return { keyId: key.id, organizerId: key.organizer_id };
}

export async function assertApiCampaignAccess(organizerId: string, campaignId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("organizer_id", organizerId)
    .maybeSingle();
  return !!data;
}
