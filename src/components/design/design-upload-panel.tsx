"use client";

import { useState } from "react";

import { DesignMockupPreview } from "@/components/design/design-mockup-preview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DesignVariantRow } from "@/lib/supabase/database.types";

export function DesignUploadPanel({
  variants,
  pickerLabel,
  expectedWidth,
  expectedHeight,
}: {
  variants: DesignVariantRow[];
  pickerLabel?: string | null;
  expectedWidth?: number | null;
  expectedHeight?: number | null;
}) {
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(variants[0]?.slug ?? null);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="artwork_file">Artwork (PNG)</Label>
        <Input
          id="artwork_file"
          name="artwork_file"
          type="file"
          accept="image/png"
          required
          onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_file">Source file (optional)</Label>
        <Input
          id="source_file"
          name="source_file"
          type="file"
          accept=".ai,.pdf,.svg,.eps,application/pdf,image/svg+xml"
        />
        <p className="text-xs text-text-muted">Vector or print-ready file: .ai, .pdf, .svg, or .eps</p>
      </div>

      <DesignMockupPreview
        variants={variants}
        pickerLabel={pickerLabel}
        artworkFile={artworkFile}
        selectedSlug={selectedSlug}
        onVariantChange={setSelectedSlug}
        expectedWidth={expectedWidth}
        expectedHeight={expectedHeight}
      />
    </div>
  );
}
