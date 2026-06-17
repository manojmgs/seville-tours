import { enCopy } from "./en";
import { mergeCopy } from "../merge";
import type { SiteCopy } from "../types";

export const esCopy: SiteCopy = mergeCopy(enCopy, {
  shared: {
    home: "Inicio",
    back: "Atrás",
    backToPrevious: "Volver",
    backToTour: "Volver al tour",
    top: "Arriba",
    contact: "Contacto",
    giftCard: "Tarjeta regalo",
    planTrip: "Planificar viaje",
    exploreTours: "Explorar tours",
    whatsappCarlos: "WhatsApp con Carlos",
    browse: "Explorar",
    requestLuxuryPlanning: "Solicitar planificación de lujo",
    requestLuxuryProposal: "Solicitar una propuesta de lujo",
    startLuxuryPlanning: "Empezar planificación de lujo",
    requestAvailabilityPricing: "Solicitar disponibilidad y precio",
    bookYourTour: "Reservar tour",
    openSecureBooking: "Abrir reserva segura en una pestaña nueva",
    returnToTourPage: "Volver a la página del tour",
    contactCarlos: "Contactar con Carlos",
    chatWithCarlos: "Chatear con Carlos por WhatsApp",
    openWhatsAppWithCarlos: "Abrir WhatsApp con Carlos",
    emailCarlos: "Email contact@sevilletoursco.com",
    privateByDefault: "Privado por defecto",
    featuredTours: "Tours destacados",
    fromSeville: "Desde Sevilla",
    luxuryByRequest: "Lujo bajo petición",
    submitForm: "Enviar formulario",
    startConversation: "Empezar la conversación",
    whatToAskAbout: "Sobre qué preguntar",
    preferToKeepBrowsingFirst: "¿Prefieres seguir navegando primero?",
    backToHomepage: "Volver al inicio",
    askAboutSpainPlanning: "Preguntar por planificación de España",
    terms: "Condiciones",
    requestDrafted: "Solicitud preparada",
    sending: "ABRIENDO…",
    viewTour: "Ver tour →",
    viewDayTrip: "Ver excursión →",
    privateRoute: "Ruta privada",
    customProposal: "Propuesta a medida",
    description: "Descripción",
    reviews: "Reseñas",
    externalReviews: "Las integraciones de reseñas externas llegarán más adelante.",
    relatedHeading: "También te puede interesar",
    selectLanguage: "Idioma",
    contactCard: {
      title: "Contactar con Carlos",
      heading: {
        planTrip: "Solicitud de planificación",
        giftVoucher: "Solicitud de tarjeta regalo",
        whatsapp: "WhatsApp con Carlos",
        default: "Tours privados, propuestas de lujo y planificación cuidada.",
      },
      intro:
        "Carlos confirma los detalles manualmente para tours privados, planificación de lujo y consultas por WhatsApp. Las compras de tarjetas regalo se completan de forma segura en ParaUsted. Esta página mantiene la Fase 0 sencilla preservando las rutas reales y el contacto directo.",
      currentEnquiry: "Consulta actual",
      manualConfirmationTitle: "Confirmación manual",
      manualConfirmationBody:
        "Carlos revisa estos detalles manualmente y confirma precios, entrega, derivación a WhatsApp o siguientes pasos personalmente. No hay ninguna compra ficticia ni estado de reserva falso en esta ruta.",
      luxuryNotesTitle: "Notas de planificación de lujo",
      luxuryNotesBody:
        "Pregunta por llegadas al aeropuerto, entrega en hotel, transporte refinado, horarios de restaurantes y cómo Sevilla puede conectarse con una ruta más amplia por España.",
      summaryLabels: {
        experience: "Experiencia",
        duration: "Duración",
        voucherType: "Tipo de tarjeta",
        amount: "Importe",
        places: "Lugares",
        interests: "Intereses",
        name: "Nombre",
        contact: "Contacto",
        message: "Mensaje",
      },
      buttons: {
        whatsapp: "Chatear con Carlos por WhatsApp",
        openWhatsApp: "Abrir WhatsApp con Carlos",
        email: "Email contact@sevilletoursco.com",
      },
      aside: [
        "Tours privados en Sevilla con guía historiador con licencia.",
        "Excursiones de lujo que necesitan confirmar precio y disponibilidad.",
        "Las tarjetas regalo se compran de forma segura en ParaUsted.",
        "Planificación a medida de Andalucía o España que empieza con una conversación.",
      ],
      browsePrompt: "¿Prefieres seguir navegando primero?",
      browseButtons: {
        homepage: "Volver al inicio",
        planning: "Preguntar por planificación de España",
      },
    },
  },
  home: {
    hero: {
      eyebrow: "Tours privados en Sevilla y Andalucía",
      badge: "Carlos · Guía historiador con licencia",
      titleTop: "Sevilla & Andalucía,",
      titleBottom: "siempre privado.",
      body:
        "Tours privados en Sevilla, excursiones a Córdoba, Granada y Ronda - guiadas por Carlos, guía historiador con licencia.",
      planCardTitle: "Un resumen en cinco pasos para viajes privados o de lujo.",
      planCardItems: [
        "Elige tours privados o una estancia de lujo totalmente a medida.",
        "Añade duración, lugares e intereses en menos de un minuto.",
        "Envía detalles parciales a Carlos en cuanto tengas suficiente.",
      ],
      planCardNote:
        "El botón Planificar viaje arriba a la derecha abre una hoja inferior premium en móvil y un modal centrado en escritorio.",
      planCardCta: "Solicitar planificación de lujo",
      luxuryEyebrow: "Planificación personalizada de Andalucía",
      luxuryTitleTop: "Andalucía,",
      luxuryTitleBottom: "diseñada a tu medida.",
      luxuryBody: "Chóferes privados, restaurantes seleccionados, ritmo flexible y excursiones a medida diseñadas a tu ritmo.",
      privateTrust: [
        { title: "Guía oficial", body: "Historiador con licencia" },
        { title: "Ritmo privado", body: "Sin grupos masificados" },
        { title: "Excursiones de día", body: "Granada · Córdoba · Ronda" },
        { title: "4.9 reseñas", body: "Valorado por viajeros" },
      ],
      luxuryTrust: [
        { title: "Bienvenida en aeropuerto", body: "Aeropuerto · hotel · estación" },
        { title: "Chófer disponible", body: "Mercedes a petición" },
        { title: "Planificación gastronómica", body: "Mesas locales · noches en azoteas" },
        { title: "Itinerario flexible", body: "Diseñado a tu ritmo" },
      ],
      privateAsideTitle: "Sevilla como base, excursiones por Andalucía",
      privateAsideItems: ["Alcázar y Catedral", "Granada · Córdoba · Ronda", "Ritmo privado", "Historiador con licencia"],
      luxuryAsideTitle: "Propuesta a medida",
      luxuryAsideItems: ["Bienvenida en aeropuerto", "Opciones de chófer", "Planificación gastronómica", "Itinerario flexible"],
    },
    sections: {
      toursHeading: "Tours privados en Sevilla",
      toursIntro:
        "Las tarjetas redondeadas y pensadas para móvil mantienen claras las rutas de reserva mientras el lenguaje visual sigue siendo premium y sereno.",
      dayTripsHeading: "Excursiones privadas desde Sevilla",
      dayTripsIntro:
        "Algunas salidas se pueden reservar online. Otras, especialmente las jornadas largas de lujo, empiezan con una solicitud de disponibilidad y precio.",
      luxuryHeading: "Un plan personal de Andalucía moldeado a tu ritmo.",
      luxuryIntro:
        "El lujo significa que Carlos ayuda a estructurar el día alrededor del transporte, restaurantes, tiempo para compras, pausas tranquilas, profundidad cultural y cambios flexibles. Los huéspedes pueden empezar con un tour privado y pasar luego a un plan de lujo más completo cuando estén claras las fechas, el ritmo y las preferencias.",
      luxuryItems: [
        { title: "Ritmo con chófer", body: "Planificación flexible del transporte y margen de tiempo para un día más tranquilo." },
        { title: "Restauración y compras", body: "Horarios de restaurantes, paradas premium y tiempo para mirar sin prisas." },
        { title: "Ritmo a medida", body: "Carlos adapta el día a la energía, los intereses y la profundidad histórica." },
      ],
      luxuryAccessTitle: "Acceso de lujo",
      luxuryAccessBody:
        "Llegadas al aeropuerto, entrega en hotel, puentes gastronómicos y ritmos por toda España empiezan con un solo mensaje a Carlos.",
      trustProof: {
        eyebrow: "TRUSTED BY TRAVELLERS",
        heading: "Reseñado por viajeros. Registrado en Andalucía.",
        body: "Seville Tours Co. tiene reseñas en plataformas públicas de viaje y está inscrita como actividad guiada oficial en Andalucía.",
        cards: [
          { source: "Google", rating: "5.0", reviews: "308 reviews", detail: "Agencia de visitas turísticas en Sevilla" },
          { source: "Tripadvisor", rating: "5.0", reviews: "211 reviews", detail: "#30 de 657 Tours y Actividades en Sevilla" },
          { source: "Viator", rating: "4.9", reviews: "43 reviews", detail: "41 reseñas de cinco estrellas" },
          { source: "Andalucía", detail: "Registro oficial de actividades guiadas", registrationId: "AIAT/SE/00053-6" },
        ],
      },
    },
    footer: {
      title: "Seville Tours",
      body: "Viajes privados y de lujo desde Sevilla.",
      cta: "Empezar con un mensaje",
    },
    featuredCards: [
      { title: "Visita Guiada al Alcázar de Sevilla", label: "Más popular", description: "Salta las colas y explora el Real Alcázar con un guía historiador oficial." },
      { title: "Visita Guiada a la Catedral de Sevilla", label: "Clásica", description: "Descubre la Catedral, la Giralda y el corazón histórico de Sevilla." },
      { title: "Tour Principales Monumentos de Sevilla", label: "Primer día", description: "Un paseo privado de orientación por las historias esenciales y los rincones de Sevilla." },
      { title: "Tour Privado de Tapas en Sevilla", label: "Gastronomía e historia", description: "Descubre Sevilla con una perspectiva histórica local y un ritmo privado y relajado." },
    ],
    dayTripCards: [
      { title: "Granada y la Alhambra", description: "Una excursión privada desde Sevilla a Granada y la Alhambra." },
      { title: "Excursión Privada a Córdoba", description: "Visita Córdoba y la Mezquita desde Sevilla con guía privado." },
      { title: "Ronda y los Pueblos Blancos", description: "Explora Ronda y los pueblos blancos en una excursión privada desde Sevilla." },
    ],
    gift: {
      eyebrow: "Regala Andalucía",
      titleTop: "Experiencias",
      titleBottom: "para regalar",
      intro: "El regalo perfecto para alguien que lo tiene todo — excepto esto.",
      previewBadge: "Tarjeta regalo",
      previewType: "✧ Experiencias en Sevilla",
      previewHint: "Tours y degustaciones por Sevilla y Andalucía.",
      fixedTitle: "Importe fijo de regalo",
      fixedDescription: "Elige una tarjeta regalo lista para una experiencia concreta.",
      fixedSkus: [
        { title: "Visita guiada a la Catedral de Sevilla", price: "€40" },
        { title: "Visita guiada al Real Alcázar de Sevilla", price: "€50" },
        { title: "Tarjeta regalo flexible de Sevilla", price: "€65" },
      ],
      flexibleTitle: "Valor flexible de regalo",
      flexibleDescription: "Elige un valor flexible de tarjeta regalo para tours compatibles.",
      luxuryTitle: "Regalo de lujo y privado",
      luxuryDescription: "Inicia tu regalo de lujo en ParaUsted; la planificación privada se coordina con Seville Tours Co. después de la compra.",
      paraustedCta: "Comprar tarjeta regalo",
      terms:
        "Las compras de tarjetas regalo se completan de forma segura en ParaUsted, donde se muestran las condiciones del bono, la validez, la gestión de reembolsos y los detalles de canje antes de la compra. Los detalles de los regalos de lujo y privados se coordinan con Seville Tours Co. después de la compra.",
    },
  },
  planner: {
    title: "Planificar un viaje",
    heading: "Diseña un viaje de alto nivel antes de pedir fechas.",
    intro:
      "Usa este planificador para dar forma a tu ruta, marcar el ritmo y decidir cuándo Sevilla debe seguir siendo privada o convertirse en parte de un itinerario de lujo más amplio por Andalucía.",
    modes: { private: "Tours privados", luxury: "Planificación de lujo" },
    highlightsPrivate: [
      "Ritmo guiado por un historiador con licencia",
      "Ruta centrada en Sevilla con extensiones fáciles de un día",
      "Un traspaso de reserva limpio cuando el tour se puede reservar directamente",
    ],
    highlightsLuxury: [
      "Llegadas al aeropuerto, entrega en hotel y ritmo con chófer",
      "Puentes gastronómicos, pausas premium y planificación por España",
      "Un único mensaje a Carlos con toda tu ruta, en formato de concierge",
    ],
    daysLabel: "¿Cuántos días?",
    destinationsLabel: "Destinos",
    interestsLabel: "Intereses",
    groupLabel: "¿Quién viaja?",
    modeLabels: { private: "Plan privado", luxury: "Escapada de lujo" },
    summaryTitles: {
      luxury: "Un resumen estilo concierge que parece listo para enviar.",
      private: "Un resumen limpio que mantiene la conversación enfocada.",
    },
    summaryLabels: {
      days: "Días",
      destinations: "Destinos",
      interests: "Intereses",
      group: "Grupo",
      note: "Nota de planificación",
    },
    notes: {
      luxury:
        "El modo de lujo añade tiempos de llegada, entrega en hotel, puentes gastronómicos y una vía de respuesta estilo concierge.",
      private:
        "El modo privado mantiene la ruta ligera, guiada por un historiador y fácil de convertir en una reserva.",
    },
    ctas: { luxury: "Empezar planificación de lujo", private: "Enviar plan privado", talkToCarlos: "Hablar con Carlos" },
    footer: {
      luxury:
        "Este planificador está pensado para sentirse como un verdadero traspaso de concierge: claro, tranquilo y listo para convertirse en una propuesta a medida.",
      private:
        "Úsalo para mantener la ruta privada sencilla y al mismo tiempo darle a Carlos suficiente detalle para responder bien.",
    },
  },
  inquiry: {
    submitForm: "Enviar formulario",
    privateTitle: "Solicitud de tour privado",
    luxuryTitle: "Solicitud de planificación de lujo",
    giftTitle: "Solicitud de tarjeta regalo",
    privateDescription:
      "Usa este formulario para enviar a Carlos un resumen limpio del tour privado con la ruta, las fechas y cualquier detalle práctico.",
    luxuryDescription:
      "Usa este formulario para enviar a Carlos un resumen estilo concierge con las fechas, el tamaño del grupo y los detalles de lujo que más importan.",
    giftDescription:
      "Las compras de tarjetas regalo se completan de forma segura en ParaUsted. Explora las opciones de tarjeta regalo, elige un importe y completa la compra en la página de comercio de ParaUsted.",
    privateHelper: "Útil para tours por Sevilla, excursiones de un día y planificación a medida.",
    luxuryHelper:
      "Es el lugar adecuado para llegadas al aeropuerto, entrega en hotel, tiempos de cena y planificación amplia por España.",
    giftHelper:
      "Los importes habituales son €5, €50, €100, €200, €300 y cantidades personalizadas.",
    labels: {
      name: "Tu nombre",
      contact: "WhatsApp o email",
      dates: "Fechas o horario",
      partySize: "Tamaño del grupo",
      voucherAmount: "Importe de la tarjeta",
      recipient: "Destinatario",
      delivery: "Preferencia de entrega",
      budget: "Presupuesto o notas",
      message: "Mensaje para Carlos",
    },
    placeholders: {
      name: "Carlos puede dirigirse a ti por tu nombre",
      contact: "Teléfono, WhatsApp o email",
      dates: "Fechas de llegada, mes preferido o flexibilidad",
      partySize: "Pareja, familia de 4, grupo de 8",
      voucherAmount: "50, 100, 250, personalizado...",
      recipient: "¿Para quién es la tarjeta?",
      delivery: "WhatsApp, email o impresa",
      budget: "Presupuesto de concierge de lujo o cualquier nota importante",
      message: "Cuéntale a Carlos qué es lo más importante...",
    },
    cta: {
      private: "Enviar solicitud privada",
      luxury: "Enviar solicitud de lujo",
      gift: "Enviar solicitud de tarjeta regalo",
    },
    footer:
      "El envío abre WhatsApp con tu solicitud completa. También puedes dejar la pestaña abierta y seguir ajustando el plan.",
  },
  discover: {
    eyebrow: "Descubre España con un historiador",
    title: "Planificación a medida de Andalucía y España que comienza en Sevilla.",
    intro:
      "Esta página Fase 0 es un punto de entrada sencillo para viajeros que quieren que Carlos diseñe una ruta más amplia que un solo tour. Piensa en recorridos privados por Sevilla, excursiones conectadas, ritmo según prioridades culturales y una cadencia más personal por el sur de España.",
    cards: [
      { title: "Ritmo privado", body: "Construye una ruta alrededor de tus intereses en lugar de adaptarte a un horario de grupo." },
      { title: "Contexto con historiador", body: "Mantén Sevilla, Granada, Córdoba y otras paradas unidas por una narrativa histórica real." },
      { title: "Logística a medida", body: "Empieza con una conversación sobre fechas, transporte y el nivel de refinamiento o relajación que debe tener la ruta." },
    ],
    start: "Empezar la conversación",
    startBody:
      "Dile a Carlos dónde te alojas, qué lugares importan más y si necesitas un tour fijo, una propuesta personalizada o un itinerario más amplio por España.",
    cta: "Empezar planificación de lujo",
  },
  book: {
    requestRoute: "Ruta de solicitud",
    luxuryRequestRoute: "Ruta de solicitud de lujo",
    requestAvailabilityPricing: "Solicitar disponibilidad y precio",
    secureBooking: "Reserva segura",
    openInNewTabHint:
      "Si la reserva segura no carga dentro de la página, ábrela en una pestaña nueva y continúa allí.",
    returnToTour: "Volver al tour",
  },
  wordpress: {
    sevilleTours: "Seville Tours Co.",
    customProposal: "Propuesta a medida",
    bookYourTour: "Reservar tour",
    requestAvailabilityPricing: "Solicitar disponibilidad y precio",
    description: "Descripción",
    reviews: "Reseñas",
    externalReviews: "Las integraciones de reseñas externas llegarán más adelante.",
    interestedIn: "También te puede interesar",
    viewTour: "Ver tour →",
  },
  returnLinks: { back: "Atrás", home: "Inicio", backToPrevious: "Volver", backToTour: "Volver al tour" },
  topButton: "Arriba",
});
