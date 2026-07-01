import { compositeMockup } from "@/lib/design/composite-mockup";
import { loadDesignVariant } from "@/lib/design/load-variant";
import { persistSubmissionMockup } from "@/lib/design/persist-mockup";
import { validatePngDimensions } from "@/lib/design/validate-artwork";
import { writeAuditLog } from "@/lib/audit/log";
import {
  extFromSourceFilename,
  isAllowedSourceFile,
  MAX_SOURCE_BYTES,
} from "@/lib/design/source-mime";
import { createAdminClient } from "@/lib/supabase/server";
import {
  PNG_MIME_TYPES,
  randomStorageName,
  uploadSourceFileWithClient,
} from "@/lib/storage/upload";

export type DesignSubmissionInput = {
  campaignId: string;
  submissionId: string;
  actorId?: string | null;
  artworkBuffer: Buffer;
  artworkFileName?: string;
  sourceFile?: File | null;
  variantSlug: string;
  expectedWidth: number | null;
  expectedHeight: number | null;
  uploadPrefix: string;
};

export type DesignSubmissionResult = {
  artworkUrl: string;
  artworkSourceUrl: string | null;
  designVariant: string;
  mockupUrl: string | null;
};

export async function processDesignSubmission(
  input: DesignSubmissionInput,
): Promise<DesignSubmissionResult> {
  const dimCheck = await validatePngDimensions(
    input.artworkBuffer,
    input.expectedWidth,
    input.expectedHeight,
  );
  if (!dimCheck.ok) throw new Error(dimCheck.message);

  const variant = await loadDesignVariant(input.campaignId, input.variantSlug);
  if (!variant) throw new Error("Please choose a product variant.");

  const supabase = createAdminClient();

  const artworkPath = `${input.uploadPrefix}/${randomStorageName(".png")}`;
  const { error: artErr } = await supabase.storage
    .from("artworks")
    .upload(artworkPath, input.artworkBuffer, { contentType: "image/png", upsert: true });
  if (artErr) throw artErr;
  const { data: artPub } = supabase.storage.from("artworks").getPublicUrl(artworkPath);
  const artworkUrl = artPub.publicUrl;

  let artworkSourceUrl: string | null = null;
  if (input.sourceFile && input.sourceFile.size > 0) {
    if (!isAllowedSourceFile(input.sourceFile)) {
      throw new Error("Source file must be .ai, .pdf, .svg, or .eps.");
    }
    if (input.sourceFile.size > MAX_SOURCE_BYTES) {
      throw new Error("Source file must be under 25 MB.");
    }
    artworkSourceUrl = await uploadSourceFileWithClient(
      supabase,
      `${input.uploadPrefix}/sources/${randomStorageName(extFromSourceFilename(input.sourceFile.name) || ".pdf")}`,
      input.sourceFile,
    );
  }

  let mockupUrl: string | null = null;
  try {
    const composite = await compositeMockup({
      mockupUrl: variant.mockup_image_url,
      artworkBuffer: input.artworkBuffer,
      printArea: {
        x: Number(variant.print_area_x),
        y: Number(variant.print_area_y),
        w: Number(variant.print_area_w),
        h: Number(variant.print_area_h),
      },
    });
    mockupUrl = await persistSubmissionMockup(input.submissionId, input.campaignId, composite);
    await writeAuditLog({
      action: "submission.mockup_generated",
      objectType: "submission",
      objectId: input.submissionId,
      actorId: input.actorId ?? null,
      details: { design_variant: input.variantSlug },
    });
  } catch {
    mockupUrl = null;
  }

  await supabase
    .from("submissions")
    .update({
      artwork_url: artworkUrl,
      artwork_source_url: artworkSourceUrl,
      design_variant: input.variantSlug,
      mockup_url: mockupUrl,
    })
    .eq("id", input.submissionId);

  return {
    artworkUrl,
    artworkSourceUrl,
    designVariant: input.variantSlug,
    mockupUrl,
  };
}

export async function uploadDesignArtworkFromFile(opts: {
  file: File;
  uploadPrefix: string;
  expectedWidth: number | null;
  expectedHeight: number | null;
}): Promise<Buffer> {
  if (!PNG_MIME_TYPES.includes(opts.file.type as (typeof PNG_MIME_TYPES)[number])) {
    throw new Error("Design mode requires a PNG artwork file.");
  }
  const buffer = Buffer.from(await opts.file.arrayBuffer());
  const dimCheck = await validatePngDimensions(buffer, opts.expectedWidth, opts.expectedHeight);
  if (!dimCheck.ok) throw new Error(dimCheck.message);
  return buffer;
}
