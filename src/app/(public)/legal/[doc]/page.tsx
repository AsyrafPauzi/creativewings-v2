import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; body: string }> = {
  terms: {
    title: "Terms & Conditions",
    body: `By accessing or using Creative Wings, you agree to the following terms. This is placeholder copy; your operations team should replace it with the final Terms & Conditions drafted by counsel before going live.`,
  },
  privacy: {
    title: "Privacy Policy",
    body: `We respect your privacy. We store the minimum information needed to operate the platform: profile details, campaign participation, and uploaded artwork. This is placeholder copy and must be replaced before launch.`,
  },
  "service-delivery": {
    title: "Service Delivery Policy",
    body: `Creative Wings delivers digital services (e-certificates, dashboards, online judging) and, where applicable, partners with sponsors to deliver physical prizes and printed merchandise. Replace this placeholder with your final policy.`,
  },
  refunds: {
    title: "Refund & Returns Policy",
    body: `Entry fees are generally non-refundable once a campaign closes. Where a campaign is cancelled by the organiser, fees will be returned to the original payment method or your wallet balance. Replace this placeholder with your final policy.`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  return { title: DOCS[doc]?.title ?? "Legal" };
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = DOCS[doc];
  if (!meta) notFound();
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-4xl font-bold tracking-tight">{meta.title}</h1>
      <p className="mt-4 whitespace-pre-line text-muted-foreground">{meta.body}</p>
    </div>
  );
}
