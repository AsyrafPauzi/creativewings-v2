import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ClaimLookupForm } from "./claim-lookup-form";

export default function ClaimPage() {
  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle>Claim an entry</CardTitle>
          <CardDescription>
            Enter the submission code from your school or organizer to link the artwork to your
            account and complete payment if required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <ClaimLookupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
