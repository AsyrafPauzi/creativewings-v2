"use server";

import { createAdminClient } from "@/lib/supabase/server";
import {
  ARTWORK_MIME_TYPES,
  extFromMime,
  randomStorageName,
  uploadPublicFile,
} from "@/lib/storage/upload";
import { processDesignSubmission, uploadDesignArtworkFromFile } from "@/lib/design/process-submission";
import { loadActiveDesignVariants } from "@/lib/design/load-variant";
import { allocateSubmissionCode } from "@/lib/schools/submission-code";
import { validateUploadToken } from "@/lib/schools/validate-upload-token";
import type { CustomFieldRow } from "@/lib/supabase/database.types";

export interface PicUploadState {
  error?: string;
  success?: string;
  submissionCode?: string;
  mockupUrl?: string;
}

async function collectFieldData(
  formData: FormData,
  customFields: CustomFieldRow[],
  uploadPrefix: string,
): Promise<Record<string, string>> {
  const fieldData: Record<string, string> = {};

  for (const field of customFields) {
    const name = `custom_field_${field.id}`;

    if (field.field_type === "file") {
      const file = formData.get(name);
      if (file instanceof File && file.size > 0) {
        const ext = extFromMime(file.type) || ".jpg";
        fieldData[field.id] = await uploadPublicFile({
          bucket: "artworks",
          path: `${uploadPrefix}/${randomStorageName(ext)}`,
          file,
          allowedTypes: ARTWORK_MIME_TYPES,
        });
      } else if (field.required) {
        throw new Error(`"${field.label}" is required.`);
      }
      continue;
    }

    if (field.field_type === "checkbox") {
      const checked = formData.get(name) === "yes";
      if (field.required && !checked) {
        throw new Error(`"${field.label}" is required.`);
      }
      if (checked) fieldData[field.id] = "yes";
      continue;
    }

    const value = String(formData.get(name) ?? "").trim();
    if (field.required && !value) {
      throw new Error(`"${field.label}" is required.`);
    }
    if (value) fieldData[field.id] = value;
  }

  return fieldData;
}

export async function picUploadAction(
  token: string,
  _prev: PicUploadState,
  formData: FormData,
): Promise<PicUploadState> {
  const ctx = await validateUploadToken(token);
  if (!ctx) return { error: "This upload link is invalid or expired." };

  const { school, campaign } = ctx;
  const supabase = createAdminClient();

  const { data: customFields } = await supabase
    .from("custom_fields")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("sort_order");

  const studentName = String(formData.get("student_name") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim() || null;
  const guardianContact = String(formData.get("guardian_contact") ?? "").trim() || null;
  const guardianEmail = String(formData.get("guardian_email") ?? "").trim() || null;
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? parseInt(ageRaw, 10) : null;
  const ageBracketId = String(formData.get("age_bracket_id") ?? "").trim() || null;

  if (!studentName) return { error: "Please enter the student's name." };

  const artworkFile = formData.get("artwork_file");
  const sourceFile = formData.get("source_file");
  const variantSlug = String(formData.get("design_variant") ?? "").trim();
  const designVariants =
    campaign.enable_design ? await loadActiveDesignVariants(campaign.id) : [];
  const designMode = campaign.enable_design && designVariants.length > 0;

  let artworkUrl: string | null = null;
  let artworkBuffer: Buffer | null = null;

  if (designMode) {
    if (!(artworkFile instanceof File) || artworkFile.size === 0) {
      return { error: "Please upload the student's PNG artwork." };
    }
    if (!variantSlug) return { error: "Please choose a product variant." };
    try {
      artworkBuffer = await uploadDesignArtworkFromFile({
        file: artworkFile,
        uploadPrefix: `${campaign.id}/school/${school.id}`,
        expectedWidth: campaign.design_artwork_w,
        expectedHeight: campaign.design_artwork_h,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
  } else if (artworkFile instanceof File && artworkFile.size > 0) {
    const ext = extFromMime(artworkFile.type) || ".jpg";
    artworkUrl = await uploadPublicFile({
      bucket: "artworks",
      path: `${campaign.id}/school/${school.id}/${randomStorageName(ext)}`,
      file: artworkFile,
      allowedTypes: ARTWORK_MIME_TYPES,
    });
  }

  if (!artworkUrl && !artworkBuffer && campaign.enable_design) {
    return { error: "Please upload the student's artwork." };
  }

  let fieldData: Record<string, string> = {};
  try {
    fieldData = await collectFieldData(
      formData,
      customFields ?? [],
      `${campaign.id}/school/${school.id}`,
    );
  } catch (e) {
    return { error: (e as Error).message };
  }

  let codes;
  try {
    codes = await allocateSubmissionCode(campaign.id, school.school_code);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: inserted, error } = await supabase.from("submissions").insert({
    campaign_id: campaign.id,
    school_id: school.id,
    school_code: codes.school_code,
    month_code: codes.month_code,
    seq_code: codes.seq_code,
    submission_code: codes.submission_code,
    student_name: studentName,
    guardian_name: guardianName,
    guardian_contact: guardianContact,
    guardian_email: guardianEmail,
    age,
    age_bracket_id: ageBracketId,
    artwork_url: artworkUrl,
    design_variant: designMode ? variantSlug : null,
    field_data: fieldData,
    status: "staged",
    moderation_status: "pending",
    contestant_id: null,
  }).select("id").single();

  if (error || !inserted) return { error: error?.message ?? "Upload failed." };

  let mockupUrl: string | null = null;
  if (designMode && artworkBuffer) {
    try {
      const designResult = await processDesignSubmission({
        campaignId: campaign.id,
        submissionId: inserted.id,
        artworkBuffer,
        sourceFile: sourceFile instanceof File ? sourceFile : null,
        variantSlug,
        expectedWidth: campaign.design_artwork_w,
        expectedHeight: campaign.design_artwork_h,
        uploadPrefix: `${campaign.id}/school/${school.id}`,
      });
      mockupUrl = designResult.mockupUrl;
    } catch (e) {
      await supabase.from("submissions").delete().eq("id", inserted.id);
      return { error: (e as Error).message };
    }
  }

  return {
    success: "Artwork uploaded successfully.",
    submissionCode: codes.submission_code,
    mockupUrl: mockupUrl ?? undefined,
  };
}
