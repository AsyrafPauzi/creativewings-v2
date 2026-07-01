import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  MAX_SOURCE_BYTES,
  isAllowedSourceFile,
} from "@/lib/design/source-mime";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PNG_MIME_TYPES = ["image/png"] as const;
export const ARTWORK_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"];

export function randomStorageName(ext: string) {
  return `${crypto.randomUUID()}${ext.startsWith(".") ? ext : `.${ext}`}`;
}

export function extFromMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "application/pdf") return ".pdf";
  return "";
}

type StorageBucket = "banners" | "logos" | "artworks" | "mockups";

export async function uploadPublicFileWithClient(
  supabase: SupabaseClient,
  opts: {
    bucket: StorageBucket;
    path: string;
    buffer: Buffer;
    contentType: string;
  },
) {
  const { error } = await supabase.storage
    .from(opts.bucket)
    .upload(opts.path, opts.buffer, { contentType: opts.contentType, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(opts.bucket).getPublicUrl(opts.path);
  return data.publicUrl;
}

export async function uploadSourceFileWithClient(
  supabase: SupabaseClient,
  path: string,
  file: File,
) {
  if (!isAllowedSourceFile(file)) {
    throw new Error("Unsupported source file type.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("Source file must be under 25 MB.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("artworks")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("artworks").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPublicFile(opts: {
  bucket: "banners" | "logos" | "artworks";
  path: string;
  file: File;
  allowedTypes?: string[];
}) {
  const supabase = await createClient();
  const allowed = opts.allowedTypes ?? IMAGE_MIME_TYPES;
  if (!allowed.includes(opts.file.type)) {
    throw new Error("Unsupported file type.");
  }
  if (opts.file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File must be under 10 MB.");
  }

  const buffer = Buffer.from(await opts.file.arrayBuffer());
  return uploadPublicFileWithClient(supabase, {
    bucket: opts.bucket,
    path: opts.path,
    buffer,
    contentType: opts.file.type,
  });
}
