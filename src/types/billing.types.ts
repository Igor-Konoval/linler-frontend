export interface SubscriptionState {
  subscriptionActive: boolean;
  subscriptionCancelAtPeriodEnd: boolean;
  subscriptionCurrentPeriodEnd: string | null;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface ConfirmCheckoutRequest {
  sessionId: string;
}
