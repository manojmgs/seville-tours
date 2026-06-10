export type Locale = "en" | "es" | "fr" | "ar";

export const supportedLocales: Locale[] = ["en", "es", "fr", "ar"];

export type LocaleDirection = "ltr" | "rtl";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type SiteCopy = {
  shared: {
    home: string;
    back: string;
    backToPrevious: string;
    backToTour: string;
    top: string;
    tours: string;
    contact: string;
    planTrip: string;
    exploreTours: string;
    whatsappCarlos: string;
    browse: string;
    requestLuxuryPlanning: string;
    requestLuxuryProposal: string;
    startLuxuryPlanning: string;
    requestAvailabilityPricing: string;
    bookYourTour: string;
    openSecureBooking: string;
    returnToTourPage: string;
    contactCarlos: string;
    chatWithCarlos: string;
    openWhatsAppWithCarlos: string;
    emailCarlos: string;
    privateByDefault: string;
    featuredTours: string;
    fromSeville: string;
    luxuryByRequest: string;
    submitForm: string;
    startConversation: string;
    whatToAskAbout: string;
    preferToKeepBrowsingFirst: string;
    backToHomepage: string;
    askAboutSpainPlanning: string;
    terms: string;
    requestDrafted: string;
    sending: string;
    viewTour: string;
    viewDayTrip: string;
    privateRoute: string;
    customProposal: string;
    description: string;
    reviews: string;
    externalReviews: string;
    relatedHeading: string;
    selectLanguage: string;
    contactCard: {
      title: string;
      heading: {
        planTrip: string;
        giftVoucher: string;
        whatsapp: string;
        default: string;
      };
      intro: string;
      currentEnquiry: string;
      manualConfirmationTitle: string;
      manualConfirmationBody: string;
      luxuryNotesTitle: string;
      luxuryNotesBody: string;
      summaryLabels: {
        experience: string;
        duration: string;
        voucherType: string;
        amount: string;
        places: string;
        interests: string;
        name: string;
        contact: string;
        message: string;
      };
      buttons: {
        whatsapp: string;
        openWhatsApp: string;
        email: string;
      };
      aside: string[];
      browsePrompt: string;
      browseButtons: {
        homepage: string;
        planning: string;
      };
    };
  };
  home: {
    hero: {
      eyebrow: string;
      badge: string;
      titleTop: string;
      titleBottom: string;
      body: string;
      planCardTitle: string;
      planCardItems: string[];
      planCardNote: string;
      planCardCta: string;
      luxuryEyebrow: string;
      luxuryTitleTop: string;
      luxuryTitleBottom: string;
      luxuryBody: string;
      privateTrust: Array<{ title: string; body: string }>;
      luxuryTrust: Array<{ title: string; body: string }>;
      privateAsideTitle: string;
      privateAsideItems: string[];
      luxuryAsideTitle: string;
      luxuryAsideItems: string[];
    };
    sections: {
      toursHeading: string;
      toursIntro: string;
      dayTripsHeading: string;
      dayTripsIntro: string;
      luxuryHeading: string;
      luxuryIntro: string;
      luxuryItems: Array<{ title: string; body: string }>;
      luxuryAccessTitle: string;
      luxuryAccessBody: string;
      trustProof: {
        eyebrow: string;
        heading: string;
        body: string;
        cards: Array<{ source: string; rating?: string; reviews?: string; detail: string; registrationId?: string }>;
      };
    };
    footer: {
      title: string;
      body: string;
      cta: string;
    };
    featuredCards: Array<{ title: string; label: string; description: string }>;
    dayTripCards: Array<{ title: string; description: string }>;
    gift: {
      eyebrow: string;
      titleTop: string;
      titleBottom: string;
      intro: string;
      privateMode: string;
      luxuryMode: string;
      privateCardType: string;
      luxuryCardType: string;
      privateHint: string;
      luxuryHint: string;
      privateRange: string;
      luxuryRange: string;
      recipient: string;
      message: string;
      messagePlaceholder: string;
      whatsapp: string;
      privateCta: string;
      luxuryCta: string;
    };
  };
  planner: {
    title: string;
    heading: string;
    intro: string;
    modes: {
      private: string;
      luxury: string;
    };
    highlightsPrivate: string[];
    highlightsLuxury: string[];
    daysLabel: string;
    destinationsLabel: string;
    interestsLabel: string;
    groupLabel: string;
    modeLabels: {
      private: string;
      luxury: string;
    };
    summaryTitles: {
      luxury: string;
      private: string;
    };
    summaryLabels: {
      days: string;
      destinations: string;
      interests: string;
      group: string;
      note: string;
    };
    notes: {
      luxury: string;
      private: string;
    };
    ctas: {
      luxury: string;
      private: string;
      talkToCarlos: string;
    };
    footer: {
      luxury: string;
      private: string;
    };
  };
  inquiry: {
    submitForm: string;
    privateTitle: string;
    luxuryTitle: string;
    giftTitle: string;
    privateDescription: string;
    luxuryDescription: string;
    giftDescription: string;
    privateHelper: string;
    luxuryHelper: string;
    giftHelper: string;
    labels: {
      name: string;
      contact: string;
      dates: string;
      partySize: string;
      voucherAmount: string;
      recipient: string;
      delivery: string;
      budget: string;
      message: string;
    };
    placeholders: {
      name: string;
      contact: string;
      dates: string;
      partySize: string;
      voucherAmount: string;
      recipient: string;
      delivery: string;
      budget: string;
      message: string;
    };
    cta: {
      private: string;
      luxury: string;
      gift: string;
    };
    footer: string;
  };
  discover: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: Array<{ title: string; body: string }>;
    start: string;
    startBody: string;
    cta: string;
  };
  book: {
    requestRoute: string;
    luxuryRequestRoute: string;
    requestAvailabilityPricing: string;
    secureBooking: string;
    openInNewTabHint: string;
    returnToTour: string;
  };
  wordpress: {
    sevilleTours: string;
    customProposal: string;
    bookYourTour: string;
    requestAvailabilityPricing: string;
    description: string;
    reviews: string;
    externalReviews: string;
    interestedIn: string;
    viewTour: string;
  };
  returnLinks: {
    back: string;
    home: string;
    backToPrevious: string;
    backToTour: string;
  };
  topButton: string;
};
