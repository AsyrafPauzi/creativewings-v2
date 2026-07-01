"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { extFromMime, randomStorageName, uploadPublicFile } from "@/lib/storage/upload";

export interface OrganizerMediaState {
  error?: string;
  success?: string;
}

export async function uploadOrganizerMediaAction(
  _prev: OrganizerMediaState,
  formData: FormData,
): Promise<OrganizerMediaState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in." };

    const { data: org } = await supabase
      .from("organizers")
      .select("id, slug")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (!org) return { error: "Save your organization profile first." };

    const updates: Record<string, string> = {};
    const logoFile = formData.get("logo_file");
    const bannerFile = formData.get("banner_file");

    if (logoFile instanceof File && logoFile.size > 0) {
      const ext = extFromMime(logoFile.type) || ".jpg";
      updates.logo_url = await uploadPublicFile({
        bucket: "logos",
        path: `${org.id}/${randomStorageName(ext)}`,
        file: logoFile,
      });
    }
    if (bannerFile instanceof File && bannerFile.size > 0) {
      const ext = extFromMime(bannerFile.type) || ".jpg";
      updates.banner_url = await uploadPublicFile({
        bucket: "banners",
        path: `${org.id}/${randomStorageName(ext)}`,
        file: bannerFile,
      });
    }

    if (Object.keys(updates).length === 0) {
      return { error: "Choose a logo or banner image to upload." };
    }

    const { error } = await supabase.from("organizers").update(updates).eq("id", org.id);
    if (error) return { error: error.message };

    revalidatePath("/dashboard/organizer");
    revalidatePath("/organizers");
    revalidatePath(`/organizer/${org.slug}`);
    return { success: "Images updated." };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
