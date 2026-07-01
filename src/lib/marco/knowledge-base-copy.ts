import type { Locale } from "@/lib/i18n/types";

/**
 * Localized answer copy for the deterministic concierge knowledge base.
 *
 * The knowledge base stays grounded and tenant-agnostic: prices/durations/names
 * come from the operator's own tour data, and operator words (operator, giftUrl)
 * are passed in as arguments. Only the surrounding phrasing is translated here.
 * Keyword *matching* is handled in {@link ./knowledge-base} and is multilingual by
 * carrying EN/ES/FR/AR trigger words per intent.
 */
export type KbCopy = {
  /** Joiner between two tour names, e.g. "A and B". */
  and: string;
  connectFit: (operator: string) => string;
  leadFamily: string;
  leadFood: string;
  leadHistory: string;
  leadDaytrip: string;
  priceIntro: string;
  pricePrivateNote: (operator: string) => string;
  bookAnswer: (operator: string) => string;
  payAnswer: (operator: string) => string;
  giftAnswer: (giftUrl: string) => string;
  cancelAnswer: (operator: string) => string;
  durationAnswer: (name: string, duration: string) => string;
  durationFallback: string;
  privateAnswer: string;
  languageAnswer: (operator: string) => string;
  escalateGeneric: (operator: string) => string;
  namedOne: (name: string) => string;
  namedTwo: (first: string, second: string) => string;
  finalEscalate: (operator: string) => string;
};

const en: KbCopy = {
  and: "and",
  connectFit: (operator) =>
    `Let me connect you with ${operator} — he'll suggest the perfect fit for that.`,
  leadFamily: "Families are very welcome — for a first visit with children I'd suggest",
  leadFood: "For food and wine, I'd start with",
  leadHistory: "For history and architecture, the essentials are",
  leadDaytrip: "For a day trip further afield, consider",
  priceIntro: "Here's what our fixed-price tours run:",
  pricePrivateNote: (operator) =>
    `\n\nPrivate tours and day trips are quoted per group — tap Book direct with us and ${operator} will send a price for your dates.`,
  bookAnswer: (operator) =>
    `For our fixed-price tours you can book and pay instantly online — tap Book now on a tour. For private tours and day trips, tap Book direct with us and ${operator} will confirm your dates personally.`,
  payAnswer: (operator) =>
    `Fixed-price tours are paid securely online at checkout. For direct bookings you can pay by Bizum or bank transfer — often just a deposit to hold your date, with the balance later. ${operator} confirms every direct booking before anything is due.`,
  giftAnswer: (giftUrl) =>
    `Gift cards are a lovely idea — the recipient picks the tour, date and pace, and there's no expiry. You can buy one here: ${giftUrl}`,
  cancelAnswer: (operator) =>
    `Cancellation and reschedule terms depend on the tour and any monument tickets involved, so I'd rather not guess. Let me connect you with ${operator} — he'll give you the exact terms for your booking.`,
  durationAnswer: (name, duration) => `The ${name} runs about ${duration}.`,
  durationFallback:
    "Tap a tour and I'll show its exact length — most city tours run a couple of hours, and day trips are a full day.",
  privateAnswer:
    "Every tour we run is private — just your group and your guide, at your own pace. Tell me what interests you and I'll suggest the best fit.",
  languageAnswer: (operator) =>
    `Tours are led by a licensed local historian. Available languages vary by date, so let me put you in touch with ${operator} to confirm for your day.`,
  escalateGeneric: (operator) =>
    `That's a good question, and I'd rather give you the exact answer than a guess. Let me connect you with ${operator}.`,
  namedOne: (name) => `Great choice — here's the ${name}:`,
  namedTwo: (first, second) => `Good picks — here are the ${first} and ${second}:`,
  finalEscalate: (operator) =>
    `I want to get this right for you. Let me connect you with ${operator}, who knows every detail first-hand.`,
};

