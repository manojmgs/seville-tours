import type { Locale } from "@/lib/i18n/types";

/**
 * Localized copy for the inline "Book direct with us" concierge card.
 *
 * Marco is client-only and receives `locale` as a prop, so the card selects its
 * strings here rather than through the server `siteCopy` tree. Operator-specific
 * words ({@link operator}) and commerce facts (price, spot counts) are passed in
 * as arguments so the copy stays tenant-agnostic and accurate per tour.
 */
export type DirectBookingCopy = {
  eyebrow: string;
  introFixed: (price: string, operator: string) => string;
  introQuote: (operator: string) => string;
  nameLabel: string;
  contactLabel: string;
  dateLabel: string;
  datePlaceholder: string;
  guestsLabel: string;
  paymentLegend: string;
  payBizum: string;
  payBank: string;
  payGift: string;
  depositLabel: string;
  submitLabel: string;
  submittingLabel: string;
  errorMsg: string;
  whatsappFallback: (operator: string) => string;
  sentEyebrow: string;
  sentHeading: (operator: string) => string;
  sentBodyFixed: (operator: string) => string;
  sentBodyQuote: (operator: string) => string;
  continueWhatsapp: string;
  /** Live-availability picker. */
  pickDate: string;
  pickTime: string;
  checkingLive: string;
  noTimes: string;
  spotsLeft: (remaining: number) => string;
  soldOut: string;
  /** Optional payment reference (Bizum / bank transfer). */
  referenceLabel: string;
  referencePlaceholder: string;
  referenceHint: (operator: string) => string;
  /** Pre-filled WhatsApp hand-off message to the operator. */
  whatsappLead: (params: WhatsAppLeadParams) => string;
};

export type WhatsAppLeadParams = {
  operator: string;
  tourName: string;
  name: string;
  date: string;
  guests: string;
  payment: string;
  deposit: boolean;
  reference: string;
};

const en: DirectBookingCopy = {
  eyebrow: "Book direct",
  introFixed: (price, operator) =>
    `Book direct to pay by Bizum, cash or gift card — ${price}, no booking fee. ${operator} confirms your spot personally.`,
  introQuote: (operator) =>
    `Private tours are quoted per group. Share a few details and ${operator} will confirm your date and price.`,
  nameLabel: "Your name",
  contactLabel: "Email or phone",
  dateLabel: "Preferred date",
  datePlaceholder: "e.g. 12 May, morning",
  guestsLabel: "Guests",
  paymentLegend: "Payment preference",
  payBizum: "Bizum",
  payBank: "Bank transfer",
  payGift: "Gift card",
  depositLabel: "Pay a deposit now, balance later",
  submitLabel: "Request my dates",
  submittingLabel: "Sending…",
  errorMsg: "Something went wrong — please continue on WhatsApp below.",
  whatsappFallback: (operator) => `Or message ${operator} on WhatsApp`,
  sentEyebrow: "✓ Request sent",
  sentHeading: (operator) => `${operator} will be in touch shortly`,
  sentBodyFixed: (operator) =>
    `${operator} will confirm your spot for the dates you want — nothing is due until it's confirmed. Want a faster reply?`,
  sentBodyQuote: (operator) =>
    `${operator} will confirm availability and a price for your dates — nothing is due until you both agree. Want a faster reply?`,
  continueWhatsapp: "Continue on WhatsApp →",
  pickDate: "Choose a date",
  pickTime: "Choose a time",
  checkingLive: "Checking live availability…",
  noTimes: "No times on this day",
  spotsLeft: (remaining) => (remaining === 1 ? "1 spot left" : `${remaining} spots left`),
  soldOut: "Sold out",
  referenceLabel: "Payment reference (optional)",
  referencePlaceholder: "e.g. Bizum ref 4821",
  referenceHint: (operator) =>
    `Already paid a deposit? Add your reference so ${operator} can match it. Otherwise ${operator} sends payment details after confirming — nothing is due yet.`,
  whatsappLead: ({ operator, tourName, name, date, guests, payment, deposit, reference }) =>
    `Hi ${operator}, I'd like to book "${tourName}" direct. Name: ${name || "—"}. Date: ${date || "—"}. Guests: ${guests}. Payment: ${payment}${deposit ? " (deposit now, balance later)" : ""}.${reference ? ` Payment reference: ${reference}.` : ""}`,
};

