import type { Locale } from "@/lib/i18n/types";
import type { SouvenirBranding, SouvenirFulfilment } from "./souvenirs";

/**
 * Localized copy for the souvenir shelf. Kept beside the shelf data rather than
 * in `chat-copy.ts` so the feature stays self-contained; operator words are
 * passed in as arguments so every string remains tenant-agnostic.
 */
export type SouvenirCopy = {
  quickReply: string;
  eyebrow: string;
  heading: (operator: string) => string;
  intro: string;
  optionsLabel: string;
  fulfilmentLabel: string;
  fulfilmentLabels: Record<SouvenirFulfilment, string>;
  brandingLabels: Record<SouvenirBranding, string>;
  madeToOrder: string;
  sampleDisclosure: string;
  cta: string;
  buyCta: string;
  validityLabel: (validity: string) => string;
  issuedBy: (provider: string) => string;
  nothingBooked: string;
};

const en: SouvenirCopy = {
  quickReply: "Take something home",
  eyebrow: "✦ Made to order",
  heading: (operator) => `${operator}'s shelf`,
  intro: "Choose before you travel and we ship it home, or have it waiting when you arrive.",
  optionsLabel: "Choose",
  fulfilmentLabel: "Delivery",
  fulfilmentLabels: {
    "ship-home": "Ship home",
    "waiting-on-arrival": "Waiting on arrival",
    "collect-on-the-day": "Collect on the day",
  },
  brandingLabels: {
    operator: "Operator mark",
    city: "City name only",
    unbranded: "No branding",
  },
  madeToOrder: "Printed after you order it — nothing sits in a back room.",
  sampleDisclosure: "Sample shelf for this demonstration. Not yet approved by the operator.",
  cta: "Choose options",
  buyCta: "Open gift card",
  validityLabel: (validity) => `${validity} validity`,
  issuedBy: (provider) => `Purchase and issuance by ${provider}.`,
  nothingBooked: "Nothing ordered yet.",
};

const es: SouvenirCopy = {
  quickReply: "Llévate un recuerdo",
  eyebrow: "✦ Hecho por encargo",
  heading: (operator) => `La estantería de ${operator}`,
  intro: "Elige antes de viajar y te lo enviamos a casa, o lo dejamos listo a tu llegada.",
  optionsLabel: "Elige",
  fulfilmentLabel: "Entrega",
  fulfilmentLabels: {
    "ship-home": "Envío a casa",
    "waiting-on-arrival": "Listo a tu llegada",
    "collect-on-the-day": "Recoger el mismo día",
  },
  brandingLabels: {
    operator: "Con la marca del operador",
    city: "Solo el nombre de la ciudad",
    unbranded: "Sin marca",
  },
  madeToOrder: "Se imprime después de tu pedido — no hay stock guardado.",
  sampleDisclosure: "Estantería de muestra para esta demostración. Aún no aprobada por el operador.",
  cta: "Elegir opciones",
  buyCta: "Abrir tarjeta regalo",
  validityLabel: (validity) => `${validity} de validez`,
  issuedBy: (provider) => `Compra y emisión a cargo de ${provider}.`,
  nothingBooked: "Todavía no has pedido nada.",
};

const fr: SouvenirCopy = {
  quickReply: "Rapportez un souvenir",
  eyebrow: "✦ Fabriqué à la commande",
  heading: (operator) => `L'étagère de ${operator}`,
  intro: "Choisissez avant de partir : nous l'expédions chez vous ou le tenons prêt à l'arrivée.",
  optionsLabel: "Choisissez",
  fulfilmentLabel: "Livraison",
  fulfilmentLabels: {
    "ship-home": "Expédition à domicile",
    "waiting-on-arrival": "Prêt à l'arrivée",
    "collect-on-the-day": "À retirer le jour même",
  },
  brandingLabels: {
    operator: "Marque de l'opérateur",
    city: "Nom de la ville uniquement",
    unbranded: "Sans marque",
  },
  madeToOrder: "Imprimé après votre commande — rien n'est stocké.",
  sampleDisclosure: "Étagère d'exemple pour cette démonstration. Pas encore approuvée par l'opérateur.",
  cta: "Choisir les options",
  buyCta: "Ouvrir la carte cadeau",
  validityLabel: (validity) => `Validité ${validity}`,
  issuedBy: (provider) => `Achat et émission par ${provider}.`,
  nothingBooked: "Rien de commandé pour l'instant.",
};

const ar: SouvenirCopy = {
  quickReply: "خذ تذكاراً معك",
  eyebrow: "✦ يُصنع عند الطلب",
  heading: (operator) => `رف ${operator}`,
  intro: "اختر قبل السفر ونشحنه إلى منزلك، أو نجهّزه لك عند الوصول.",
  optionsLabel: "اختر",
  fulfilmentLabel: "التوصيل",
  fulfilmentLabels: {
    "ship-home": "الشحن إلى المنزل",
    "waiting-on-arrival": "جاهز عند الوصول",
    "collect-on-the-day": "الاستلام في نفس اليوم",
  },
  brandingLabels: {
    operator: "بعلامة المشغّل",
    city: "اسم المدينة فقط",
    unbranded: "بدون علامة",
  },
  madeToOrder: "يُطبع بعد طلبك — لا يوجد مخزون.",
  sampleDisclosure: "رف تجريبي لهذا العرض. لم يعتمده المشغّل بعد.",
  cta: "اختر الخيارات",
  buyCta: "افتح بطاقة الهدية",
  validityLabel: (validity) => `صالحة لمدة ${validity}`,
  issuedBy: (provider) => `الشراء والإصدار عبر ${provider}.`,
  nothingBooked: "لم يتم طلب أي شيء بعد.",
};

const COPY: Record<Locale, SouvenirCopy> = { en, es, fr, ar };

export function getSouvenirCopy(locale: string): SouvenirCopy {
  return COPY[locale as Locale] ?? en;
}
