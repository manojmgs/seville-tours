import type { DirectBookingRequest } from "./types";

/**
 * Operator email delivery port.
 *
 * The service depends only on this interface, so the email backend is swappable.
 * The default logs a NON-PII breadcrumb and does not send (dependency-free). A Resend
 * adapter is a drop-in replacement via {@link setEmailSender} once configured with an
 * API key and verified sender.
 *
 * GDPR note: an operator email necessarily contains guest PII (names, IDs, contact) —
 * that is its legitimate purpose. Implementations MUST transmit securely and MUST NOT
 * log the body. Consented booking data only.
 */

const PAYMENT_LABELS: Record<DirectBookingRequest["paymentMethod"], string> = {
  bizum: "Bizum",
  cash: "Cash on the day",
  bank: "Bank transfer",
  gift: "Gift card",
};

export type OperatorEmail = {
  to: string;
  subject: string;
  body: string;
};

export interface EmailSender {
  send(email: OperatorEmail): Promise<void>;
}

/** Default sender: logs non-PII metadata only and does not transmit. */
class ConsoleEmailSender implements EmailSender {
  async send(email: OperatorEmail): Promise<void> {
    console.info("[direct-booking] operator email queued", {
      to: Boolean(email.to),
      subject: email.subject,
    });
  }
}

let sender: EmailSender = new ConsoleEmailSender();

export function getEmailSender(): EmailSender {
  return sender;
}

/** Swaps the active sender (e.g. to a Resend adapter) at startup. */
export function setEmailSender(next: EmailSender): void {
  sender = next;
}

/** Operator notification address; unset falls back to an empty recipient (no-op send). */
function operatorEmailAddress(): string {
  return process.env.OPERATOR_NOTIFICATION_EMAIL ?? "";
}

/** Builds the operator-facing email for a direct-booking request. */
export function buildOperatorEmail(request: DirectBookingRequest): OperatorEmail {
  const lines: string[] = [
    `New booking request — ${request.tourName}`,
    `${request.dateLabel} · ${request.timeLabel}`,
    `Payment: ${PAYMENT_LABELS[request.paymentMethod]}`,
    "",
    "Guests:",
    ...request.guests.map((guest, index) => {
      const idPart = guest.idNumber ? ` — ID: ${guest.idNumber}` : "";
      return `${index + 1}. ${guest.label}: ${guest.name}${idPart}`;
    }),
    "",
  ];

  if (request.totalLabel) lines.push(request.totalLabel);
  if (request.leadName) lines.push(`Lead: ${request.leadName}`);
  lines.push(`Contact: ${request.leadContact}`);
  if (request.paymentMethod === "gift" && request.giftCode) {
    lines.push(`Gift code: ${request.giftCode}`);
  }
  if (request.paymentProof) lines.push(`Payment proof: ${request.paymentProof}`);
  if (request.notes) lines.push(`Notes: ${request.notes}`);
  lines.push("", `Request ID: ${request.id}`);

  return {
    to: operatorEmailAddress(),
    subject: `Booking request · ${request.tourName} · ${request.dateLabel}`,
    body: lines.join("\n"),
  };
}
