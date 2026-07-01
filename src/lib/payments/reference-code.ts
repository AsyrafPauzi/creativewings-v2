export function buildReferenceCode(orderId: string) {
  return `CW${orderId.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}
