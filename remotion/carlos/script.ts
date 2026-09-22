/**
 * Narration and scene timing for the three Carlos concept videos.
 *
 * Single source of truth: scene order, estimated duration, Spanish narration,
 * English equivalent and the on-screen caption all live here, so the voiceover
 * generator and the compositions can never drift apart.
 */

export type CarlosScene = Readonly<{
  id: string;
  /** Fallback length used when no generated audio has been measured. */
  estimatedSeconds: number;
  es: string;
  en: string;
  caption: string;
}>;

export type CarlosVideo = Readonly<{
  compositionId: string;
  slug: string;
  titleEs: string;
  scenes: readonly CarlosScene[];
}>;

export const DEMO1_SCENES: readonly CarlosScene[] = [
  {
    id: "d1-problem",
    estimatedSeconds: 9,
    es: "Una solicitud privada rara vez llega como un producto, una fecha y un número de personas perfectamente definidos.",
    en: "A private enquiry rarely arrives as a product, a date and a party size, cleanly defined.",
    caption: "Una solicitud privada rara vez llega ya definida.",
  },
  {
    id: "d1-questions",
    estimatedSeconds: 15,
    es: "Cinco preguntas sencillas, empezando por el idioma. Después de cada respuesta hay una confirmación corta, no una promesa. Privado es una preferencia, no un producto confirmado.",
    en: "Five simple questions, starting with language. Each answer gets a short acknowledgement, not a promise. Private is a preference, not a confirmed product.",
    caption: "Cinco preguntas. La primera, el idioma.",
  },
  {
    id: "d1-optional",
    estimatedSeconds: 9,
    es: "A partir de ahí, todo lo demás se ofrece, no se exige. El viajero añade solo lo que quiere contar.",
    en: "After that, everything else is offered rather than demanded. The traveller adds only what they want to.",
    caption: "Puedes parar aquí. Nada de esto es obligatorio.",
  },
  {
    id: "d1-brief",
    estimatedSeconds: 14,
    es: "El resultado es un resumen que el viajero ha revisado. Separa lo que se sabe, lo que prefiere, lo que sigue abierto y lo que hay que preguntarte a ti.",
    en: "The result is a brief the traveller has reviewed. It separates what is known, what they prefer, what is still open, and what has to be asked of you.",
    caption: "Una pregunta no es un producto. Una preferencia no es una reserva.",
  },
  {
    id: "d1-catalogue",
    estimatedSeconds: 15,
    es: "Las opciones salen solo de tu propio catálogo publicado. Cada una muestra el precio con su base, por qué aparece y qué no se ha comprobado. La disponibilidad no se consulta aquí.",
    en: "Options come only from your own published catalogue. Each shows the price with its basis, why it appeared, and what has not been checked. Availability is not looked up here.",
    caption: "Solo lo que ya publicas. Con la base del precio.",
  },
  {
    id: "d1-operator",
    estimatedSeconds: 8,
    es: "Si aparece más de un operador, el viajero elige. Cada operador confirma su propio servicio.",
    en: "If more than one operator appears, the traveller chooses. Each operator confirms their own service.",
    caption: "Cada operador confirma su propio servicio.",
  },
  {
    id: "d1-enquiry",
    estimatedSeconds: 10,
    es: "Los datos de contacto se piden solo al final, porque un profesional necesita poder responder. Nada sale del navegador.",
    en: "Contact details are asked for only at the end, because a professional needs a way to reply. Nothing leaves the browser.",
    caption: "Demostración solamente. Ningún operador ha sido contactado.",
  },
  {
    id: "d1-question",
    estimatedSeconds: 7,
    es: "¿Esto reduciría trabajo en tu última solicitud privada, o sería otro resumen más que leer?",
    en: "Would this reduce work on your last private enquiry, or would it be another summary to read?",
    caption: "¿Reduciría trabajo, o sería otro resumen más que leer?",
  },
];