const es: KbCopy = {
  and: "y",
  connectFit: (operator) =>
    `Deja que te conecte con ${operator} — él te sugerirá la opción perfecta para eso.`,
  leadFamily:
    "Las familias son muy bienvenidas — para una primera visita con niños te sugeriría",
  leadFood: "Para gastronomía y vino, empezaría por",
  leadHistory: "Para historia y arquitectura, lo esencial es",
  leadDaytrip: "Para una excursión más lejos, considera",
  priceIntro: "Esto es lo que cuestan nuestros tours de precio fijo:",
  pricePrivateNote: (operator) =>
    `\n\nLos tours privados y las excursiones se presupuestan por grupo — toca Reserva directa y ${operator} te enviará un precio para tus fechas.`,
  bookAnswer: (operator) =>
    `En nuestros tours de precio fijo puedes reservar y pagar al instante online — toca Reservar ahora en un tour. Para tours privados y excursiones, toca Reserva directa y ${operator} confirmará tus fechas personalmente.`,
  payAnswer: (operator) =>
    `Los tours de precio fijo se pagan de forma segura online al finalizar. Para reservas directas puedes pagar con Bizum o transferencia — a menudo solo una señal para asegurar tu fecha, con el resto después. ${operator} confirma cada reserva directa antes de cobrar nada.`,
  giftAnswer: (giftUrl) =>
    `Las tarjetas regalo son una idea preciosa — la persona elige el tour, la fecha y el ritmo, y no caducan. Puedes comprar una aquí: ${giftUrl}`,
  cancelAnswer: (operator) =>
    `Las condiciones de cancelación y cambio dependen del tour y de las entradas a monumentos, así que prefiero no adivinar. Deja que te conecte con ${operator} — él te dará las condiciones exactas de tu reserva.`,
  durationAnswer: (name, duration) => `El ${name} dura aproximadamente ${duration}.`,
  durationFallback:
    "Toca un tour y te mostraré su duración exacta — la mayoría de los tours de ciudad duran un par de horas, y las excursiones son de día completo.",
  privateAnswer:
    "Todos nuestros tours son privados — solo tu grupo y tu guía, a tu propio ritmo. Dime qué te interesa y te sugeriré la mejor opción.",
  languageAnswer: (operator) =>
    `Los tours los guía un historiador local titulado. Los idiomas disponibles varían según la fecha, así que deja que te ponga en contacto con ${operator} para confirmarlo para tu día.`,
  escalateGeneric: (operator) =>
    `Es una buena pregunta, y prefiero darte la respuesta exacta en lugar de adivinar. Deja que te conecte con ${operator}.`,
  namedOne: (name) => `Buena elección — aquí tienes el ${name}:`,
  namedTwo: (first, second) => `Buenas opciones — aquí tienes el ${first} y el ${second}:`,
  finalEscalate: (operator) =>
    `Quiero acertar contigo. Deja que te conecte con ${operator}, que conoce cada detalle de primera mano.`,
};

const fr: KbCopy = {
  and: "et",
  connectFit: (operator) =>
    `Laissez-moi vous mettre en relation avec ${operator} — il vous proposera l'option idéale pour cela.`,
  leadFamily:
    "Les familles sont les bienvenues — pour une première visite avec des enfants, je suggérerais",
  leadFood: "Pour la gastronomie et le vin, je commencerais par",
  leadHistory: "Pour l'histoire et l'architecture, l'essentiel c'est",
  leadDaytrip: "Pour une excursion plus loin, envisagez",
  priceIntro: "Voici le tarif de nos visites à prix fixe :",
  pricePrivateNote: (operator) =>
    `\n\nLes visites privées et les excursions sont sur devis par groupe — touchez Réservation directe et ${operator} vous enverra un prix pour vos dates.`,
  bookAnswer: (operator) =>
    `Pour nos visites à prix fixe, vous pouvez réserver et payer en ligne instantanément — touchez Réserver sur une visite. Pour les visites privées et les excursions, touchez Réservation directe et ${operator} confirmera vos dates personnellement.`,
  payAnswer: (operator) =>
    `Les visites à prix fixe se paient en ligne en toute sécurité au moment du paiement. Pour les réservations directes, vous pouvez payer par Bizum ou virement — souvent juste un acompte pour retenir votre date, le solde plus tard. ${operator} confirme chaque réservation directe avant tout paiement.`,
  giftAnswer: (giftUrl) =>
    `Les cartes cadeaux sont une belle idée — le bénéficiaire choisit la visite, la date et le rythme, sans expiration. Vous pouvez en acheter une ici : ${giftUrl}`,
  cancelAnswer: (operator) =>
    `Les conditions d'annulation et de report dépendent de la visite et des billets de monuments, donc je préfère ne pas deviner. Laissez-moi vous mettre en relation avec ${operator} — il vous donnera les conditions exactes de votre réservation.`,
  durationAnswer: (name, duration) => `La visite ${name} dure environ ${duration}.`,
  durationFallback:
    "Touchez une visite et je vous montrerai sa durée exacte — la plupart des visites de ville durent quelques heures, et les excursions durent une journée entière.",
  privateAnswer:
    "Toutes nos visites sont privées — juste votre groupe et votre guide, à votre rythme. Dites-moi ce qui vous intéresse et je vous proposerai la meilleure option.",
  languageAnswer: (operator) =>
    `Les visites sont menées par un historien local diplômé. Les langues disponibles varient selon la date, alors laissez-moi vous mettre en contact avec ${operator} pour confirmer pour votre journée.`,
  escalateGeneric: (operator) =>
    `C'est une bonne question, et je préfère vous donner la réponse exacte plutôt qu'une supposition. Laissez-moi vous mettre en relation avec ${operator}.`,
  namedOne: (name) => `Excellent choix — voici la visite ${name} :`,
  namedTwo: (first, second) => `De bons choix — voici ${first} et ${second} :`,
  finalEscalate: (operator) =>
    `Je veux que ce soit parfait pour vous. Laissez-moi vous mettre en relation avec ${operator}, qui connaît chaque détail de première main.`,
};

