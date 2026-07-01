export const PNG_MIME_TYPES = ["image/png"] as const;

export const SOURCE_MIME_TYPES = [
  "application/pdf",
  "image/svg+xml",
  "application/postscript",
  "application/illustrator",
  "application/octet-stream",
] as const;

export const SOURCE_EXTENSIONS = [".pdf", ".svg", ".eps", ".ai"] as const;

export const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export function extFromSourceFilename(name: string) {
  const lower = name.toLowerCase();
  for (const ext of SOURCE_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext;
  }
  return "";
}

export function isAllowedSourceFile(file: File) {
  const ext = extFromSourceFilename(file.name);
  if (!ext) return false;
  if (SOURCE_MIME_TYPES.includes(file.type as (typeof SOURCE_MIME_TYPES)[number])) return true;
  // Some browsers send empty or generic MIME for .ai/.eps
  return file.type === "" || file.type === "application/octet-stream";
}
