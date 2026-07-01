import { z } from "zod";

const campaignCore = z.object({
  title: z.string().min(1),
  type: z.enum(["competition", "activity", "workshop"]),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: z.string().nullable().optional(),
  sub_category: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  entry_fee: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  submission_start: z.string().nullable().optional(),
  submission_deadline: z.string().nullable().optional(),
  review_start: z.string().nullable().optional(),
  final_event_date: z.string().nullable().optional(),
  event_mode: z.enum(["online", "physical", "hybrid"]).nullable().optional(),
  location_details: z.string().nullable().optional(),
  kpi_show_progress: z.boolean().optional(),
  kpi_target: z.number().int().nonnegative().optional(),
  kpi_label: z.string().nullable().optional(),
  allow_multiple_submissions: z.boolean().optional(),
  multi_min: z.number().int().optional(),
  multi_max: z.number().int().optional(),
  enable_age_brackets: z.boolean().optional(),
  enable_school_sponsors: z.boolean().optional(),
  enable_certificate: z.boolean().optional(),
  enable_voting: z.boolean().optional(),
  vote_limit_per_user: z.number().int().optional(),
  enable_checkout_message: z.boolean().optional(),
  checkout_message_label: z.string().nullable().optional(),
  checkout_message_required: z.boolean().optional(),
  enable_design: z.boolean().optional(),
  design_picker_label: z.string().nullable().optional(),
  design_artwork_w: z.number().int().positive().nullable().optional(),
  design_artwork_h: z.number().int().positive().nullable().optional(),
  judging_criteria: z.string().nullable().optional(),
  total_prize_value: z.string().nullable().optional(),
  sdg_goals: z.array(z.number().int()).optional(),
});

export const campaignImportV1Schema = z.object({
  schema_version: z.literal(1),
  campaign: campaignCore,
  prizes: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().nullable().optional(),
        rank: z.number().nullable().optional(),
        sort_order: z.number(),
      }),
    )
    .default([]),
  faq_items: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
        sort_order: z.number(),
      }),
    )
    .default([]),
  age_brackets: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        min_age: z.number(),
        max_age: z.number(),
        sort_order: z.number(),
      }),
    )
    .default([]),
  custom_fields: z
    .array(
      z.object({
        label: z.string(),
        field_type: z.string(),
        options: z.string().nullable().optional(),
        required: z.boolean(),
        sort_order: z.number(),
      }),
    )
    .default([]),
  design_variants: z
    .array(
      z.object({
        slug: z.string(),
        label: z.string(),
        swatch_color: z.string().nullable().optional(),
        size_label: z.string().nullable().optional(),
        mockup_image_url: z.string().url(),
        print_area_x: z.number(),
        print_area_y: z.number(),
        print_area_w: z.number(),
        print_area_h: z.number(),
        sort_order: z.number(),
        is_active: z.boolean().optional(),
      }),
    )
    .default([]),
});

export type CampaignImportV1 = z.infer<typeof campaignImportV1Schema>;
