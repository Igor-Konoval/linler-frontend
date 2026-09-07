import { NotificationService } from '@/src/api/services/client/notification.service';
import type { MarkNotificationsReadResponse } from '@/src/types/notifications.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const MARK_NOTIFICATIONS_AS_READ_ALL_MUTATION_KEY =
  'mark-notifications-as-read-all';

export const useMarkNotificationsAsReadAll = (): UseMutationResult<
  MarkNotificationsReadResponse,
  RequestFailure,
  void,
  unknown
> => {
  return useMutation({
    mutationKey: [MARK_NOTIFICATIONS_AS_READ_ALL_MUTATION_KEY],
    mutationFn: async () => {
      return await NotificationService.markNotificationsReadAll();
    },
  });
};
