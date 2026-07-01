import type { MarcoConfig, MarcoTour } from "@/components/marco-chat/types";
import { fillTokens } from "@/components/marco-chat/content";
import { getKbCopy, type KbCopy } from "./knowledge-base-copy";

/**
 * Deterministic, grounded knowledge base for the Marco concierge.
 *
 * There is NO generative model here, and nothing is tenant-specific by hard-code.
 * Free-text questions are matched to a fixed set of intents by keyword and answered
 * only from facts we can stand behind: prices/durations come from the operator's own
 * tour data, recommendations are chosen by matching tour tags, and process answers
 * (booking, payment, gifts) are phrased with tokens from the operator config.
 *
 * Operators can also inject their own FAQ via `config.knowledgeBase`, checked first.
 *
 * Anything we cannot verify — exact meeting points, inclusions, cancellation terms,
 * precise times — is NOT invented. It resolves to `escalate`, handing the guest to
 * the operator. This keeps the concierge honest and multi-tenant by construction.
 */

export type MarcoAnswer =
  | { kind: "reply"; text: string; recommend?: string[] }
  | { kind: "escalate"; text: string };

type Intent = {
  /** Words/phrases that trigger this intent (lower-cased, substring match). */
  keywords: string[];
  respond: (context: KbContext) => MarcoAnswer;
};

type KbContext = {
  tours: MarcoTour[];
  config: MarcoConfig;
  copy: KbCopy;
  text: string;
};

