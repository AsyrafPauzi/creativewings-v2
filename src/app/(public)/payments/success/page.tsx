import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; txn?: string }>;
}) {
  const { ref } = await searchParams;
  let campaignSlug: string | null = null;

  if (ref) {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("payment_orders")
      .select("campaign_id")
      .eq("reference_code", ref)
      .maybeSingle();
    if (order?.campaign_id) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("slug")
        .eq("id", order.campaign_id)
        .maybeSingle();
      campaignSlug = campaign?.slug ?? null;
    }
  }

  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Payment received</CardTitle>
          <CardDescription>Your entry fee was processed successfully.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {campaignSlug && (
            <Button asChild variant="outline">
              <Link href={`/campaigns/${campaignSlug}`}>Back to campaign</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
