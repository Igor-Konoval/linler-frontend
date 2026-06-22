import type { GetUserResponse } from '@/src/types/auth.types';
import { serverHttp } from '../../http/server-http';

export const AuthService = {
  apiUrl: '/auth',

  getUser() {
    return serverHttp.request<GetUserResponse, void>({
      endpoint: `${this.apiUrl}/me`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },
};
