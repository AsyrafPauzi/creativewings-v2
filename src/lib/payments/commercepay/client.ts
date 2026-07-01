import crypto from "crypto";

import type { CommercePayConfig, RequestPaymentPayload } from "./types";

export function commercePayBaseUrl(testMode: boolean) {
  return testMode
    ? "https://staging-payments.commerce.asia/"
    : "https://payments.commerce.asia/";
}

export function buildCapSignature(
  baseUrl: string,
  path: string,
  body: string,
  secretKey: string,
) {
  const signString = `${baseUrl}${path}${body}`.toLowerCase();
  return crypto.createHmac("sha256", secretKey).update(signString).digest("hex");
}

export async function requestPayment(
  config: CommercePayConfig,
  payload: RequestPaymentPayload,
): Promise<{ redirectUrl: string }> {
  const base = commercePayBaseUrl(config.testMode);
  const path = "api/services/app/PaymentGateway/RequestPayment";
  const body = JSON.stringify(payload);
  const signature = buildCapSignature(base, path, body, config.secretKey);

  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cap-signature": signature,
    },
    body,
  });

  const json = (await res.json()) as {
    result?: { redirectUrl?: string };
    error?: { message?: string };
  };

  if (!res.ok || !json.result?.redirectUrl) {
    throw new Error(json.error?.message ?? "CommercePay RequestPayment failed.");
  }

  return { redirectUrl: json.result.redirectUrl };
}

export async function queryPayment(config: CommercePayConfig, transactionNumber: string) {
  const base = commercePayBaseUrl(config.testMode);
  const path = "api/services/app/PaymentGateway/Query";
  const postfields = {
    tenantId: Number(config.tenantId),
    timestamp: Math.floor(Date.now() / 1000),
    transactionNumber,
  };
  const body = JSON.stringify(postfields);
  const signature = buildCapSignature(base, path, body, config.secretKey);
  const qs = new URLSearchParams({
    tenantId: String(postfields.tenantId),
    timestamp: String(postfields.timestamp),
    transactionNumber,
  });

  const res = await fetch(`${base}${path}?${qs}`, {
    headers: {
      "Content-Type": "application/json",
      "cap-signature": signature,
    },
  });

  return res.json() as Promise<{ result?: { status?: number } }>;
}
