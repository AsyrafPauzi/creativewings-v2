import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { CWRole } from "@/lib/supabase/database.types";

export type LoadedSession = {
  user: { id: string; email: string };
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    role: CWRole;
    is_admin: boolean;
    onboarded_at: string | null;
  };
};

export async function requireUser(): Promise<LoadedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, display_name, avatar_url, role, is_admin, onboarded_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");
  if (!profile.onboarded_at) redirect("/onboarding");

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile,
  };
}

export async function requireRole(...roles: CWRole[]): Promise<LoadedSession> {
  const session = await requireUser();
  if (session.profile.is_admin) return session;
  if (!roles.includes(session.profile.role)) {
    redirect("/dashboard");
  }
  return session;
}