const es: DirectBookingCopy = {
  eyebrow: "Reserva directa",
  introFixed: (price, operator) =>
    `Reserva directa para pagar con Bizum, efectivo o tarjeta regalo — ${price}, sin comisión de reserva. ${operator} confirma tu plaza personalmente.`,
  introQuote: (operator) =>
    `Los tours privados se presupuestan por grupo. Comparte unos datos y ${operator} confirmará tu fecha y precio.`,
  nameLabel: "Tu nombre",
  contactLabel: "Email o teléfono",
  dateLabel: "Fecha preferida",
  datePlaceholder: "p. ej. 12 de mayo, por la mañana",
  guestsLabel: "Personas",
  paymentLegend: "Preferencia de pago",
  payBizum: "Bizum",
  payBank: "Transferencia",
  payGift: "Tarjeta regalo",
  depositLabel: "Pagar una señal ahora, el resto después",
  submitLabel: "Solicitar mis fechas",
  submittingLabel: "Enviando…",
  errorMsg: "Algo salió mal — continúa por WhatsApp abajo.",
  whatsappFallback: (operator) => `O escribe a ${operator} por WhatsApp`,
  sentEyebrow: "✓ Solicitud enviada",
  sentHeading: (operator) => `${operator} te contactará en breve`,
  sentBodyFixed: (operator) =>
    `${operator} confirmará tu plaza para las fechas que quieres — no se cobra nada hasta confirmarlo. ¿Quieres una respuesta más rápida?`,
  sentBodyQuote: (operator) =>
    `${operator} confirmará la disponibilidad y el precio para tus fechas — no se cobra nada hasta que acordéis. ¿Quieres una respuesta más rápida?`,
  continueWhatsapp: "Continuar por WhatsApp →",
  pickDate: "Elige una fecha",
  pickTime: "Elige una hora",
  checkingLive: "Comprobando disponibilidad en vivo…",
  noTimes: "No hay horarios este día",
  spotsLeft: (remaining) =>
    remaining === 1 ? "Queda 1 plaza" : `Quedan ${remaining} plazas`,
  soldOut: "Agotado",
  referenceLabel: "Referencia de pago (opcional)",
  referencePlaceholder: "p. ej. ref. Bizum 4821",
  referenceHint: (operator) =>
    `¿Ya pagaste una señal? Añade tu referencia para que ${operator} pueda localizarla. Si no, ${operator} te enviará los datos de pago tras confirmar — aún no se cobra nada.`,
  whatsappLead: ({ operator, tourName, name, date, guests, payment, deposit, reference }) =>
    `Hola ${operator}, quiero reservar "${tourName}" directamente. Nombre: ${name || "—"}. Fecha: ${date || "—"}. Personas: ${guests}. Pago: ${payment}${deposit ? " (señal ahora, resto después)" : ""}.${reference ? ` Referencia de pago: ${reference}.` : ""}`,
};

const fr: DirectBookingCopy = {
  eyebrow: "Réservation directe",
  introFixed: (price, operator) =>
    `Réservez en direct pour payer par Bizum, espèces ou carte cadeau — ${price}, sans frais de réservation. ${operator} confirme votre place personnellement.`,
  introQuote: (operator) =>
    `Les visites privées sont sur devis par groupe. Donnez quelques détails et ${operator} confirmera votre date et votre prix.`,
  nameLabel: "Votre nom",
  contactLabel: "E-mail ou téléphone",
  dateLabel: "Date souhaitée",
  datePlaceholder: "ex. 12 mai, le matin",
  guestsLabel: "Personnes",
  paymentLegend: "Préférence de paiement",
  payBizum: "Bizum",
  payBank: "Virement",
  payGift: "Carte cadeau",
  depositLabel: "Payer un acompte maintenant, le solde plus tard",
  submitLabel: "Demander mes dates",
  submittingLabel: "Envoi…",
  errorMsg: "Un problème est survenu — continuez sur WhatsApp ci-dessous.",
  whatsappFallback: (operator) => `Ou écrivez à ${operator} sur WhatsApp`,
  sentEyebrow: "✓ Demande envoyée",
  sentHeading: (operator) => `${operator} vous contactera sous peu`,
  sentBodyFixed: (operator) =>
    `${operator} confirmera votre place pour les dates souhaitées — rien n'est dû avant confirmation. Vous voulez une réponse plus rapide ?`,
  sentBodyQuote: (operator) =>
    `${operator} confirmera la disponibilité et un prix pour vos dates — rien n'est dû avant votre accord. Vous voulez une réponse plus rapide ?`,
  continueWhatsapp: "Continuer sur WhatsApp →",
  pickDate: "Choisissez une date",
  pickTime: "Choisissez un horaire",
  checkingLive: "Vérification de la disponibilité en direct…",
  noTimes: "Aucun horaire ce jour",
  spotsLeft: (remaining) =>
    remaining === 1 ? "1 place restante" : `${remaining} places restantes`,
  soldOut: "Complet",
  referenceLabel: "Référence de paiement (facultatif)",
  referencePlaceholder: "ex. réf. Bizum 4821",
  referenceHint: (operator) =>
    `Déjà payé un acompte ? Ajoutez votre référence pour que ${operator} puisse la retrouver. Sinon, ${operator} envoie les détails de paiement après confirmation — rien n'est dû pour l'instant.`,
  whatsappLead: ({ operator, tourName, name, date, guests, payment, deposit, reference }) =>
    `Bonjour ${operator}, je souhaite réserver "${tourName}" en direct. Nom : ${name || "—"}. Date : ${date || "—"}. Personnes : ${guests}. Paiement : ${payment}${deposit ? " (acompte maintenant, solde plus tard)" : ""}.${reference ? ` Référence de paiement : ${reference}.` : ""}`,
};

