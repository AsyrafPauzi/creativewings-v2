import type { SubCategoryRow } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Fetch the full sub-category catalogue. Centralised so callers across
 * the dashboard and public site share one query shape and ordering.
 */
export async function loadSubCategories(): Promise<SubCategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sub_categories")
    .select("slug, label_en, label_zh, icon, description_en, description_zh, applicable_types, sort_order, created_at")
    .order("sort_order", { ascending: true });
  return (data ?? []) as SubCategoryRow[];
}
