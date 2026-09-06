import { NotificationType } from '@/src/constants/realtime.constants';
import type { PaginationMeta } from './base.types';

export type NotificationPayload = {
  actorUserId: string;
  actorUsername: string;
  actorAvatarUrl: string | null;
  workspaceId: string;
  workspaceName: string;
  targetUserId?: string;
  targetUsername?: string;
  projectId?: string;
  pageId?: string;
  pageTitle?: string;
  boardId?: string;
  cardId?: string;
  cardTitle?: string;
  assigneeId?: string;
  assigneeUsername?: string;
  columnId?: string;
  columnName?: string;
  previousColumnName?: string;
};

export type NotificationResponse = {
  id: string;
  type: NotificationType;
  workspaceId: string;
  payload: NotificationPayload;
  isRead: boolean;
  createdAt: string;
};

export type GetNotificationsResponse = {
  notifications: NotificationResponse[];
  unreadCount: number;
  meta: PaginationMeta;
};

export type MarkNotificationsReadRequest = {
  notificationIds: string[];
};

export type MarkNotificationsReadResponse = {
  unreadCount: number;
};
