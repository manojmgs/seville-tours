import type { Locale } from "@/lib/i18n/types";
import type { DurationAnswer, GroupAnswer, InterestAnswer } from "./types";

/**
 * Localized copy for the concierge chat shell (greeting, decision-tree questions
 * and chips, tour-card actions, gift nudge, and escalation hand-off).
 *
 * The widget is client-only and receives `locale` as a prop, so it selects its
 * strings here rather than through the server `siteCopy` tree. Operator words
 * (persona, operator, brand, destination, region, giftProvider) are passed in as
 * arguments so every string stays tenant-agnostic. Decision-tree option *values*
 * live in {@link ./decisionTree} and never change per language — only the visible
 * labels below are localized.
 */
export type ChatCopy = {
  greeting: (params: { persona: string; destination: string; operator: string }) => string;
  questionDuration: (destination: string) => string;
  questionInterest: (region: string) => string;
  questionGroup: string;
  durationLabels: Record<DurationAnswer, string>;
  interestLabels: Record<InterestAnswer, string>;
  groupLabels: Record<GroupAnswer, string>;
  recommendLeadOne: string;
  recommendLeadTwo: string;
  tapInstruction: (operator: string) => string;
  startOver: string;
  headerOnline: string;
  headerExpertSuffix: (region: string) => string;
  advisorAria: (params: { persona: string; destination: string }) => string;
  closeChat: string;
  typingAria: (persona: string) => string;
  inputPlaceholder: (persona: string) => string;
  inputAria: (persona: string) => string;
  sendAria: string;
  bookNow: string;
  bookDirect: string;
  giftCard: string;
  talkTo: (operator: string) => string;
  giftEyebrow: string;
  giftHeading: string;
  giftBody: (giftProvider: string) => string;
  giftCta: string;
  escConnecting: (operator: string) => string;
  escHeading: string;
  escWhatsApp: (operator: string) => string;
  escInterestedIn: (tourName: string) => string;
  escGuestEnquiry: (brand: string) => string;
  escMessage: (params: {
    operator: string;
    persona: string;
    brand: string;
    summary: string;
  }) => string;
};

const en: ChatCopy = {
  greeting: ({ persona, destination, operator }) =>
    `Hola! I'm ${persona}, your ${destination} expert. A few quick questions and I'll point you to the perfect private tour with ${operator}.`,
  questionDuration: (destination) => `How long are you in ${destination}?`,
  questionInterest: (region) => `What draws you to ${region}?`,
  questionGroup: "And who's travelling?",
  durationLabels: {
    "few-hours": "Just a few hours",
    "1-2-days": "1–2 days",
    "3-plus": "3+ days",
    "day-trip": "Day trip from elsewhere",
  },
  interestLabels: {
    history: "History & architecture",
    food: "Food & wine",
    daytrip: "A day trip further afield",
    surprise: "Surprise me",
  },
  groupLabels: {
    solo: "Just me",
    couple: "A couple",
    family: "Family with kids",
    group: "A group",
  },
  recommendLeadOne: "Based on that, here's the one I'd book first:",
  recommendLeadTwo: "Based on that, here are the two I'd book first:",
  tapInstruction: (operator) =>
    `Tap Book now for instant online booking, Book direct with us for private tours, or Talk to ${operator} for anything bespoke — dates, groups or a custom itinerary. You can also just ask me a question.`,
  startOver: "Start over",
  headerOnline: "Online",
  headerExpertSuffix: (region) => `${region} expert`,
  advisorAria: ({ persona, destination }) => `${persona}, ${destination} tour advisor`,
  closeChat: "Close chat",
  typingAria: (persona) => `${persona} is typing`,
  inputPlaceholder: (persona) => `Message ${persona}…`,
  inputAria: (persona) => `Message ${persona}`,
  sendAria: "Send message",
  bookNow: "Book now",
  bookDirect: "Book direct with us",
  giftCard: "Gift card",
  talkTo: (operator) => `Talk to ${operator}`,
  giftEyebrow: "Gift card",
  giftHeading: "Not ready to book? Give the experience as a gift.",
  giftBody: (giftProvider) =>
    `The recipient chooses the tour, the date and the pace — no expiry. Purchase and delivery are handled securely on ${giftProvider}.`,
  giftCta: "Buy a gift card →",
  escConnecting: (operator) => `Connecting with ${operator}`,
  escHeading: "Your conversation, ready to send",
  escWhatsApp: (operator) => `WhatsApp ${operator} now`,
  escInterestedIn: (tourName) => `interested in ${tourName}`,
  escGuestEnquiry: (brand) => `Guest enquiry from ${brand}`,
  escMessage: ({ operator, persona, brand, summary }) =>
    `Hi ${operator}, ${persona} sent me over from ${brand}.\n\n${summary}\n\nCould you help me with the details?`,
};

