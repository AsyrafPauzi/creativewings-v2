import { createAdminClient } from "@/lib/supabase/server";

export async function syncSchoolCoupon(opts: {
  schoolId: string;
  campaignId: string;
  code: string;
}) {
  const trimmed = opts.code.trim();
  if (!trimmed) return;

  const supabase = createAdminClient();
  await supabase.from("sponsor_coupons").upsert(
    {
      campaign_id: opts.campaignId,
      school_id: opts.schoolId,
      code: trimmed.toUpperCase(),
      max_uses: 0,
      is_active: true,
    },
    { onConflict: "code" },
  );
}