const ar: KbCopy = {
  and: "و",
  connectFit: (operator) =>
    `دعني أوصلك بـ ${operator} — سيقترح لك الخيار المثالي لذلك.`,
  leadFamily: "العائلات مرحّب بها كثيرًا — لأول زيارة مع الأطفال أقترح",
  leadFood: "للطعام والنبيذ، سأبدأ بـ",
  leadHistory: "للتاريخ والعمارة، الأساسيات هي",
  leadDaytrip: "لرحلة يوم أبعد، فكّر في",
  priceIntro: "إليك أسعار جولاتنا ذات السعر الثابت:",
  pricePrivateNote: (operator) =>
    `\n\nالجولات الخاصة ورحلات اليوم تُسعّر لكل مجموعة — اضغط «حجز مباشر» وسيرسل لك ${operator} سعرًا لتواريخك.`,
  bookAnswer: (operator) =>
    `لجولاتنا ذات السعر الثابت يمكنك الحجز والدفع فورًا عبر الإنترنت — اضغط «احجز الآن» على أي جولة. للجولات الخاصة ورحلات اليوم، اضغط «حجز مباشر» وسيؤكد ${operator} تواريخك شخصيًا.`,
  payAnswer: (operator) =>
    `الجولات ذات السعر الثابت تُدفع بأمان عبر الإنترنت عند الدفع. للحجوزات المباشرة يمكنك الدفع عبر Bizum أو تحويل بنكي — غالبًا عربون فقط لتثبيت تاريخك، والباقي لاحقًا. يؤكد ${operator} كل حجز مباشر قبل استحقاق أي مبلغ.`,
  giftAnswer: (giftUrl) =>
    `بطاقات الهدايا فكرة رائعة — يختار المستلم الجولة والتاريخ والوتيرة، ودون انتهاء صلاحية. يمكنك شراء واحدة هنا: ${giftUrl}`,
  cancelAnswer: (operator) =>
    `تعتمد شروط الإلغاء وإعادة الجدولة على الجولة وأي تذاكر معالم، لذا أفضّل ألا أخمّن. دعني أوصلك بـ ${operator} — سيعطيك الشروط الدقيقة لحجزك.`,
  durationAnswer: (name, duration) => `تستغرق جولة ${name} حوالي ${duration}.`,
  durationFallback:
    "اضغط على جولة وسأعرض مدتها الدقيقة — معظم جولات المدينة تستغرق ساعتين تقريبًا، ورحلات اليوم تستغرق يومًا كاملًا.",
  privateAnswer:
    "كل جولاتنا خاصة — مجموعتك ومرشدك فقط، بالوتيرة التي تناسبك. أخبرني بما يهمك وسأقترح الخيار الأفضل.",
  languageAnswer: (operator) =>
    `يقود الجولات مؤرخ محلي مرخّص. تختلف اللغات المتاحة حسب التاريخ، لذا دعني أضعك على تواصل مع ${operator} لتأكيدها ليومك.`,
  escalateGeneric: (operator) =>
    `سؤال جيد، وأفضّل أن أعطيك الإجابة الدقيقة بدلًا من التخمين. دعني أوصلك بـ ${operator}.`,
  namedOne: (name) => `اختيار رائع — إليك ${name}:`,
  namedTwo: (first, second) => `اختيارات جيدة — إليك ${first} و${second}:`,
  finalEscalate: (operator) =>
    `أريد أن أوفّق في هذا من أجلك. دعني أوصلك بـ ${operator}، الذي يعرف كل التفاصيل مباشرةً.`,
};

const COPY: Record<Locale, KbCopy> = { en, es, fr, ar };

/** Returns the knowledge-base answer copy for a locale, defaulting to English. */
export function getKbCopy(locale: string): KbCopy {
  return COPY[locale as Locale] ?? en;
}
