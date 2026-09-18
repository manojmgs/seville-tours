import type { Locale } from "@/lib/i18n/types";
import type {
  DurationAnswer,
  GroupAnswer,
  InterestAnswer,
  PartyType,
  RecommendationConfirmationItem,
  RecommendationReasonCode,
  TimingPreference,
  TourFormat,
  WalkingPreference,
} from "./types";

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
  journeyBrief: {
    eyebrow: string;
    title: string;
    note: string;
    sections: {
      shared: string;
      preferences: string;
      stillOpen: string;
      operator: string;
    };
    fields: {
      destination: string;
      date: string;
      format: string;
      partyType: string;
      partySize: string;
      interests: string;
      walking: string;
      timing: string;
      suggestedTours: string;
    };
    preference: string;
    needsConfirmation: string;
    formatLabels: Record<TourFormat, string>;
    partyLabels: Record<PartyType, string>;
    walkingLabels: Record<WalkingPreference, string>;
    timingLabels: Record<TimingPreference, string>;
    openFormatQuestion: string;
    openDateQuestion: (date: string) => string;
  };
  receipt: {
    disclosure: string;
    whyFits: string;
    operatorInfo: string;
    duration: (duration: string) => string;
    operatorName: (operator: string) => string;
    bookingInfo: string;
    onlineBooking: string;
    checkDates: string;
    operatorConfirmation: string;
    noDirectBooking: string;
    source: string;
    openSource: string;
    sourceUnavailable: string;
    sourceUpdated: (date: string) => string;
    sourceDateUnavailable: string;
    stillToConfirm: string;
    reasons: Record<RecommendationReasonCode, string>;
    confirmationItems: Record<RecommendationConfirmationItem, string>;
  };
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
  journeyBrief: {
    eyebrow: "Organised context",
    title: "Your Journey Brief",
    note: "Read-only · organised from your answers",
    sections: {
      shared: "What you shared",
      preferences: "Your preferences",
      stillOpen: "Still open",
      operator: "Operator confirmation needed",
    },
    fields: {
      destination: "Destination",
      date: "Date",
      format: "Experience style",
      partyType: "Travelling as",
      partySize: "Party size",
      interests: "Interests",
      walking: "Walking preference",
      timing: "Timing preference",
      suggestedTours: "Suggested options",
    },
    preference: "Preference",
    needsConfirmation: "Needs confirmation",
    formatLabels: { private: "Private", group: "Group", undecided: "Not decided" },
    partyLabels: {
      solo: "Just me",
      couple: "A couple",
      family: "Family with kids",
      group: "A group",
      unspecified: "Not specified",
    },
    walkingLabels: {
      minimal: "Minimal",
      moderate: "Moderate",
      extended: "Extended",
      unspecified: "Not specified",
    },
    timingLabels: {
      fixed: "Fixed start time",
      flexible: "Flexible timing",
      unspecified: "Not specified",
    },
    openFormatQuestion: "Choose a private or group experience when you are ready.",
    openDateQuestion: (date) => `Confirm the exact date for “${date}”.`,
  },
  receipt: {
    disclosure: "Why this recommendation fits",
    whyFits: "Why this fits",
    operatorInfo: "Information from the operator",
    duration: (duration) => `Duration: ${duration}`,
    operatorName: (operator) => `Presented with ${operator}`,
    bookingInfo: "Booking information",
    onlineBooking: "Online booking is available.",
    checkDates: "Check dates when opening the booking flow.",
    operatorConfirmation: "Booking is handled with the operator.",
    noDirectBooking: "No live availability is shown here.",
    source: "Source and freshness",
    openSource: "Open the operator tour page",
    sourceUnavailable: "The operator source link is not available in this view.",
    sourceUpdated: (date) => `Source record updated ${date}; this is not a live availability check.`,
    sourceDateUnavailable: "The source update date is not available in this view.",
    stillToConfirm: "Still to confirm",
    reasons: {
      "daytrip-interest": "You said you wanted a day trip further afield.",
      "food-interest": "You said food and wine are part of the trip.",
      "short-visit": "You said you are only here for a few hours.",
      "family-context": "You said you are travelling with children.",
      "history-interest": "You said history and architecture draw you in.",
      "general-introduction": "This is a balanced starting point for a first recommendation.",
    },
    confirmationItems: {
      "price-unit": "Pricing unit",
      format: "Private or group format",
      availability: "Date-specific availability",
      date: "Exact date",
      "final-price": "Final price",
      inclusions: "Included services and entry fees",
    },
  },
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
  journeyBrief: {
    eyebrow: "Contexto organizado",
    title: "Tu resumen de viaje",
    note: "Solo lectura · organizado a partir de tus respuestas",
    sections: {
      shared: "Lo que has compartido",
      preferences: "Tus preferencias",
      stillOpen: "Pendiente",
      operator: "Confirmación del operador necesaria",
    },
    fields: {
      destination: "Destino",
      date: "Fecha",
      format: "Tipo de experiencia",
      partyType: "Quién viaja",
      partySize: "Tamaño del grupo",
      interests: "Intereses",
      walking: "Preferencia de caminata",
      timing: "Preferencia de horario",
      suggestedTours: "Opciones sugeridas",
    },
    preference: "Preferencia",
    needsConfirmation: "Necesita confirmación",
    formatLabels: { private: "Privada", group: "De grupo", undecided: "Sin decidir" },
    partyLabels: {
      solo: "Solo yo",
      couple: "Una pareja",
      family: "Familia con niños",
      group: "Un grupo",
      unspecified: "Sin especificar",
    },
    walkingLabels: {
      minimal: "Mínima",
      moderate: "Moderada",
      extended: "Larga",
      unspecified: "Sin especificar",
    },
    timingLabels: {
      fixed: "Hora de inicio fija",
      flexible: "Horario flexible",
      unspecified: "Sin especificar",
    },
    openFormatQuestion: "Elige una experiencia privada o de grupo cuando estés preparado.",
    openDateQuestion: (date) => `Confirma la fecha exacta: «${date}».`,
  },
  receipt: {
    disclosure: "Por qué encaja esta recomendación",
    whyFits: "Por qué encaja",
    operatorInfo: "Información del operador",
    duration: (duration) => `Duración: ${duration}`,
    operatorName: (operator) => `Presentado con ${operator}`,
    bookingInfo: "Información de reserva",
    onlineBooking: "La reserva online está disponible.",
    checkDates: "Comprueba las fechas al abrir el flujo de reserva.",
    operatorConfirmation: "La reserva se gestiona con el operador.",
    noDirectBooking: "Aquí no se muestra disponibilidad en tiempo real.",
    source: "Fuente y actualización",
    openSource: "Abrir la página del tour del operador",
    sourceUnavailable: "El enlace a la fuente del operador no está disponible aquí.",
    sourceUpdated: (date) => `Registro de la fuente actualizado el ${date}; no es una comprobación de disponibilidad en tiempo real.`,
    sourceDateUnavailable: "La fecha de actualización de la fuente no está disponible aquí.",
    stillToConfirm: "Pendiente de confirmar",
    reasons: {
      "daytrip-interest": "Has indicado que quieres una excursión más lejos.",
      "food-interest": "Has indicado que la gastronomía y el vino forman parte del viaje.",
      "short-visit": "Has indicado que solo estarás unas horas.",
      "family-context": "Has indicado que viajas con niños.",
      "history-interest": "Has indicado que te atraen la historia y la arquitectura.",
      "general-introduction": "Es un punto de partida equilibrado para una primera recomendación.",
    },
    confirmationItems: {
      "price-unit": "Unidad del precio",
      format: "Formato privado o de grupo",
      availability: "Disponibilidad para la fecha",
      date: "Fecha exacta",
      "final-price": "Precio final",
      inclusions: "Servicios y entradas incluidos",
    },
  },
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
  journeyBrief: {
    eyebrow: "Contexte organisé",
    title: "Votre résumé de voyage",
    note: "Lecture seule · organisé à partir de vos réponses",
    sections: {
      shared: "Ce que vous avez partagé",
      preferences: "Vos préférences",
      stillOpen: "Encore ouvert",
      operator: "Confirmation de l'opérateur nécessaire",
    },
    fields: {
      destination: "Destination",
      date: "Date",
      format: "Type d'expérience",
      partyType: "Voyageurs",
      partySize: "Taille du groupe",
      interests: "Centres d'intérêt",
      walking: "Préférence de marche",
      timing: "Préférence horaire",
      suggestedTours: "Options suggérées",
    },
    preference: "Préférence",
    needsConfirmation: "À confirmer",
    formatLabels: { private: "Privée", group: "En groupe", undecided: "Non défini" },
    partyLabels: {
      solo: "Moi seulement",
      couple: "Un couple",
      family: "Famille avec enfants",
      group: "Un groupe",
      unspecified: "Non précisé",
    },
    walkingLabels: {
      minimal: "Minimale",
      moderate: "Modérée",
      extended: "Longue",
      unspecified: "Non précisée",
    },
    timingLabels: {
      fixed: "Heure de début fixe",
      flexible: "Horaire flexible",
      unspecified: "Non précisé",
    },
    openFormatQuestion: "Choisissez une expérience privée ou en groupe quand vous serez prêt.",
    openDateQuestion: (date) => `Confirmez la date exacte : « ${date} ».`,
  },
  receipt: {
    disclosure: "Pourquoi cette recommandation vous convient",
    whyFits: "Pourquoi cette visite vous convient",
    operatorInfo: "Informations de l'opérateur",
    duration: (duration) => `Durée : ${duration}`,
    operatorName: (operator) => `Présenté avec ${operator}`,
    bookingInfo: "Informations de réservation",
    onlineBooking: "La réservation en ligne est disponible.",
    checkDates: "Vérifiez les dates en ouvrant le parcours de réservation.",
    operatorConfirmation: "La réservation est gérée avec l'opérateur.",
    noDirectBooking: "Aucune disponibilité en temps réel n'est affichée ici.",
    source: "Source et actualisation",
    openSource: "Ouvrir la page de la visite",
    sourceUnavailable: "Le lien vers la source de l'opérateur n'est pas disponible ici.",
    sourceUpdated: (date) => `Enregistrement de la source mis à jour le ${date} ; ceci ne vérifie pas la disponibilité en temps réel.`,
    sourceDateUnavailable: "La date de mise à jour de la source n'est pas disponible ici.",
    stillToConfirm: "Encore à confirmer",
    reasons: {
      "daytrip-interest": "Vous avez indiqué vouloir une excursion plus loin.",
      "food-interest": "Vous avez indiqué que la gastronomie et le vin comptent pour vous.",
      "short-visit": "Vous avez indiqué ne rester que quelques heures.",
      "family-context": "Vous avez indiqué voyager avec des enfants.",
      "history-interest": "Vous avez indiqué être attiré par l'histoire et l'architecture.",
      "general-introduction": "C'est un point de départ équilibré pour une première recommandation.",
    },
    confirmationItems: {
      "price-unit": "Unité du prix",
      format: "Format privé ou en groupe",
      availability: "Disponibilité à la date choisie",
      date: "Date exacte",
      "final-price": "Prix final",
      inclusions: "Services et entrées inclus",
    },
  },
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
  journeyBrief: {
    eyebrow: "سياق منظم",
    title: "ملخص رحلتك",
    note: "للقراءة فقط · منظم من إجاباتك",
    sections: {
      shared: "ما شاركته",
      preferences: "تفضيلاتك",
      stillOpen: "ما زال مفتوحًا",
      operator: "تأكيد المشغل مطلوب",
    },
    fields: {
      destination: "الوجهة",
      date: "التاريخ",
      format: "نمط التجربة",
      partyType: "المسافرون",
      partySize: "حجم المجموعة",
      interests: "الاهتمامات",
      walking: "تفضيل المشي",
      timing: "تفضيل التوقيت",
      suggestedTours: "الخيارات المقترحة",
    },
    preference: "تفضيل",
    needsConfirmation: "يحتاج إلى تأكيد",
    formatLabels: { private: "خاصة", group: "جماعية", undecided: "غير محدد" },
    partyLabels: {
      solo: "أنا فقط",
      couple: "شخصان",
      family: "عائلة مع أطفال",
      group: "مجموعة",
      unspecified: "غير محدد",
    },
    walkingLabels: {
      minimal: "قليل",
      moderate: "متوسط",
      extended: "ممتد",
      unspecified: "غير محدد",
    },
    timingLabels: {
      fixed: "وقت بدء ثابت",
      flexible: "توقيت مرن",
      unspecified: "غير محدد",
    },
    openFormatQuestion: "اختر تجربة خاصة أو جماعية عندما تكون مستعدًا.",
    openDateQuestion: (date) => `أكد التاريخ الدقيق: «${date}».`,
  },
  receipt: {
    disclosure: "لماذا تناسبك هذه التوصية",
    whyFits: "لماذا تناسبك",
    operatorInfo: "معلومات من المشغل",
    duration: (duration) => `المدة: ${duration}`,
    operatorName: (operator) => `مقدمة مع ${operator}`,
    bookingInfo: "معلومات الحجز",
    onlineBooking: "الحجز عبر الإنترنت متاح.",
    checkDates: "تحقق من التواريخ عند فتح مسار الحجز.",
    operatorConfirmation: "يتم تنسيق الحجز مع المشغل.",
    noDirectBooking: "لا يتم عرض التوافر المباشر هنا.",
    source: "المصدر وحداثة المعلومات",
    openSource: "افتح صفحة الجولة لدى المشغل",
    sourceUnavailable: "رابط مصدر المشغل غير متاح في هذا العرض.",
    sourceUpdated: (date) => `تم تحديث سجل المصدر في ${date}؛ وهذا ليس فحصًا مباشرًا للتوافر.`,
    sourceDateUnavailable: "تاريخ تحديث المصدر غير متاح في هذا العرض.",
    stillToConfirm: "ما يحتاج إلى تأكيد",
    reasons: {
      "daytrip-interest": "ذكرت أنك تريد رحلة يوم إلى مكان أبعد.",
      "food-interest": "ذكرت أن الطعام والنبيذ جزء من الرحلة.",
      "short-visit": "ذكرت أنك ستبقى بضع ساعات فقط.",
      "family-context": "ذكرت أنك تسافر مع أطفال.",
      "history-interest": "ذكرت أن التاريخ والعمارة يجذبانك.",
      "general-introduction": "هذه نقطة بداية متوازنة للتوصية الأولى.",
    },
    confirmationItems: {
      "price-unit": "وحدة السعر",
      format: "النمط الخاص أو الجماعي",
      availability: "التوافر في التاريخ المحدد",
      date: "التاريخ الدقيق",
      "final-price": "السعر النهائي",
      inclusions: "الخدمات ورسوم الدخول المشمولة",
    },
  },
};

const COPY: Record<Locale, ChatCopy> = { en, es, fr, ar };

/** Returns the chat shell copy for a locale, defaulting to English. */
export function getChatCopy(locale: string): ChatCopy {
  return COPY[locale as Locale] ?? en;
}
