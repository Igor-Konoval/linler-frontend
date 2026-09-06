import { NotificationService } from '@/src/api/services/server/notification.service';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import type { GetNotificationsResponse } from '@/src/types/notifications.types';
import { type JSX } from 'react';
import { Notifications } from './notifications';

export async function NotificationsSection(): Promise<JSX.Element> {
  let notifications: GetNotificationsResponse | undefined;

  try {
    notifications = await NotificationService.getNotifications({
      limit: PaginationQueryParamsValues.LIMIT,
    });
  } catch {
    notifications = undefined;
  }

  return <Notifications initialData={notifications} />;
}
