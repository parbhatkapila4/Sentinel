export const CARD_BRANDS = ["VISA", "Mastercard", "Amex", "Discover"] as const;

export type PaymentMethodItem = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
};