const es: ChatCopy = {
  greeting: ({ persona, destination, operator }) =>
    `¡Hola! Soy ${persona}, tu experta en ${destination}. Unas preguntas rápidas y te recomendaré el tour privado perfecto con ${operator}.`,
  questionDuration: (destination) => `¿Cuánto tiempo estarás en ${destination}?`,
  questionInterest: (region) => `¿Qué te atrae de ${region}?`,
  questionGroup: "¿Y quién viaja?",
  durationLabels: {
    "few-hours": "Solo unas horas",
    "1-2-days": "1–2 días",
    "3-plus": "3+ días",
    "day-trip": "Excursión de un día desde otro lugar",
  },
  interestLabels: {
    history: "Historia y arquitectura",
    food: "Gastronomía y vino",
    daytrip: "Una excursión más lejos",
    surprise: "Sorpréndeme",
  },
  groupLabels: {
    solo: "Solo yo",
    couple: "Una pareja",
    family: "Familia con niños",
    group: "Un grupo",
  },
  recommendLeadOne: "Con eso en mente, este es el que reservaría primero:",
  recommendLeadTwo: "Con eso en mente, estos son los dos que reservaría primero:",
  tapInstruction: (operator) =>
    `Toca Reservar ahora para reserva online inmediata, Reserva directa para tours privados, o Habla con ${operator} para algo a medida — fechas, grupos o un itinerario personalizado. También puedes hacerme una pregunta.`,
  startOver: "Empezar de nuevo",
  headerOnline: "En línea",
  headerExpertSuffix: (region) => `experta en ${region}`,
  advisorAria: ({ persona, destination }) => `${persona}, asesora de tours de ${destination}`,
  closeChat: "Cerrar chat",
  typingAria: (persona) => `${persona} está escribiendo`,
  inputPlaceholder: (persona) => `Escribe a ${persona}…`,
  inputAria: (persona) => `Escribe a ${persona}`,
  sendAria: "Enviar mensaje",
  bookNow: "Reservar ahora",
  bookDirect: "Reserva directa",
  giftCard: "Tarjeta regalo",
  talkTo: (operator) => `Habla con ${operator}`,
  giftEyebrow: "Tarjeta regalo",
  giftHeading: "¿Aún no quieres reservar? Regala la experiencia.",
  giftBody: (giftProvider) =>
    `La persona elige el tour, la fecha y el ritmo — sin caducidad. La compra y la entrega se gestionan de forma segura en ${giftProvider}.`,
  giftCta: "Comprar tarjeta regalo →",
  escConnecting: (operator) => `Conectando con ${operator}`,
  escHeading: "Tu conversación, lista para enviar",
  escWhatsApp: (operator) => `Escribir a ${operator} por WhatsApp`,
  escInterestedIn: (tourName) => `interesado en ${tourName}`,
  escGuestEnquiry: (brand) => `Consulta de un cliente de ${brand}`,
  escMessage: ({ operator, persona, brand, summary }) =>
    `Hola ${operator}, ${persona} me envía desde ${brand}.\n\n${summary}\n\n¿Podrías ayudarme con los detalles?`,
};

const fr: ChatCopy = {
  greeting: ({ persona, destination, operator }) =>
    `Bonjour ! Je suis ${persona}, votre experte de ${destination}. Quelques questions rapides et je vous indiquerai la visite privée idéale avec ${operator}.`,
  questionDuration: (destination) => `Combien de temps restez-vous à ${destination} ?`,
  questionInterest: (region) => `Qu'est-ce qui vous attire en ${region} ?`,
  questionGroup: "Et qui voyage ?",
  durationLabels: {
    "few-hours": "Juste quelques heures",
    "1-2-days": "1–2 jours",
    "3-plus": "3 jours et plus",
    "day-trip": "Excursion d'une journée depuis ailleurs",
  },
  interestLabels: {
    history: "Histoire et architecture",
    food: "Gastronomie et vin",
    daytrip: "Une excursion plus loin",
    surprise: "Surprenez-moi",
  },
  groupLabels: {
    solo: "Juste moi",
    couple: "Un couple",
    family: "Famille avec enfants",
    group: "Un groupe",
  },
  recommendLeadOne: "Dans ce cas, voici celle que je réserverais en premier :",
  recommendLeadTwo: "Dans ce cas, voici les deux que je réserverais en premier :",
  tapInstruction: (operator) =>
    `Touchez Réserver pour une réservation en ligne immédiate, Réservation directe pour les visites privées, ou Parler à ${operator} pour du sur-mesure — dates, groupes ou itinéraire personnalisé. Vous pouvez aussi me poser une question.`,
  startOver: "Recommencer",
  headerOnline: "En ligne",
  headerExpertSuffix: (region) => `experte de ${region}`,
  advisorAria: ({ persona, destination }) => `${persona}, conseillère de visites à ${destination}`,
  closeChat: "Fermer le chat",
  typingAria: (persona) => `${persona} est en train d'écrire`,
  inputPlaceholder: (persona) => `Écrire à ${persona}…`,
  inputAria: (persona) => `Écrire à ${persona}`,
  sendAria: "Envoyer le message",
  bookNow: "Réserver",
  bookDirect: "Réservation directe",
  giftCard: "Carte cadeau",
  talkTo: (operator) => `Parler à ${operator}`,
  giftEyebrow: "Carte cadeau",
  giftHeading: "Pas encore prêt à réserver ? Offrez l'expérience.",
  giftBody: (giftProvider) =>
    `Le bénéficiaire choisit la visite, la date et le rythme — sans expiration. L'achat et la remise sont gérés en toute sécurité sur ${giftProvider}.`,
  giftCta: "Acheter une carte cadeau →",
  escConnecting: (operator) => `Mise en relation avec ${operator}`,
  escHeading: "Votre conversation, prête à envoyer",
  escWhatsApp: (operator) => `Écrire à ${operator} sur WhatsApp`,
  escInterestedIn: (tourName) => `intéressé par ${tourName}`,
  escGuestEnquiry: (brand) => `Demande d'un client de ${brand}`,
  escMessage: ({ operator, persona, brand, summary }) =>
    `Bonjour ${operator}, ${persona} m'envoie de la part de ${brand}.\n\n${summary}\n\nPourriez-vous m'aider avec les détails ?`,
};

