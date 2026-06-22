import type {
  GetUserResponse,
  LoginRequest,
  RegisterRequest,
} from '@/src/types/auth.types';
import { clientHttp } from '../../http/client-http';

export const AuthService = {
  apiUrl: '/auth',

  register(request: RegisterRequest) {
    return clientHttp.request<GetUserResponse, RegisterRequest>({
      endpoint: `${this.apiUrl}/register`,
      method: 'POST',
      body: request,
    });
  },

  login(request: LoginRequest) {
    return clientHttp.request<GetUserResponse, LoginRequest>({
      endpoint: `${this.apiUrl}/login`,
      method: 'POST',
      body: request,
    });
  },

  getUser() {
    return clientHttp.request<GetUserResponse, void>({
      endpoint: `${this.apiUrl}/me`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  logout() {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/logout`,
      method: 'POST',
    });
  },
};
