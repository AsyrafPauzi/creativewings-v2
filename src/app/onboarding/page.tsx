import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PickRoleForm } from "./pick-role-form";

export const metadata = { title: "Welcome to Creative Wings" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarded_at) redirect("/dashboard");

  const intendedRole =
    (user.user_metadata?.intended_role as string | undefined) ?? profile?.role ?? "contestant";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Creative Wings</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us how you&apos;d like to use the platform.
        </p>
      </div>
      <div className="mt-10">
        <PickRoleForm intendedRole={intendedRole} />
      </div>
    </div>
  );
}
