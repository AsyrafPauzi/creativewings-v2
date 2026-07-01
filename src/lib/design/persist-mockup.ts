import { createAdminClient } from "@/lib/supabase/server";

export async function persistSubmissionMockup(
  submissionId: string,
  campaignId: string,
  buffer: Buffer,
): Promise<string> {
  const supabase = createAdminClient();
  const path = `${campaignId}/${submissionId}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("mockups")
    .upload(path, buffer, { contentType: "image/png", upsert: true });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from("mockups").getPublicUrl(path);
  const mockupUrl = data.publicUrl;

  await supabase.from("submissions").update({ mockup_url: mockupUrl }).eq("id", submissionId);

  return mockupUrl;
}
