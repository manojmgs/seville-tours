export type JourneyStage =
  | "planning"
  | "comparing"
  | "readyToBook"
  | "booked"
  | "preTripMonitoring";

export type ExpectedOutcome =
  | "bookableExperience"
  | "operatorConfirmation"
  | "informationalUpdate"
  | "noSafeMatch";

export type ExpectedRecommendationType =
  | "fixedExperience"
  | "customPrivateDirection"
  | "publicOperatorPossibility"
  | "officialEvent";

export type TravellerAction =
  | "checkDates"
  | "bookNow"
  | "continueRefining"
  | "saveForLater"
  | "reject"
  | "selectOperator"
  | "selectMultipleOperators"
  | "reviewSharing"
  | "explicitSend"
  | "openOfficialSource"
  | "dismiss"
  | "stop";

export type ProhibitedClaim =
  | "automaticLead"
  | "inferredPartnership"
  | "inventedAvailability"
  | "inventedPriceUnit"
  | "combinedPrivatePackage"
  | "walkingSuitability"
  | "automaticItineraryModification"
  | "automaticOperatorSend";

export type RecognisedContext = {
  destinations: readonly string[];
  interests?: readonly string[];
  partySize?: number;
  dateText?: string;
  formatPreference?: "private";
  pacePreference?: "relaxed";
  walkingPreference?: "lessWalking";
};

export type TisScenarioFixture = {
  id: string;
  displayName: string;
  travellerMessage: string;
  journeyStage: JourneyStage;
  recognisedContext: RecognisedContext;
  oneMaterialQuestion?: string;
  expectedOutcome: ExpectedOutcome;
  expectedRecommendationType: ExpectedRecommendationType;
  allowedTravellerActions: readonly TravellerAction[];
  prohibitedClaims: readonly ProhibitedClaim[];
  sourceSnapshotIds: readonly string[];
  realToday: boolean;
  stagedForTis: boolean;
  futureOnly: boolean;
  createsLeadOnDisplay: false;
  modifiesItineraryAutomatically: false;
  sendsToOperatorAutomatically: false;
  stopCondition: "travellerStops";
};

export type SourceKind =
  | "connectedOperatorSnapshot"
  | "reviewedPublicOperatorSnapshot"
  | "officialSourceSnapshot";

export type ReviewStatus =
  | "sourceCaptured"
  | "paraUstedReviewed"
  | "operatorConfirmed"
  | "requiresConfirmation";

export type RelationshipStatus =
  | "connectedOperator"
  | "publicPossibility"
  | "participatingOperator"
  | "officialInformationSource";

export type ReviewedFact = {
  key: string;
  value: string | boolean | readonly string[];
  sourceStatus: ReviewStatus;
  requiresConfirmation: boolean;
  reviewedAt?: string;
};

export type TrustedSourceSnapshot = {
  id: string;
  sourceKind: SourceKind;
  publisherDisplayName: string;
  sourceUrl: string;
  capturedAt: string;
  publishedAt?: string;
  reviewStatus: ReviewStatus;
  relationshipStatus: RelationshipStatus;
  facts: readonly ReviewedFact[];
  validityNote: string;
};