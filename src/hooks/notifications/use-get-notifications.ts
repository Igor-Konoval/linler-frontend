import { NotificationService } from '@/src/api/services/client/notification.service';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import type { PaginationParams } from '@/src/types/base.types';
import type { GetNotificationsResponse } from '@/src/types/notifications.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';

export const GET_NOTIFICATIONS_QUERY_KEY = 'get-notifications';

export const useGetNotifications = ({
  initialData,
  params,
  userId,
}: {
  initialData?: GetNotificationsResponse;
  params: PaginationParams;
  userId?: string;
}): UseInfiniteQueryResult<
  InfiniteData<GetNotificationsResponse>,
  RequestFailure
> =>
  useInfiniteQuery<
    GetNotificationsResponse,
    RequestFailure,
    InfiniteData<GetNotificationsResponse>,
    [typeof GET_NOTIFICATIONS_QUERY_KEY, string | undefined, PaginationParams],
    number
  >({
    queryKey: [GET_NOTIFICATIONS_QUERY_KEY, userId, params],
    queryFn: async ({ pageParam }) =>
      await NotificationService.getNotifications({
        ...params,
        page: pageParam,
      }),
    initialPageParam: params.page ?? PaginationQueryParamsValues.PAGE,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    enabled: Boolean(userId),
    refetchOnMount: 'always',
    ...(initialData
      ? {
          initialData: {
            pages: [initialData],
            pageParams: [initialData.meta.page],
          },
        }
      : {}),
  });
