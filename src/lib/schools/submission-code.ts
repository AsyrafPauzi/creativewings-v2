import { createAdminClient } from "@/lib/supabase/server";

export function formatSubmissionCode(schoolCode: string, monthCode: string, seq: number) {
  const ccc = schoolCode.padStart(3, "0").slice(0, 3);
  const mm = monthCode.padStart(2, "0").slice(0, 2);
  const seqPart = String(seq).padStart(6, "0");
  return {
    submission_code: `${ccc}-${mm}-${seqPart}`,
    school_code: ccc,
    month_code: mm,
    seq_code: seqPart,
  };
}

export async function allocateSubmissionCode(campaignId: string, schoolCode: string) {
  const supabase = createAdminClient();
  const monthCode = String(new Date().getMonth() + 1).padStart(2, "0");
  const { data, error } = await supabase.rpc("next_submission_seq", {
    p_campaign_id: campaignId,
    p_month_code: monthCode,
  });
  if (error) throw error;
  return formatSubmissionCode(schoolCode, monthCode, data as number);
}
