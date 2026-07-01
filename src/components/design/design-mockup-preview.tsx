"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { DesignVariantRow } from "@/lib/supabase/database.types";

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

export function DesignMockupPreview({
  variants,
  pickerLabel,
  artworkFile,
  selectedSlug,
  onVariantChange,
  expectedWidth,
  expectedHeight,
}: {
  variants: DesignVariantRow[];
  pickerLabel?: string | null;
  artworkFile: File | null;
  selectedSlug: string | null;
  onVariantChange: (slug: string) => void;
  expectedWidth?: number | null;
  expectedHeight?: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimError, setDimError] = useState<string | null>(null);

  const selected = variants.find((v) => v.slug === selectedSlug) ?? variants[0] ?? null;

  useEffect(() => {
    if (!artworkFile || !expectedWidth || !expectedHeight) {
      setDimError(null);
      return;
    }
    readImageDimensions(artworkFile)
      .then(({ width, height }) => {
        if (width !== expectedWidth || height !== expectedHeight) {
          setDimError(`Expected ${expectedWidth}×${expectedHeight}px — this file is ${width}×${height}px.`);
        } else {
          setDimError(null);
        }
      })
      .catch(() => setDimError(null));
  }, [artworkFile, expectedWidth, expectedHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selected) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mockupImg = new Image();
    mockupImg.crossOrigin = "anonymous";
    mockupImg.onload = () => {
      canvas.width = mockupImg.naturalWidth;
      canvas.height = mockupImg.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(mockupImg, 0, 0);

      if (!artworkFile) return;

      const artImg = new Image();
      artImg.onload = () => {
        const w = canvas.width;
        const h = canvas.height;
        const x = (Number(selected.print_area_x) / 100) * w;
        const y = (Number(selected.print_area_y) / 100) * h;
        const pw = (Number(selected.print_area_w) / 100) * w;
        const ph = (Number(selected.print_area_h) / 100) * h;
        ctx.drawImage(artImg, x, y, pw, ph);
      };
      artImg.src = URL.createObjectURL(artworkFile);
    };
    mockupImg.src = selected.mockup_image_url;
  }, [selected, artworkFile]);

  if (variants.length === 0) {
    return (
      <p className="text-sm text-destructive">
        This campaign has design mode enabled but no product variants are configured yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-body">
          {pickerLabel || "Choose your product"}
        </p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.slug}
              type="button"
              onClick={() => onVariantChange(v.slug)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                (selectedSlug ?? variants[0]?.slug) === v.slug
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50",
              )}
            >
              <span
                className="h-8 w-8 rounded-full border"
                style={{ backgroundColor: v.swatch_color ?? "#e5e7eb" }}
              />
              <span>{v.label}</span>
              {v.size_label ? (
                <span className="text-[10px] text-text-muted">{v.size_label}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {expectedWidth && expectedHeight ? (
        <p className="text-xs text-text-secondary">
          Upload PNG exactly {expectedWidth}×{expectedHeight}px
        </p>
      ) : null}

      {dimError ? <p className="text-sm text-destructive">{dimError}</p> : null}

      <div className="overflow-hidden rounded-md border bg-surface">
        <canvas ref={canvasRef} className="mx-auto max-h-[420px] w-full object-contain" />
      </div>

      <input type="hidden" name="design_variant" value={selectedSlug ?? selected?.slug ?? ""} />
    </div>
  );
}
