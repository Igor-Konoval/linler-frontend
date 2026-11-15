import type {
  CheckoutSessionResponse,
  ConfirmCheckoutRequest,
  SubscriptionState,
} from '@/src/types/billing.types';
import { clientHttp } from '../../http/client-http';

export const BillingService = {
  apiUrl: '/billing',

  checkout() {
    return clientHttp.request<CheckoutSessionResponse, void>({
      endpoint: `${this.apiUrl}/checkout`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  confirm(sessionId: string) {
    return clientHttp.request<SubscriptionState, ConfirmCheckoutRequest>({
      endpoint: `${this.apiUrl}/confirm`,
      method: 'POST',
      body: { sessionId },
      retryOnUnauthorized: true,
    });
  },

  cancel() {
    return clientHttp.request<SubscriptionState, void>({
      endpoint: `${this.apiUrl}/cancel`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  resume() {
    return clientHttp.request<SubscriptionState, void>({
      endpoint: `${this.apiUrl}/resume`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },
};
