import { createClient } from "@/lib/supabase/server";

export type DesignVariantInput = {
  slug: string;
  label: string;
  swatch_color?: string | null;
  size_label?: string | null;
  mockup_image_url: string;
  print_area_x: number;
  print_area_y: number;
  print_area_w: number;
  print_area_h: number;
  sort_order: number;
  is_active?: boolean;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function syncDesignVariants(
  supabase: SupabaseServerClient,
  campaignId: string,
  variants: DesignVariantInput[],
) {
  const { error: delErr } = await supabase
    .from("design_variants")
    .delete()
    .eq("campaign_id", campaignId);
  if (delErr) throw new Error(delErr.message);

  if (variants.length === 0) return;

  const rows = variants.map((v) => ({
    campaign_id: campaignId,
    slug: v.slug,
    label: v.label,
    swatch_color: v.swatch_color ?? null,
    size_label: v.size_label ?? null,
    mockup_image_url: v.mockup_image_url,
    print_area_x: v.print_area_x,
    print_area_y: v.print_area_y,
    print_area_w: v.print_area_w,
    print_area_h: v.print_area_h,
    sort_order: v.sort_order,
    is_active: v.is_active ?? true,
  }));

  const { error: insErr } = await supabase.from("design_variants").insert(rows);
  if (insErr) throw new Error(insErr.message);
}