const ar: DirectBookingCopy = {
  eyebrow: "حجز مباشر",
  introFixed: (price, operator) =>
    `احجز مباشرةً للدفع عبر Bizum أو نقدًا أو ببطاقة هدية — ${price}، دون رسوم حجز. يؤكد ${operator} مكانك شخصيًا.`,
  introQuote: (operator) =>
    `الجولات الخاصة تُسعّر لكل مجموعة. شارك بعض التفاصيل وسيؤكد ${operator} تاريخك وسعرك.`,
  nameLabel: "اسمك",
  contactLabel: "البريد الإلكتروني أو الهاتف",
  dateLabel: "التاريخ المفضل",
  datePlaceholder: "مثال: 12 مايو، صباحًا",
  guestsLabel: "الأشخاص",
  paymentLegend: "طريقة الدفع المفضلة",
  payBizum: "Bizum",
  payBank: "تحويل بنكي",
  payGift: "بطاقة هدية",
  depositLabel: "ادفع عربونًا الآن والباقي لاحقًا",
  submitLabel: "اطلب مواعيدي",
  submittingLabel: "جارٍ الإرسال…",
  errorMsg: "حدث خطأ ما — تابع عبر واتساب أدناه.",
  whatsappFallback: (operator) => `أو راسل ${operator} عبر واتساب`,
  sentEyebrow: "✓ تم إرسال الطلب",
  sentHeading: (operator) => `سيتواصل معك ${operator} قريبًا`,
  sentBodyFixed: (operator) =>
    `سيؤكد ${operator} مكانك في التواريخ التي تريدها — لا شيء مستحق حتى التأكيد. تريد ردًا أسرع؟`,
  sentBodyQuote: (operator) =>
    `سيؤكد ${operator} التوفر والسعر لتواريخك — لا شيء مستحق حتى تتفقا. تريد ردًا أسرع؟`,
  continueWhatsapp: "المتابعة عبر واتساب →",
  pickDate: "اختر تاريخًا",
  pickTime: "اختر وقتًا",
  checkingLive: "جارٍ التحقق من التوفر المباشر…",
  noTimes: "لا مواعيد في هذا اليوم",
  spotsLeft: (remaining) =>
    remaining === 1 ? "بقي مكان واحد" : `بقيت ${remaining} أماكن`,
  soldOut: "نفدت الأماكن",
  referenceLabel: "مرجع الدفع (اختياري)",
  referencePlaceholder: "مثال: مرجع Bizum 4821",
  referenceHint: (operator) =>
    `هل دفعت عربونًا بالفعل؟ أضف مرجعك ليتمكن ${operator} من مطابقته. وإلا فسيرسل ${operator} تفاصيل الدفع بعد التأكيد — لا شيء مستحق الآن.`,
  whatsappLead: ({ operator, tourName, name, date, guests, payment, deposit, reference }) =>
    `مرحبًا ${operator}، أريد حجز "${tourName}" مباشرةً. الاسم: ${name || "—"}. التاريخ: ${date || "—"}. الأشخاص: ${guests}. الدفع: ${payment}${deposit ? " (عربون الآن والباقي لاحقًا)" : ""}.${reference ? ` مرجع الدفع: ${reference}.` : ""}`,
};

const COPY: Record<Locale, DirectBookingCopy> = { en, es, fr, ar };

/** Returns the direct-booking card copy for a locale, defaulting to English. */
export function getDirectBookingCopy(locale: string): DirectBookingCopy {
  return COPY[locale as Locale] ?? en;
}
