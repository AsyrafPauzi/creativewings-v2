import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Payment cancelled" };

export default async function PaymentCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="container py-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Payment not completed</CardTitle>
          <CardDescription>
            Your payment was cancelled or is still pending. You can try again from your dashboard.
            {ref ? ` Reference: ${ref}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
