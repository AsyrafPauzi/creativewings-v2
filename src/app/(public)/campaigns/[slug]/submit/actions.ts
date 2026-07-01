"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { processDesignSubmission, uploadDesignArtworkFromFile } from "@/lib/design/process-submission";
import { loadActiveDesignVariants } from "@/lib/design/load-variant";
import { startCommercePayCheckout } from "@/lib/payments/create-checkout";
import { validateCoupon } from "@/lib/payments/coupons";
import { fulfillFreeSubmission } from "@/lib/payments/fulfill-order";
import { createClient } from "@/lib/supabase/server";
import {
  ARTWORK_MIME_TYPES,
  extFromMime,
  randomStorageName,
  uploadPublicFile,
} from "@/lib/storage/upload";
import type { CustomFieldRow } from "@/lib/supabase/database.types";

export interface SubmissionState {
  error?: string;
  success?: string;
  redirect?: string;
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

export async function submitEntryAction(
  campaignSlug: string,
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/sign-in?next=/campaigns/${campaignSlug}/submit`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, display_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, title, slug, status, entry_fee, currency, allow_multiple_submissions, enable_checkout_message, checkout_message_required, enable_design, design_artwork_w, design_artwork_h",
    )
    .eq("slug", campaignSlug)
    .maybeSingle();

  if (!campaign || campaign.status !== "published") {
    return { error: "This campaign is not accepting submissions right now." };
  }

  if (!campaign.allow_multiple_submissions) {
    const { count } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("contestant_id", user.id);
    if ((count ?? 0) > 0) {
      return { error: "You have already submitted to this campaign." };
    }
  }

  const { data: customFields } = await supabase
    .from("custom_fields")
    .select("*")
    .eq("campaign_id", campaign.id)
    .order("sort_order");

  const studentName = String(formData.get("student_name") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim() || null;
  const guardianContact = String(formData.get("guardian_contact") ?? "").trim() || null;
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = ageRaw ? parseInt(ageRaw, 10) : null;
  const artworkUrlInput = String(formData.get("artwork_url") ?? "").trim() || null;
  const checkoutMessage =
    String(formData.get("checkout_message") ?? "").trim() || null;
  const ageBracketId =
    String(formData.get("age_bracket_id") ?? "").trim() || null;
  const couponCode = String(formData.get("coupon_code") ?? "").trim() || null;

  if (!studentName) return { error: "Please enter the participant's name." };

  if (
    campaign.enable_checkout_message &&
    campaign.checkout_message_required &&
    !checkoutMessage
  ) {
    return { error: "Please add the required message." };
  }

  let coupon: Awaited<ReturnType<typeof validateCoupon>> = null;
  try {
    coupon = await validateCoupon(couponCode, campaign.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  let artworkUrl = artworkUrlInput;
  let artworkBuffer: Buffer | null = null;
  const artworkFile = formData.get("artwork_file");
  const sourceFile = formData.get("source_file");
  const variantSlug = String(formData.get("design_variant") ?? "").trim();
  const designVariants =
    campaign.enable_design ? await loadActiveDesignVariants(campaign.id) : [];
  const designMode = campaign.enable_design && designVariants.length > 0;

  if (designMode) {
    if (!(artworkFile instanceof File) || artworkFile.size === 0) {
      return { error: "Please upload your PNG artwork." };
    }
    if (!variantSlug) return { error: "Please choose a product variant." };
    try {
      artworkBuffer = await uploadDesignArtworkFromFile({
        file: artworkFile,
        uploadPrefix: `${campaign.id}/${user.id}`,
        expectedWidth: campaign.design_artwork_w,
        expectedHeight: campaign.design_artwork_h,
      });
    } catch (e) {
      return { error: (e as Error).message };
    }
    artworkUrl = null;
  } else if (artworkFile instanceof File && artworkFile.size > 0) {
    const ext = extFromMime(artworkFile.type) || ".jpg";
    artworkUrl = await uploadPublicFile({
      bucket: "artworks",
      path: `${campaign.id}/${user.id}/${randomStorageName(ext)}`,
      file: artworkFile,
      allowedTypes: ARTWORK_MIME_TYPES,
    });
  }

  if (!artworkUrl && !artworkBuffer && campaign.enable_design) {
    return { error: "Please upload your artwork or provide a link." };
  }

  let fieldData: Record<string, string> = {};
  try {
    fieldData = await collectFieldData(
      formData,
      customFields ?? [],
      `${campaign.id}/${user.id}`,
    );
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: submission, error } = await supabase
    .from("submissions")
    .insert({
      campaign_id: campaign.id,
      contestant_id: user.id,
      age_bracket_id: ageBracketId,
      student_name: studentName,
      guardian_name: guardianName,
      guardian_contact: guardianContact,
      age,
      artwork_url: artworkUrl,
      design_variant: designMode ? variantSlug : null,
      checkout_message: checkoutMessage,
      field_data: fieldData,
      status: "claimed",
      moderation_status: "pending",
      sponsor_coupon_id: coupon?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !submission) return { error: error?.message ?? "Could not save submission." };

  let mockupUrl: string | null = null;
  if (designMode && artworkBuffer) {
    try {
      const designResult = await processDesignSubmission({
        campaignId: campaign.id,
        submissionId: submission.id,
        actorId: user.id,
        artworkBuffer,
        sourceFile: sourceFile instanceof File ? sourceFile : null,
        variantSlug,
        expectedWidth: campaign.design_artwork_w,
        expectedHeight: campaign.design_artwork_h,
        uploadPrefix: `${campaign.id}/${user.id}`,
      });
      mockupUrl = designResult.mockupUrl;
    } catch (e) {
      await supabase.from("submissions").delete().eq("id", submission.id);
      return { error: (e as Error).message };
    }
  }

  revalidatePath(`/campaigns/${campaignSlug}`);
  revalidatePath("/dashboard");

  const fee = Number(campaign.entry_fee ?? 0);
  const isFree = fee <= 0 || coupon?.coversFullFee;

  if (isFree) {
    await fulfillFreeSubmission({
      submissionId: submission.id,
      campaignId: campaign.id,
      userId: user.id,
      couponId: coupon?.id,
    });
    return {
      success: "Entry confirmed — no payment required.",
      mockupUrl: mockupUrl ?? undefined,
    };
  }

  try {
    const redirectUrl = await startCommercePayCheckout({
      submissionId: submission.id,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      userId: user.id,
      userEmail: profile?.email ?? user.email ?? "",
      userName: profile?.full_name || profile?.display_name || studentName,
      userPhone: profile?.phone ?? guardianContact ?? "",
      amount: fee,
      currency: campaign.currency ?? "MYR",
      couponId: coupon?.id,
    });
    return { redirect: redirectUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
