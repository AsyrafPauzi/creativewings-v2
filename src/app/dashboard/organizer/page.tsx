import { revalidatePath } from "next/cache";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export const metadata = { title: "Organisation" };

async function updateOrganizerAction(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const businessName = String(formData.get("business_name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const about = String(formData.get("about") ?? "").trim() || null;
  const website = String(formData.get("website") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const isListed = formData.get("is_listed") === "on";

  if (!businessName) return;

  await supabase
    .from("organizers")
    .upsert(
      {
        owner_id: user.id,
        slug: slugify(businessName) || user.id,
        business_name: businessName,
        industry,
        about,
        website,
        phone,
        email,
        city,
        country,
        is_listed: isListed,
      },
      { onConflict: "owner_id" },
    );

  revalidatePath("/dashboard/organizer");
  revalidatePath("/organizers");
}

export default async function DashboardOrganizerPage() {
  const { user } = await requireRole("business");
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizers")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your organisation</h1>
          <p className="text-muted-foreground">
            This information powers your public organiser page.
          </p>
        </div>
        {org && (
          <Button asChild variant="outline">
            <Link href={`/organizer/${org.slug}`}>View public page</Link>
          </Button>
        )}
      </header>

      <form action={updateOrganizerAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Public profile</CardTitle>
            <CardDescription>
              Required fields are needed before your organisation is listed publicly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business_name">Organisation name *</Label>
                <Input id="business_name" name="business_name" defaultValue={org?.business_name ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" defaultValue={org?.industry ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="about">About</Label>
              <Textarea id="about" name="about" rows={5} defaultValue={org?.about ?? ""} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" defaultValue={org?.website ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact email</Label>
                <Input id="email" name="email" type="email" defaultValue={org?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={org?.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={org?.city ?? ""} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={org?.country ?? "Malaysia"} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Directory listing</CardTitle>
            <CardDescription>
              Listed organisations appear at /organizers. Toggle off to hide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Show in the public directory</div>
                <div className="text-xs text-muted-foreground">
                  {org?.is_verified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    "Unverified — add a logo, description and contact info to qualify."
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                name="is_listed"
                defaultChecked={!!org?.is_listed}
                className="h-4 w-4"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="brand" size="lg">Save changes</Button>
        </div>
      </form>
    </div>
  );
}