function normalise(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Find tours the guest named directly in free text. Matching is multilingual:
 * each tour carries accent-insensitive tokens (EN/ES/FR place names such as
 * "alcazar", "catedral", "alhambra"), so "tour del Alcázar" or "la cathédrale"
 * both resolve. Returns up to two matches; `text` must already be normalised.
 */
function findToursByName(tours: MarcoTour[], text: string): MarcoTour[] {
  return tours
    .filter((tour) =>
      tour.matchTerms.some(
        (term) => term.length > 2 && text.includes(normalise(term)),
      ),
    )
    .slice(0, 2);
}

function tourByKeyword(tours: MarcoTour[], text: string): MarcoTour | undefined {
  return findToursByName(tours, text)[0];
}

/** Pick up to two tour ids whose tags match any of the given interest tags. */
function idsByTag(tours: MarcoTour[], ...tags: string[]): string[] {
  const wanted = tags.map(normalise);
  return tours
    .filter((tour) => tour.tags.some((tag) => wanted.includes(normalise(tag))))
    .slice(0, 2)
    .map((tour) => tour.id);
}

/** Build a recommendation reply from matched tags, or escalate if nothing fits. */
function recommendByTag(
  context: KbContext,
  lead: string,
  ...tags: string[]
): MarcoAnswer {
  const ids = idsByTag(context.tours, ...tags);
  const names = ids
    .map((id) => context.tours.find((tour) => tour.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return {
      kind: "escalate",
      text: context.copy.connectFit(context.config.operatorName),
    };
  }

  const joined =
    names.length > 1
      ? `${names[0]} ${context.copy.and} ${names[1]}`
      : names[0];
  return { kind: "reply", text: `${lead} ${joined}.`, recommend: ids };
}

const INTENTS: Intent[] = [
  {
    keywords: [
      // en
      "price", "cost", "how much", "euro", "€", "expensive", "rate", "fee",
      // es
      "precio", "cuesta", "cuanto cuesta", "cuánto", "tarifa", "coste",
      // fr
      "prix", "coûte", "combien", "tarif",
      // ar
      "سعر", "تكلفة", "كم",
    ],
    respond: ({ tours, config, copy }) => {
      const priced = tours.filter((tour) => tour.priceKnown);
      const lines = priced.map((tour) => `• ${tour.name} — ${tour.price}`);
      const hasQuoteTours = tours.some((tour) => !tour.priceKnown);
      const privateNote = hasQuoteTours ? copy.pricePrivateNote(config.operatorName) : "";
      return {
        kind: "reply",
        text: `${copy.priceIntro}\n${lines.join("\n")}${privateNote}`,
      };
    },
  },
  {
    keywords: [
      // en
      "how do i book", "how to book", "reserve", "booking", "book a", "availability", "dates", "calendar",
      // es
      "reservar", "reserva", "disponibilidad", "fechas", "calendario",
      // fr
      "réserver", "réservation", "disponibilité", "dates",
      // ar
      "احجز", "حجز", "توفر", "تواريخ",
    ],
    respond: ({ config, copy }) => ({
      kind: "reply",
      text: copy.bookAnswer(config.operatorName),
    }),
  },
  {
    keywords: [
      // en
      "pay", "payment", "bizum", "bank transfer", "deposit", "card", "credit",
      // es
      "pagar", "pago", "transferencia", "señal", "tarjeta",
      // fr
      "payer", "paiement", "virement", "acompte",
      // ar
      "دفع", "بيزوم", "تحويل", "عربون",
    ],
    respond: ({ config, copy }) => ({
      kind: "reply",
      text: copy.payAnswer(config.operatorName),
    }),
  },
  {
    keywords: [
      // en
      "gift", "voucher", "present", "gift card",
      // es
      "regalo", "tarjeta regalo", "vale",
      // fr
      "cadeau", "carte cadeau",
      // ar
      "هدية", "بطاقة هدية",
    ],
    respond: ({ config, copy }) => ({
      kind: "reply",
      text: copy.giftAnswer(config.giftUrl),
    }),
  },
  {
    keywords: [
      // en
      "cancel", "refund", "reschedule", "change my", "change the date",
      // es
      "cancelar", "reembolso", "cambiar fecha", "cambiar la fecha",
      // fr
      "annuler", "remboursement", "reporter", "changer la date",
      // ar
      "إلغاء", "استرداد", "تغيير التاريخ",
    ],
    respond: ({ config, copy }) => ({
      kind: "escalate",
      text: copy.cancelAnswer(config.operatorName),
    }),
  },
  {
    keywords: [
      // en
      "family", "kids", "children", "child",
      // es
      "familia", "niños", "hijos",
      // fr
      "famille", "enfants",
      // ar
      "عائلة", "أطفال", "اطفال",
    ],
    respond: (context) =>
      recommendByTag(
        context,
        context.copy.leadFamily,
        "families",
        "family",
        "first visit",
      ),
  },
  {
    keywords: [
      // en
      "food", "tapas", "wine", "eat", "restaurant", "drink",
      // es
      "comida", "gastronomia", "vino", "comer",
      // fr
      "nourriture", "cuisine", "vin", "manger", "gastronomie",
      // ar
      "طعام", "نبيذ", "اكل", "مطعم",
    ],
    respond: (context) =>
      recommendByTag(context, context.copy.leadFood, "food", "wine"),
  },
  {
    keywords: [
      // en
      "history", "architecture", "monument", "palace", "gothic", "moorish", "mudejar",
      // es
      "historia", "arquitectura", "monumento", "palacio",
      // fr
      "histoire", "architecture", "palais",
      // ar
      "تاريخ", "عمارة", "قصر", "معلم",
    ],
    respond: (context) =>
      recommendByTag(
        context,
        context.copy.leadHistory,
        "history",
        "architecture",
      ),
  },
  {
    keywords: [
      // en
      "day trip", "further", "excursion", "outside", "nearby city",
      // es
      "excursion", "excursión", "mas lejos", "más lejos",
      // fr
      "journée", "plus loin",
      // ar
      "رحلة يوم", "خارج",
    ],
    respond: (context) =>
      recommendByTag(context, context.copy.leadDaytrip, "day trip", "daytrip"),
  },
  {
    keywords: [
      // en
      "how long", "duration", "hours", "last", "time does it take",
      // es
      "duracion", "duración", "cuanto dura", "horas",
      // fr
      "durée", "combien de temps", "heures",
      // ar
      "مدة", "كم تستغرق", "ساعات",
    ],
    respond: ({ tours, text, copy }) => {
      const tour = tourByKeyword(tours, text);
      if (tour) {
        return { kind: "reply", text: copy.durationAnswer(tour.name, tour.duration) };
      }
      return { kind: "reply", text: copy.durationFallback };
    },
  },
  {
    keywords: [
      // en
      "private", "just us", "our own", "group",
      // es
      "privado", "privada", "solo nosotros",
      // fr
      "privé", "privée", "notre groupe",
      // ar
      "خاص", "مجموعتنا",
    ],
    respond: ({ copy }) => ({
      kind: "reply",
      text: copy.privateAnswer,
    }),
  },
  {
    keywords: [
      // en
      "language", "english", "spanish", "french", "guide speak",
      // es
      "idioma", "español", "ingles", "inglés", "frances", "francés",
      // fr
      "langue", "anglais", "espagnol",
      // ar
      "لغة", "انجليزي", "اسباني", "فرنسي",
    ],
    respond: ({ config, copy }) => ({
      kind: "escalate",
      text: copy.languageAnswer(config.operatorName),
    }),
  },
];

/** Intents whose answers we can't verify without operator input. */
const ESCALATE_KEYWORDS = [
  // en
  "meeting point", "where do we meet", "where do i go", "included", "include",
  "wheelchair", "accessible", "accessibility", "dress", "bring", "toilet", "parking",
  // es
  "punto de encuentro", "donde nos encontramos", "incluye", "incluido",
  "silla de ruedas", "accesible", "aseo", "baño", "aparcamiento",
  // fr
  "point de rencontre", "où se retrouve", "inclus", "fauteuil roulant",
  "toilettes", "apporter",
  // ar
  "نقطة اللقاء", "اين نلتقي", "أين نلتقي", "يشمل", "كرسي متحرك", "مرحاض", "موقف",
];

/** Match operator-supplied FAQ entries first — fully tenant-defined. */
function matchCustomEntry(text: string, config: MarcoConfig): MarcoAnswer | null {
  for (const entry of config.knowledgeBase ?? []) {
    if (entry.keywords.some((keyword) => text.includes(normalise(keyword)))) {
      return { kind: "reply", text: fillTokens(entry.answer, config), recommend: entry.recommend };
    }
  }
  return null;
}

/**
 * Answer a free-text question from the knowledge base. Returns a grounded reply,
 * a recommendation, or an escalation to the operator — never a fabricated fact.
 */
export function answerQuestion(
  rawText: string,
  tours: MarcoTour[],
  config: MarcoConfig,
  locale: string = "en",
): MarcoAnswer {
  const text = normalise(rawText);
  const copy = getKbCopy(locale);

  const custom = matchCustomEntry(text, config);
  if (custom) return custom;

  for (const intent of INTENTS) {
    if (intent.keywords.some((keyword) => text.includes(normalise(keyword)))) {
      return intent.respond({ tours, config, copy, text });
    }
  }

  if (ESCALATE_KEYWORDS.some((keyword) => text.includes(normalise(keyword)))) {
    return {
      kind: "escalate",
      text: copy.escalateGeneric(config.operatorName),
    };
  }

  // A guest naming a specific tour ("the Alcázar tour", "la catedral") should
  // see that tour, not be escalated. Checked after the honest-escalation words
  // above so unknowable details (meeting point, inclusions) still hand off.
  const named = findToursByName(tours, text);
  if (named.length > 0) {
    const [first, second] = named;
    const lead = second
      ? copy.namedTwo(first.name, second.name)
      : copy.namedOne(first.name);
    return { kind: "reply", text: lead, recommend: named.map((tour) => tour.id) };
  }

  return {
    kind: "escalate",
    text: copy.finalEscalate(config.operatorName),
  };
}
