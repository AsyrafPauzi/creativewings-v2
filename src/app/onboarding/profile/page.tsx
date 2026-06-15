import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = { title: "Complete your profile" };

export default async function OnboardingProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, display_name, phone, country, city, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role || profile.role === "admin") redirect("/onboarding");
  if (profile.onboarded_at) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Complete your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Just a few details to get you started.
        </p>
      </div>
      <div className="mt-10">
        <CompleteProfileForm
          role={profile.role as "contestant" | "creator" | "business"}
          defaults={{
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            country: profile.country ?? "",
            city: profile.city ?? "",
          }}
        />
      </div>
    </div>
  );
}
