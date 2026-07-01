import crypto from "crypto";

export function verifyWebhookSignature(
  callbackUrl: string,
  rawBody: string,
  headerSignature: string,
  secretKey: string,
) {
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${callbackUrl}${rawBody}`.toLowerCase())
    .digest("hex");
  return expected === headerSignature;
}
