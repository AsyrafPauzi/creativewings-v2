import { NextResponse } from "next/server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cert } = await supabase
    .from("issued_certificates")
    .select("id, user_id, storage_path, campaign_id")
    .eq("id", id)
    .maybeSingle();

  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let allowed = cert.user_id === user.id;

  if (!allowed) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.is_admin) allowed = true;
  }

  if (!allowed) {
    const { data: campaign } = await supabase
      .from("campaigns")
      .select("organizer_id, organizers:organizer_id(owner_id)")
      .eq("id", cert.campaign_id)
      .maybeSingle();
    const org = Array.isArray(campaign?.organizers) ? campaign.organizers[0] : campaign?.organizers;
    if (org?.owner_id === user.id) allowed = true;
  }

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: file, error } = await admin.storage.from("certificates").download(cert.storage_path);
  if (error || !file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = cert.storage_path.split("/").pop() ?? "certificate.png";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
