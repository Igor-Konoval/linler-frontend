import { serverHttp } from '../../http/server-http';

export const fakeService = {
  getProductsClient() {
    return serverHttp.request<string[]>({
      endpoint: '/products/1',
      method: 'GET',
      authorized: true,
      retryOnUnauthorized: true,
    });
  },
};
