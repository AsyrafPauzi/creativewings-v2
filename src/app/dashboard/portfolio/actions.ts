"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export interface PortfolioFormState {
  error?: string;
  ok?: boolean;
}

function toBool(value: FormDataEntryValue | null) {
  if (value === null) return false;
  const v = String(value).toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

function toArrayInts(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

function toArrayStrings(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function getOwnedCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!creator) throw new Error("Creator profile required.");
  return { supabase, user, creatorId: creator.id };
}

async function ensureProjectSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  creatorId: string,
  base: string,
  ignoreId?: string,
) {
  let slug = base || "project";
  let n = 1;
  while (true) {
    const q = supabase
      .from("portfolio_projects")
      .select("id")
      .eq("creator_id", creatorId)
      .eq("slug", slug);
    const { data } = await (ignoreId ? q.neq("id", ignoreId) : q).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function createProjectAction(
  _prev: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  try {
    const { supabase, creatorId } = await getOwnedCreator();
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Please enter a project title." };

    const slug = await ensureProjectSlug(supabase, creatorId, slugify(title));

    const payload = {
      creator_id: creatorId,
      slug,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      cover_url: String(formData.get("cover_url") ?? "").trim() || null,
      tools: toArrayStrings(formData.get("tools")),
      tags: toArrayStrings(formData.get("tags")),
      sdg_goals: toArrayInts(formData.get("sdg_goals")),
      external_url: String(formData.get("external_url") ?? "").trim() || null,
      is_published: toBool(formData.get("is_published")),
      published_at: toBool(formData.get("is_published")) ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert(payload)
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/dashboard/portfolio");
    redirect(`/dashboard/portfolio/${data.id}`);
  } catch (e) {
    const err = e as Error;
    if (err.message === "NEXT_REDIRECT") throw e;
    return { error: err.message };
  }
}

export async function updateProjectAction(
  projectId: string,
  _prev: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  const { supabase } = await getOwnedCreator();

  const isPublished = toBool(formData.get("is_published"));

  const { data: existing } = await supabase
    .from("portfolio_projects")
    .select("published_at, is_published")
    .eq("id", projectId)
    .maybeSingle();

  const published_at = isPublished
    ? existing?.published_at ?? new Date().toISOString()
    : null;

  const payload = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    tools: toArrayStrings(formData.get("tools")),
    tags: toArrayStrings(formData.get("tags")),
    sdg_goals: toArrayInts(formData.get("sdg_goals")),
    external_url: String(formData.get("external_url") ?? "").trim() || null,
    is_published: isPublished,
    published_at,
  };

  const { error } = await supabase
    .from("portfolio_projects")
    .update(payload)
    .eq("id", projectId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/portfolio");
  revalidatePath(`/dashboard/portfolio/${projectId}`);
  return { ok: true };
}

export async function addProjectAssetAction(
  projectId: string,
  formData: FormData,
) {
  const { supabase } = await getOwnedCreator();
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  await supabase.from("portfolio_project_assets").insert({
    project_id: projectId,
    asset_type: String(formData.get("asset_type") ?? "image"),
    url,
    caption: String(formData.get("caption") ?? "").trim() || null,
    sort_order: parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0,
  });
  revalidatePath(`/dashboard/portfolio/${projectId}`);
}

export async function deleteProjectAssetAction(
  projectId: string,
  assetId: string,
) {
  const { supabase } = await getOwnedCreator();
  await supabase.from("portfolio_project_assets").delete().eq("id", assetId);
  revalidatePath(`/dashboard/portfolio/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  const { supabase } = await getOwnedCreator();
  await supabase.from("portfolio_projects").delete().eq("id", projectId);
  revalidatePath("/dashboard/portfolio");
  redirect("/dashboard/portfolio");
}
