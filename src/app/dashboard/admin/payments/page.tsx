import { redirect } from "next/navigation";

import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { requireUser } from "@/lib/auth";
import { getPaymentSettingsForAdmin } from "@/lib/payments/settings";

export const metadata = { title: "Payment settings" };

export default async function AdminPaymentsPage() {
  const { profile } = await requireUser();
  if (!profile.is_admin) redirect("/dashboard");

  const settings = await getPaymentSettingsForAdmin();

  return (
    <div className="space-y-6">
      <header>
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Admin</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-body">Payment settings</h1>
        <p className="text-text-secondary">
          CommercePay API keys and environment toggles. Only super-admins can view or edit these values.
        </p>
      </header>
      <PaymentSettingsForm settings={settings} />
    </div>
  );
}
