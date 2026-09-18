/**
 * Build a wa.me deep link for the operator's number. Kept local to the widget so
 * Marco stays multi-tenant: the number comes from MarcoConfig, not a global const.
 */
export function buildMarcoWhatsAppUrl(whatsapp: string, message: string): string {
  const digits = whatsapp.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  const text = message.trim();
  if (!text) return base;
  return `${base}?${new URLSearchParams({ text }).toString()}`;
}
