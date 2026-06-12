import { clientHttp } from '../../http/client-http';

export const fakeService = {
  getProductsClient() {
    return clientHttp.request<string[]>({
      endpoint: '/products/1',
      method: 'GET',
      authorized: true,
      retryOnUnauthorized: true,
    });
  },
};
