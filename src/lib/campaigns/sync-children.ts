import type { CWFieldType } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type PrizeInput = {
  title: string;
  description?: string;
  rank?: number | null;
  sort_order: number;
};

export type FaqInput = {
  question: string;
  answer: string;
  sort_order: number;
};

export type AgeBracketInput = {
  key: string;
  label: string;
  min_age: number;
  max_age: number;
  sort_order: number;
};

export type CustomFieldInput = {
  label: string;
  field_type: CWFieldType;
  options?: string | null;
  required: boolean;
  sort_order: number;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function replaceRows(
  supabase: SupabaseServerClient,
  table: "prizes" | "faq_items" | "age_brackets" | "custom_fields",
  campaignId: string,
  rows: Record<string, unknown>[],
) {
  const { error: delErr } = await supabase.from(table).delete().eq("campaign_id", campaignId);
  if (delErr) throw new Error(delErr.message);
  if (rows.length === 0) return;
  const { error: insErr } = await supabase.from(table).insert(rows);
  if (insErr) throw new Error(insErr.message);
}

export async function syncCampaignChildren(
  supabase: SupabaseServerClient,
  campaignId: string,
  data: {
    prizes: PrizeInput[];
    faq: FaqInput[];
    ageBrackets: AgeBracketInput[];
    customFields: CustomFieldInput[];
  },
) {
  await replaceRows(
    supabase,
    "prizes",
    campaignId,
    data.prizes.map((p) => ({
      campaign_id: campaignId,
      title: p.title,
      description: p.description ?? null,
      rank: p.rank ?? null,
      sort_order: p.sort_order,
    })),
  );

  await replaceRows(
    supabase,
    "faq_items",
    campaignId,
    data.faq.map((f) => ({
      campaign_id: campaignId,
      question: f.question,
      answer: f.answer,
      sort_order: f.sort_order,
    })),
  );

  await replaceRows(
    supabase,
    "age_brackets",
    campaignId,
    data.ageBrackets.map((b) => ({
      campaign_id: campaignId,
      key: b.key,
      label: b.label,
      min_age: b.min_age,
      max_age: b.max_age,
      sort_order: b.sort_order,
    })),
  );

  await replaceRows(
    supabase,
    "custom_fields",
    campaignId,
    data.customFields.map((f) => ({
      campaign_id: campaignId,
      label: f.label,
      field_type: f.field_type,
      options: f.options ?? null,
      required: f.required,
      sort_order: f.sort_order,
    })),
  );
}
