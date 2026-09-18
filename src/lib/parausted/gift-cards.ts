export type ParaUstedFixedGiftCardConfig = {
  giftCardId: string;
  prefix: string;
  amountEur: number;
};

export const PARAUSTED_ALCAZAR_FIXED_GIFT_CARD = {
  giftCardId: "c1965108-bff7-479e-95a7-825983e50515",
  prefix: "ST-GC-ALC",
  amountEur: 50,
} as const satisfies ParaUstedFixedGiftCardConfig;