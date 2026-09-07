import { NotificationType } from '@/src/constants/realtime.constants';
import { ROUTES } from '@/src/constants/routes.constants';
import type { NotificationResponse } from '@/src/types/notifications.types';

export function getNotificationHref(
  notification: NotificationResponse,
): string | null {
  const { workspaceId, projectId, pageId } = notification.payload;

  if (workspaceId && projectId && pageId) {
    return `${ROUTES.WORKSPACE}/${workspaceId}/${projectId}/${pageId}`;
  }

  if (workspaceId) {
    return `${ROUTES.WORKSPACE}/${workspaceId}`;
  }

  return null;
}

export function getNotificationText(
  notification: NotificationResponse,
  currentUserId?: string,
): string {
  const payload = notification.payload;
  const actor = payload.actorUsername || 'Someone';

  if (notification.type === NotificationType.WorkspaceMemberJoined) {
    return `${actor} joined ${payload.workspaceName}`;
  }

  const cardTitle = payload.cardTitle || 'a task';

  if (notification.type === NotificationType.TaskAssigned) {
    const assignee =
      payload.assigneeId && payload.assigneeId === currentUserId
        ? 'you'
        : payload.assigneeUsername || 'someone';

    return `${actor} assigned ${cardTitle} to ${assignee}`;
  }

  if (notification.type === NotificationType.TaskStatusChanged) {
    return `${actor} moved ${cardTitle} to ${payload.columnName || 'a new status'}`;
  }

  return 'New notification';
}
