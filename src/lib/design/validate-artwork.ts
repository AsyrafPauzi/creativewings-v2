import sharp from "sharp";

export async function validatePngDimensions(
  buffer: Buffer,
  expectedW: number | null,
  expectedH: number | null,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!expectedW || !expectedH) return { ok: true };

  const meta = await sharp(buffer).metadata();
  if (meta.width !== expectedW || meta.height !== expectedH) {
    return {
      ok: false,
      message: `Artwork must be exactly ${expectedW}×${expectedH}px (got ${meta.width ?? "?"}×${meta.height ?? "?"}).`,
    };
  }
  return { ok: true };
}