export const DEMO2_SCENES: readonly CarlosScene[] = [
  {
    id: "d2-request",
    estimatedSeconds: 7,
    es: "Cuatro días, dos ciudades. Dos adultos, quizá un familiar más. Octubre. Historia y comida, a ritmo tranquilo.",
    en: "Four days, two cities. Two adults, a relative may join. The fourteenth to the eighteenth of October. History and food, at a relaxed pace.",
    caption: "Cuatro días. Sevilla y Granada.",
  },
  {
    id: "d2-days",
    estimatedSeconds: 12,
    es: "El primer día puede salir de tu catálogo. Granada es una decisión profesional tuya. Los días tres y cuatro siguen abiertos, y los dejamos abiertos.",
    en: "Day one can come from your catalogue. Granada is your professional decision. Days three and four stay open, and we leave them open.",
    caption: "Los días 3 y 4 siguen abiertos. No inventamos itinerario.",
  },
  {
    id: "d2-unknowns",
    estimatedSeconds: 10,
    es: "Antes de una propuesta responsable hay que separar lo conocido de lo abierto: ciudad por noche, número final, entradas, transporte, disponibilidad y precio.",
    en: "Before preparing a responsible proposal, the known has to be separated from the still open: city per night, final party size, tickets, transport, accommodation, availability and price.",
    caption: "Lo conocido, separado de lo que sigue abierto.",
  },
  {
    id: "d2-decision",
    estimatedSeconds: 9,
    es: "Hay tres caminos, y ninguno se elige solo: lo haces tú, lo coordinas tú, o exploras a otro profesional sin perder el contexto del viajero.",
    en: "From there, three paths, and none is chosen automatically. You can fulfil it directly, coordinate it within your existing model, or explore another professional without losing the traveller's context.",
    caption: "Tres caminos. Ninguno se elige automáticamente.",
  },
  {
    id: "d2-anonymous",
    estimatedSeconds: 11,
    es: "Si exploras a otro profesional, esa persona ve la petición, no ve quién es el viajero. Ningún operador real ha sido contactado.",
    en: "If you explore another professional, they see the request, not who the traveller is. No real operator has been contacted.",
    caption: "La petición, sin identidad del viajero.",
  },
  {
    id: "d2-interest",
    estimatedSeconds: 7,
    es: "La respuesta es prudente: potencialmente relevante. No dice aceptado, ni disponible, ni confirmado.",
    en: "The concept response is cautious: potentially relevant, the preferred afternoon still needs confirming. It does not say accepted, available or confirmed.",
    caption: "«Potencialmente relevante.» Nada más.",
  },
  {
    id: "d2-sharing",
    estimatedSeconds: 9,
    es: "El viajero decide qué se comparte. Fechas, grupo, intereses y preferencias sí. Datos de pago y documentos de identidad, no.",
    en: "The traveller decides what is shared. Dates, party size, interests and preferences yes. Payment details, identity documents and other professional conversations, no.",
    caption: "SE COMPARTE / NO SE COMPARTE",
  },
  {
    id: "d2-receipt",
    estimatedSeconds: 11,
    es: "Queda un contexto de introducción preparado, con versión y fecha. Sin reserva, sin disponibilidad, sin precio, sin acuerdo comercial y sin transmisión.",
    en: "What remains is a prepared introduction context, with a version and a date. No booking, no availability, no price, no commercial arrangement and no transmission.",
    caption: "Contexto de introducción preparado. Versionado.",
  },
  {
    id: "d2-business",
    estimatedSeconds: 11,
    es: "Quién factura, quién contrata, quién cobra y si hay comisión: eso lo acordáis los profesionales. Este concepto no responde a ninguna de esas preguntas.",
    en: "Who invoices, who contracts, who is paid and whether there is a fee: the professionals agree that. This concept answers none of it.",
    caption: "Lo comercial se queda con los profesionales.",
  },
  {
    id: "d2-question",
    estimatedSeconds: 7,
    es: "¿Esto habría ayudado en tu última solicitud multidía o derivada, o crearía otro enlace que gestionar?",
    en: "Would this have helped on your last multi-day or referred request, or would it create another link to manage?",
    caption: "¿Ayudaría, o sería otro enlace que gestionar?",
  },
];

