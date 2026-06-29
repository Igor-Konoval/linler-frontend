import { clientHttp } from '../../http/client-http';
import type {
  EditUserAccountRequest,
  GetUserAccountResponse,
} from '@/src/types/user.types';

export const UserService = {
  apiUrl: '/users',

  editUserAccount(request: EditUserAccountRequest) {
    return clientHttp.request<GetUserAccountResponse, EditUserAccountRequest>({
      endpoint: `${this.apiUrl}/me`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  editUserAvatar(request: FormData) {
    return clientHttp.request<GetUserAccountResponse, FormData>({
      endpoint: `${this.apiUrl}/me/avatar`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  getUserAccount() {
    return clientHttp.request<GetUserAccountResponse, void>({
      endpoint: `${this.apiUrl}/me`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  deleteUserAvatar() {
    return clientHttp.request<GetUserAccountResponse, void>({
      endpoint: `${this.apiUrl}/me/avatar`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },
};
