import { NextResponse } from "next/server";

import { assertApiCampaignAccess, validateApiKey } from "@/lib/api/validate-api-key";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await validateApiKey(request, "read_submissions");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: campaignId } = await params;
  const allowed = await assertApiCampaignAccess(auth.organizerId, campaignId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
  const status = url.searchParams.get("status");
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();
  let query = supabase
    .from("submissions")
    .select(
      "submission_code, student_name, status, moderation_status, score, rank, vote_count, paid_at, created_at",
      { count: "exact" },
    )
    .eq("campaign_id", campaignId)
    .neq("status", "staged")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
