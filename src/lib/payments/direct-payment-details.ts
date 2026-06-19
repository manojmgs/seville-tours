import { WHATSAPP_NUMBER } from "@/lib/wordpress-rest/urls";

/**
 * Manual direct-payment details shown to guests who book direct with us.
 *
 * V1 has no payment processor: guests pay by Bizum, cash, or bank transfer and
 * send proof on WhatsApp; Carlos confirms manually. These are placeholder values —
 * set the matching env vars (or edit here) with the real account details before
 * going live. No card data ever passes through Seville Tours.
 */

export type DirectPaymentDetails = {
  /** WhatsApp number proof is sent to (international format, no +). */
  whatsappNumber: string;
  /** Bizum recipient phone number (placeholder). */
  bizumNumber: string;
  /** Bank-transfer beneficiary name (placeholder). */
  bankHolder: string;
  /** Bank-transfer IBAN (placeholder). */
  bankIban: string;
  /** Bank BIC/SWIFT (placeholder). */
  bankBic: string;
};

export const directPaymentDetails: DirectPaymentDetails = {
  whatsappNumber: WHATSAPP_NUMBER,
  bizumNumber: process.env.NEXT_PUBLIC_BIZUM_NUMBER ?? "+34 600 77 43 54",
  bankHolder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? "Seville Tours Co. S.L.",
  bankIban: process.env.NEXT_PUBLIC_BANK_IBAN ?? "ES12 3456 7890 1234 5678 9012",
  bankBic: process.env.NEXT_PUBLIC_BANK_BIC ?? "BSCHESMMXXX",
};
