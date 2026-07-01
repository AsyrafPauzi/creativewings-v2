import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { saveOrganizerBankAction } from "./actions";

export const metadata = { title: "Bank details" };

export default async function OrganizerBankPage() {
  const { user } = await requireRole("organizer");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: bank } = org
    ? await supabase
        .from("organizer_bank_accounts")
        .select("*")
        .eq("organizer_id", org.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Bank details</h1>
        <p className="text-text-secondary">Used for organizer payouts and withdrawal pre-fill.</p>
      </header>

      <form action={saveOrganizerBankAction}>
        <Card>
          <CardHeader>
            <CardTitle>Payout account</CardTitle>
            <CardDescription>Keep these details up to date for prize settlements.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank name</Label>
              <Input id="bank_name" name="bank_name" defaultValue={bank?.bank_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Account name</Label>
              <Input id="account_name" name="account_name" defaultValue={bank?.account_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account number</Label>
              <Input id="account_number" name="account_number" defaultValue={bank?.account_number ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swift_code">SWIFT / BIC (optional)</Label>
              <Input id="swift_code" name="swift_code" defaultValue={bank?.swift_code ?? ""} />
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end">
          <Button type="submit" size="lg">Save bank details</Button>
        </div>
      </form>
    </div>
  );
}
