"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit/log";
import { generateApiKeySecret, hashApiKey } from "@/lib/api/validate-api-key";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import type { CWApiKeyScope } from "@/lib/supabase/database.types";

async function requireAdmin() {
  const { profile, user } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");
  return user;
}

export async function createApiKeyAction(formData: FormData): Promise<{ secret?: string; error?: string }> {
  const actor = await requireAdmin();
  const organizerId = String(formData.get("organizer_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const scopesRaw = String(formData.get("scopes") ?? "read_submissions,read_kpis");

  if (!organizerId || !name) return { error: "Organizer and name are required." };

  const scopes = scopesRaw.split(",").map((s) => s.trim()) as CWApiKeyScope[];
  const secret = generateApiKeySecret();
  const keyHash = hashApiKey(secret);
  const keyPrefix = secret.slice(0, 12);

  const supabase = createAdminClient();
  const { error } = await supabase.from("api_keys").insert({
    organizer_id: organizerId,
    name,
    key_prefix: keyPrefix,
    key_hash: keyHash,
    scopes,
    created_by: actor.id,
  });

  if (error) return { error: error.message };

  await writeAuditLog({
    action: "api_key.created",
    objectType: "api_key",
    actorId: actor.id,
    details: { organizer_id: organizerId, name, key_prefix: keyPrefix },
  });

  revalidatePath("/dashboard/admin/api-keys");
  return { secret };
}

export async function revokeApiKeyAction(keyId: string) {
  const actor = await requireAdmin();
  const supabase = createAdminClient();

  await supabase.from("api_keys").update({ is_active: false }).eq("id", keyId);

  await writeAuditLog({
    action: "api_key.revoked",
    objectType: "api_key",
    objectId: keyId,
    actorId: actor.id,
  });

  revalidatePath("/dashboard/admin/api-keys");
}
