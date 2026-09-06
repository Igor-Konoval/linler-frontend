import type { PaginationParams } from '@/src/types/base.types';
import type { GetNotificationsResponse } from '@/src/types/notifications.types';
import {
  PaginationQueryParams,
  PaginationQueryParamsValues,
} from '@/src/constants/routes.constants';
import { serverHttp } from '../../http/server-http';

export const NotificationService = {
  apiUrl: '/notifications',

  getNotifications(params: PaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.set(PaginationQueryParams.LIMIT, params.limit.toString());
    queryParams.set(
      PaginationQueryParams.PAGE,
      params.page?.toString() ?? PaginationQueryParamsValues.PAGE.toString(),
    );

    return serverHttp.request<GetNotificationsResponse, void>({
      endpoint: `${this.apiUrl}?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },
};
