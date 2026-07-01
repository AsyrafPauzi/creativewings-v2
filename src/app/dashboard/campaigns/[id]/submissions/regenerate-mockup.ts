"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { compositeMockup } from "@/lib/design/composite-mockup";
import { loadDesignVariant } from "@/lib/design/load-variant";
import { persistSubmissionMockup } from "@/lib/design/persist-mockup";
import { writeAuditLog } from "@/lib/audit/log";
import { requireRole } from "@/lib/auth";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function regenerateMockupAction(campaignId: string, submissionId: string) {
  await requireRole("organizer");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("submissions")
    .select("id, artwork_url, design_variant, campaign_id")
    .eq("id", submissionId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (!sub?.artwork_url || !sub.design_variant) {
    return { error: "Submission needs artwork and a design variant." };
  }

  const variant = await loadDesignVariant(campaignId, sub.design_variant);
  if (!variant) return { error: "Design variant not found." };

  const artRes = await fetch(sub.artwork_url);
  if (!artRes.ok) return { error: "Could not load artwork." };
  const artworkBuffer = Buffer.from(await artRes.arrayBuffer());

  const composite = await compositeMockup({
    mockupUrl: variant.mockup_image_url,
    artworkBuffer,
    printArea: {
      x: Number(variant.print_area_x),
      y: Number(variant.print_area_y),
      w: Number(variant.print_area_w),
      h: Number(variant.print_area_h),
    },
  });

  const mockupUrl = await persistSubmissionMockup(submissionId, campaignId, composite);

  await writeAuditLog({
    action: "submission.mockup_regenerated",
    objectType: "submission",
    objectId: submissionId,
    actorId: user.id,
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}/submissions/${submissionId}`);
  return { mockupUrl };
}