export const DEMO3_SCENES: readonly CarlosScene[] = [
  {
    id: "d3-completed",
    estimatedSeconds: 10,
    es: "El tour termina, y ahí suele terminar también la relación. Aquí no se publica nada ni se deduce nada: el viajero decide qué pasa después.",
    en: "The tour ends, and the relationship usually ends there too. Here nothing is published and nothing is inferred: the traveller decides what happens next.",
    caption: "Sin marketing automático. El viajero decide.",
  },
  {
    id: "d3-built",
    estimatedSeconds: 14,
    es: "Esta parte ya está construida. Tu tarjeta regalo del Alcázar, cincuenta euros, trescientos sesenta y cinco días de validez. ParaUsted es la autoridad del bono. La verificación es de solo lectura y no puede canjear.",
    en: "This part is already built. Your Alcázar gift card, fifty euros, three hundred and sixty five days of validity. ParaUsted is the voucher authority. Verification is read-only and cannot redeem.",
    caption: "Base ya construida · Tarjeta regalo del Alcázar",
  },
  {
    id: "d3-truth",
    estimatedSeconds: 12,
    es: "Y conviene decirlo claro: comprar una tarjeta regalo no es reservar una fecha, no confirma disponibilidad, y el canje y la reserva son pasos distintos.",
    en: "And it is worth saying plainly: buying a gift card is not booking a date, it does not confirm availability, and redemption and booking are separate steps.",
    caption: "Comprar no es reservar. El canje es otro paso.",
  },
  {
    id: "d3-gift",
    estimatedSeconds: 10,
    es: "Quien compra y quien viaja no son la misma persona. El que la recibe decide si mira, y cuándo. La fecha sigue sin elegir.",
    en: "The buyer and the traveller are not the same person. The recipient decides whether to look, and when. The date remains unchosen.",
    caption: "Comprador y destinatario son roles distintos.",
  },
  {
    id: "d3-souvenir",
    estimatedSeconds: 12,
    es: "Lo aprobado va primero. Todo lo demás son muestras, y lo dicen. No hay carrito, no hay pago y no hay pedido completado.",
    en: "What is approved leads. Everything else is a sample, and says so. There is no cart, no payment and no completed order.",
    caption: "Nada pedido todavía · Muestras no aprobadas",
  },
  {
    id: "d3-future",
    estimatedSeconds: 13,
    es: "Y después, una dirección futura que hoy no existe: una reseña si el viajero quiere, una recomendación atribuible, un regalo, y un viaje que vuelve a empezar. Sin puntos, sin saldo y sin descuentos automáticos.",
    en: "And then a future direction that does not exist today: a review if the traveller wants, an attributable referral, a gift, and a journey that begins again. No points, no balance, no automatic discounts.",
    caption: "Dirección futura · No disponible hoy",
  },
  {
    id: "d3-question",
    estimatedSeconds: 8,
    es: "¿Qué tarea después del tour tendría suficiente valor como para dejar de hacerla manualmente?",
    en: "Which post-tour task would be valuable enough to stop doing by hand?",
    caption: "¿Qué tarea dejarías de hacer a mano?",
  },
];

export const CARLOS_VIDEOS: readonly CarlosVideo[] = [
  {
    compositionId: "CarlosDemo1JourneyBrief",
    slug: "carlos-demo-1-journey-brief-es",
    titleEs: "Mejores solicitudes privadas",
    scenes: DEMO1_SCENES,
  },
  {
    compositionId: "CarlosDemo2Collaboration",
    slug: "carlos-demo-2-collaboration-es",
    titleEs: "Colaborar sin perder el contexto",
    scenes: DEMO2_SCENES,
  },
  {
    compositionId: "CarlosDemo3ReturnLoop",
    slug: "carlos-demo-3-return-loop-es",
    titleEs: "Continuar la relación después del tour",
    scenes: DEMO3_SCENES,
  },
];
