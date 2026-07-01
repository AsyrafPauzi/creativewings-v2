export interface CommercePayConfig {
  testMode: boolean;
  tenantId: string;
  secretKey: string;
  currency: string;
}

export interface RequestPaymentPayload {
  amount: number;
  callbackUrl: string;
  currencyCode: string;
  customer: {
    email: string;
    mobileNo: string;
    name: string;
    username: string;
  };
  description: string;
  ipAddress: string;
  referenceCode: string;
  returnUrl: string;
  tenantId: number;
  timestamp: number;
  userAgent: string;
}

export interface CommercePayWebhookPayload {
  status: number;
  referenceCode: string;
  transactionNumber: string;
  amount: number;
}
