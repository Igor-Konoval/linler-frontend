import type { PaginationParams } from '@/src/types/base.types';
import type {
  GetNotificationsResponse,
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
} from '@/src/types/notifications.types';
import {
  PaginationQueryParams,
  PaginationQueryParamsValues,
} from '@/src/constants/routes.constants';
import { clientHttp } from '../../http/client-http';

export const NotificationService = {
  apiUrl: '/notifications',

  getNotifications(params: PaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.set(PaginationQueryParams.LIMIT, params.limit.toString());
    queryParams.set(
      PaginationQueryParams.PAGE,
      params.page?.toString() ?? PaginationQueryParamsValues.PAGE.toString(),
    );

    return clientHttp.request<GetNotificationsResponse, void>({
      endpoint: `${this.apiUrl}?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  markNotificationsRead(request: MarkNotificationsReadRequest) {
    return clientHttp.request<
      MarkNotificationsReadResponse,
      MarkNotificationsReadRequest
    >({
      endpoint: `${this.apiUrl}/read`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  markNotificationsReadAll() {
    return clientHttp.request<MarkNotificationsReadResponse, void>({
      endpoint: `${this.apiUrl}/read-all`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },
};
