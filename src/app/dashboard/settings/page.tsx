import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ChevronRight, Download, Lock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

async function updateProfileAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim() || null,
      display_name: String(formData.get("display_name") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      country: String(formData.get("country") ?? "").trim() || null,
    })
    .eq("id", user.id);

  revalidatePath("/dashboard/settings");
}

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-body">Settings</h1>
        <p className="text-text-secondary">Manage your personal account.</p>
      </header>

      <form action={updateProfileAction}>
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>
              Used to address you across the platform and on certificates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Display name</Label>
                <Input id="display_name" name="display_name" defaultValue={profile.display_name ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={profile.city ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={profile.country ?? ""} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      <Card className="overflow-hidden">
        <span aria-hidden className="block h-1 w-full bg-primary" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Privacy & data
          </CardTitle>
          <CardDescription>
            Manage your PDPA consents, export everything we hold, or delete your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link
            href="/dashboard/privacy"
            className="flex items-center justify-between rounded-md border bg-surface px-4 py-3 hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-extrabold text-body">Export my data</div>
                <div className="text-xs text-text-secondary">
                  JSON archive of every record we hold about you.
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </Link>
          <Link
            href="/dashboard/privacy"
            className="flex items-center justify-between rounded-md border bg-surface px-4 py-3 hover:border-destructive/40"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-4 w-4 text-destructive" />
              <div>
                <div className="text-sm font-extrabold text-body">Delete my account</div>
                <div className="text-xs text-text-secondary">
                  30-day grace period — cancel anytime before then.
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </Link>
          <p className="pt-1 text-xs text-text-muted">
            Read the full{" "}
            <Link href="/pdpa" className="font-semibold text-primary underline-offset-2 hover:underline">
              Privacy &amp; PDPA Notice
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