const ar: ChatCopy = {
  greeting: ({ persona, destination, operator }) =>
    `مرحبًا! أنا ${persona}، خبيرتك في ${destination}. بضعة أسئلة سريعة وسأرشدك إلى الجولة الخاصة المثالية مع ${operator}.`,
  questionDuration: (destination) => `كم من الوقت ستقضي في ${destination}؟`,
  questionInterest: (region) => `ما الذي يجذبك إلى ${region}؟`,
  questionGroup: "ومن المسافر؟",
  durationLabels: {
    "few-hours": "بضع ساعات فقط",
    "1-2-days": "يوم إلى يومين",
    "3-plus": "3 أيام أو أكثر",
    "day-trip": "رحلة يوم من مكان آخر",
  },
  interestLabels: {
    history: "التاريخ والعمارة",
    food: "الطعام والنبيذ",
    daytrip: "رحلة يوم أبعد",
    surprise: "فاجئني",
  },
  groupLabels: {
    solo: "أنا فقط",
    couple: "ثنائي",
    family: "عائلة مع أطفال",
    group: "مجموعة",
  },
  recommendLeadOne: "بناءً على ذلك، إليك الجولة التي أحجزها أولًا:",
  recommendLeadTwo: "بناءً على ذلك، إليك الجولتين اللتين أحجزهما أولًا:",
  tapInstruction: (operator) =>
    `اضغط «احجز الآن» للحجز الفوري عبر الإنترنت، أو «حجز مباشر» للجولات الخاصة، أو «تحدّث إلى ${operator}» لأي طلب مخصص — التواريخ أو المجموعات أو مسار مخصص. ويمكنك أيضًا أن تسألني سؤالًا.`,
  startOver: "ابدأ من جديد",
  headerOnline: "متصل",
  headerExpertSuffix: (region) => `خبيرة ${region}`,
  advisorAria: ({ persona, destination }) => `${persona}، مستشارة جولات ${destination}`,
  closeChat: "إغلاق المحادثة",
  typingAria: (persona) => `${persona} تكتب`,
  inputPlaceholder: (persona) => `راسل ${persona}…`,
  inputAria: (persona) => `راسل ${persona}`,
  sendAria: "إرسال الرسالة",
  bookNow: "احجز الآن",
  bookDirect: "حجز مباشر",
  giftCard: "بطاقة هدية",
  talkTo: (operator) => `تحدّث إلى ${operator}`,
  giftEyebrow: "بطاقة هدية",
  giftHeading: "لست مستعدًا للحجز بعد؟ اهدِ التجربة.",
  giftBody: (giftProvider) =>
    `يختار المستلم الجولة والتاريخ والوتيرة — دون انتهاء صلاحية. تتم عملية الشراء والتسليم بأمان عبر ${giftProvider}.`,
  giftCta: "اشترِ بطاقة هدية →",
  escConnecting: (operator) => `جارٍ التواصل مع ${operator}`,
  escHeading: "محادثتك جاهزة للإرسال",
  escWhatsApp: (operator) => `راسل ${operator} عبر واتساب`,
  escInterestedIn: (tourName) => `مهتم بـ ${tourName}`,
  escGuestEnquiry: (brand) => `استفسار عميل من ${brand}`,
  escMessage: ({ operator, persona, brand, summary }) =>
    `مرحبًا ${operator}، أرسلتني ${persona} من ${brand}.\n\n${summary}\n\nهل يمكنك مساعدتي في التفاصيل؟`,
};

const COPY: Record<Locale, ChatCopy> = { en, es, fr, ar };

/** Returns the chat shell copy for a locale, defaulting to English. */
export function getChatCopy(locale: string): ChatCopy {
  return COPY[locale as Locale] ?? en;
}
