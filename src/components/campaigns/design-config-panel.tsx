"use client";

import { useActionState, useState } from "react";

import {
  saveDesignConfigAction,
  uploadVariantMockupAction,
  type DesignFormState,
} from "@/app/dashboard/campaigns/design-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DesignVariantRow } from "@/lib/supabase/database.types";
import { slugify } from "@/lib/utils";

const initial: DesignFormState = {};

type VariantDraft = {
  slug: string;
  label: string;
  swatch_color: string;
  size_label: string;
  mockup_image_url: string;
  print_area_x: number;
  print_area_y: number;
  print_area_w: number;
  print_area_h: number;
  sort_order: number;
  is_active: boolean;
};

function toDraft(row: DesignVariantRow): VariantDraft {
  return {
    slug: row.slug,
    label: row.label,
    swatch_color: row.swatch_color ?? "#cccccc",
    size_label: row.size_label ?? "",
    mockup_image_url: row.mockup_image_url,
    print_area_x: Number(row.print_area_x),
    print_area_y: Number(row.print_area_y),
    print_area_w: Number(row.print_area_w),
    print_area_h: Number(row.print_area_h),
    sort_order: row.sort_order,
    is_active: row.is_active,
  };
}

const emptyVariant = (): VariantDraft => ({
  slug: "",
  label: "",
  swatch_color: "#1a1a1a",
  size_label: "",
  mockup_image_url: "",
  print_area_x: 22,
  print_area_y: 18,
  print_area_w: 56,
  print_area_h: 64,
  sort_order: 0,
  is_active: true,
});

export function DesignConfigPanel({
  campaignId,
  variants: initialVariants,
}: {
  campaignId: string;
  variants: DesignVariantRow[];
}) {
  const saveAction = saveDesignConfigAction.bind(null, campaignId);
  const uploadAction = uploadVariantMockupAction.bind(null, campaignId);
  const [state, formAction, pending] = useActionState(saveAction, initial);
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialVariants.length ? initialVariants.map(toDraft) : [emptyVariant()],
  );
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  async function handleMockupUpload(idx: number, file: File) {
    setUploadingIdx(idx);
    const fd = new FormData();
    fd.set("mockup_file", file);
    const result = await uploadAction(initial, fd);
    setUploadingIdx(null);
    if (result.url) {
      setVariants((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], mockup_image_url: result.url! };
        return next;
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design variants</CardTitle>
        <CardDescription>
          Product mockups, print areas, and swatches for the design submission flow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="variants_json" value={JSON.stringify(variants)} readOnly />

          {variants.map((v, idx) => (
            <div key={idx} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Variant {idx + 1}</span>
                {variants.length > 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={v.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setVariants((prev) => {
                        const next = [...prev];
                        next[idx] = {
                          ...next[idx],
                          label,
                          slug: next[idx].slug || slugify(label),
                        };
                        return next;
                      });
                    }}
                    placeholder="Black case"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={v.slug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setVariants((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], slug };
                        return next;
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Swatch color</Label>
                  <Input
                    type="color"
                    value={v.swatch_color}
                    onChange={(e) => {
                      const swatch_color = e.target.value;
                      setVariants((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], swatch_color };
                        return next;
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size label (optional)</Label>
                  <Input
                    value={v.size_label}
                    onChange={(e) => {
                      const size_label = e.target.value;
                      setVariants((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], size_label };
                        return next;
                      });
                    }}
                    placeholder="iPhone 15 Pro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(["print_area_x", "print_area_y", "print_area_w", "print_area_h"] as const).map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] uppercase">{key.replace("print_area_", "")} %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={v[key]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setVariants((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], [key]: val };
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Mockup image</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingIdx === idx}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleMockupUpload(idx, file);
                  }}
                />
                {v.mockup_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.mockup_image_url}
                    alt=""
                    className="mt-2 h-24 w-auto rounded border object-contain"
                  />
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.is_active}
                  onChange={(e) => {
                    const is_active = e.target.checked;
                    setVariants((prev) => {
                      const next = [...prev];
                      next[idx] = { ...next[idx], is_active };
                      return next;
                    });
                  }}
                />
                Active
              </label>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { ...emptyVariant(), sort_order: prev.length },
              ])
            }
          >
            Add variant
          </Button>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save design variants"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
