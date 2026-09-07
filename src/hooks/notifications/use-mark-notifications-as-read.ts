import { NotificationService } from '@/src/api/services/client/notification.service';
import type {
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
} from '@/src/types/notifications.types';
import type { RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, type UseMutationResult } from '@tanstack/react-query';

const MARK_NOTIFICATIONS_AS_READ_MUTATION_KEY = 'mark-notifications-as-read';

export const useMarkNotificationsAsRead = (): UseMutationResult<
  MarkNotificationsReadResponse,
  RequestFailure,
  MarkNotificationsReadRequest,
  unknown
> => {
  return useMutation({
    mutationKey: [MARK_NOTIFICATIONS_AS_READ_MUTATION_KEY],
    mutationFn: async (request: MarkNotificationsReadRequest) => {
      return await NotificationService.markNotificationsRead(request);
    },
  });
};
