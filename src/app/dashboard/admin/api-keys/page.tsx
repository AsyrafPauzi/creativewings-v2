import { redirect } from "next/navigation";

import { ApiKeyCreateForm } from "@/components/admin/api-key-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { revokeApiKeyAction } from "./actions";

export const metadata = { title: "API keys" };

export default async function AdminApiKeysPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const supabase = await createClient();

  const [{ data: keys }, { data: organizers }] = await Promise.all([
    supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, is_active, last_used_at, created_at, organizer_id, organizers:organizer_id(name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("organizers").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">API keys</h1>
        <p className="text-text-secondary">
          REST integration keys for organizers. Secrets are shown once at creation.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create key</CardTitle>
          <CardDescription>Keys authenticate requests to /api/public/v1/…</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyCreateForm organizers={organizers ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active keys</CardTitle>
        </CardHeader>
        <CardContent>
          {!keys || keys.length === 0 ? (
            <p className="text-sm text-text-secondary">No API keys yet.</p>
          ) : (
            <ul className="divide-y">
              {keys.map((k) => {
                const org = Array.isArray(k.organizers) ? k.organizers[0] : k.organizers;
                return (
                  <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <div className="font-bold text-body">{k.name}</div>
                      <div className="text-xs text-text-muted">
                        {org?.name ?? "—"} · {k.key_prefix}… · Created {formatDate(k.created_at)}
                        {k.last_used_at ? ` · Last used ${formatDate(k.last_used_at)}` : ""}
                      </div>
                      <div className="mt-1 flex gap-1">
                        {(k.scopes ?? []).map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    {k.is_active ? (
                      <form action={async () => {
                        "use server";
                        await revokeApiKeyAction(k.id);
                      }}>
                        <Button type="submit" size="sm" variant="outline">Revoke</Button>
                      </form>
                    ) : (
                      <Badge variant="secondary">Revoked</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
