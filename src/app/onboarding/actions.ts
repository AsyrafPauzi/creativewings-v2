"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { CWRole } from "@/lib/supabase/database.types";

export interface OnboardingState {
  error?: string;
}

const VALID_ROLES = new Set(["contestant", "creator", "organizer"]);

async function ensureUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "organizers" | "creators",
  base: string,
) {
  let slug = base || "user";
  let n = 1;
  while (true) {
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function pickRoleAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const role = String(formData.get("role") ?? "") as CWRole;
  if (!VALID_ROLES.has(role)) {
    return { error: "Choose a valid role." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  redirect("/onboarding/profile");
}

export async function completeProfileAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return { error: "Profile not found." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const countryInput = String(formData.get("country") ?? "").trim();
  const country = countryInput || (profile.role === "contestant" ? "Malaysia" : null);
  const city = String(formData.get("city") ?? "").trim() || null;

  if (!fullName) return { error: "Please enter your name." };

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      display_name: fullName,
      phone,
      country,
      city,
    })
    .eq("id", user.id);
  if (profileUpdateError) return { error: profileUpdateError.message };

  if (profile.role === "organizer") {
    const orgName = String(formData.get("name") ?? "").trim();
    const industry = String(formData.get("industry") ?? "").trim() || null;
    const about = String(formData.get("about") ?? "").trim() || null;
    const website = String(formData.get("website") ?? "").trim() || null;

    if (!orgName) return { error: "Please enter your organization name." };

    const slug = await ensureUniqueSlug(supabase, "organizers", slugify(orgName));
    const { error } = await supabase
      .from("organizers")
      .upsert(
        {
          owner_id: user.id,
          slug,
          name: orgName,
          industry,
          about,
          website,
          email: user.email,
          city,
          country,
          is_listed: false,
        },
        { onConflict: "owner_id" },
      );
    if (error) return { error: error.message };
  } else if (profile.role === "creator") {
    const displayName = String(formData.get("display_name") ?? "").trim() || fullName;
    const tagline = String(formData.get("tagline") ?? "").trim() || null;
    const bio = String(formData.get("bio") ?? "").trim() || null;
    const address = String(formData.get("address") ?? "").trim() || null;

    const slug = await ensureUniqueSlug(supabase, "creators", slugify(displayName));
    const { error } = await supabase
      .from("creators")
      .upsert(
        {
          owner_id: user.id,
          slug,
          display_name: displayName,
          tagline,
          bio,
          address,
          city,
          country,
          is_listed: false,
        },
        { onConflict: "owner_id" },
      );
    if (error) return { error: error.message };
  }

  const { error: onboardError } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.id);
  if (onboardError) return { error: onboardError.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
