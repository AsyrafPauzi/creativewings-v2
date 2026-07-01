import { createAdminClient } from "@/lib/supabase/server";

export async function writeAuditLog(opts: {
  action: string;
  objectType: string;
  objectId?: string | null;
  actorId?: string | null;
  details?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();
  await supabase.from("audit_log").insert({
    action: opts.action,
    object_type: opts.objectType,
    object_id: opts.objectId ?? null,
    actor_id: opts.actorId ?? null,
    details: opts.details ?? null,
  });
}
