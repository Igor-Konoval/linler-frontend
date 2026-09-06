'use client';

import { useGetUser } from '@/src/hooks/user/use-get-user';
import { GET_NOTIFICATIONS_QUERY_KEY } from '@/src/hooks/notifications/use-get-notifications';
import { useMarkNotificationsAsRead } from '@/src/hooks/notifications/use-mark-notifications-as-read';
import { useMarkNotificationsAsReadAll } from '@/src/hooks/notifications/use-mark-notifications-as-read-all';
import type {
  GetNotificationsResponse,
  NotificationResponse,
} from '@/src/types/notifications.types';
import { formatRelativeTime } from '@/src/utils/date.utils';
import {
  getNotificationHref,
  getNotificationText,
} from '@/src/utils/notification.utils';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import { cn } from '@/src/utils/utils';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, type RefCallback, type RefObject } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '../../user-avatar';
import { Button } from '../../ui/button';

export function NotificationsList({
  notifications,
  hasNextPage,
  isError,
  isFetchingNextPage,
  loadMoreRef,
  notificationsScrollRef,
}: {
  notifications: NotificationResponse[];
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: RefCallback<Element>;
  notificationsScrollRef: RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  const { data: user } = useGetUser();
  const queryClient = useQueryClient();
  const { mutateAsync: markRead, isPending: isMarkingRead } =
    useMarkNotificationsAsRead();
  const { mutateAsync: markAllRead, isPending: isMarkingAllRead } =
    useMarkNotificationsAsReadAll();

  const applyUnreadCount = useCallback(
    (unreadCount: number, markIds?: Set<string>, markAll?: boolean) => {
      queryClient.setQueriesData<InfiniteData<GetNotificationsResponse>>(
        { queryKey: [GET_NOTIFICATIONS_QUERY_KEY] },
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              unreadCount,
              notifications: page.notifications.map((notification) => ({
                ...notification,
                isRead:
                  notification.isRead ||
                  markAll ||
                  Boolean(markIds?.has(notification.id)),
              })),
            })),
          };
        },
      );
    },
    [queryClient],
  );

  const handleMarkRead = useCallback(
    async (notificationIds: string[]) => {
      try {
        const result = await markRead({ notificationIds });
        applyUnreadCount(result.unreadCount, new Set(notificationIds));
      } catch (error) {
        if (isRequestFailure(error)) {
          toast.error(error.message);
        }
      }
    },
    [applyUnreadCount, markRead],
  );

  const handleMarkAllRead = async () => {
    try {
      const result = await markAllRead();
      applyUnreadCount(result.unreadCount, undefined, true);
    } catch (error) {
      if (isRequestFailure(error)) {
        toast.error(error.message);
      }
    }
  };

  const handleOpen = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      await handleMarkRead([notification.id]);
    }

    const href = getNotificationHref(notification);

    if (href) {
      router.push(href);
    }
  };

  return (
    <div
      ref={notificationsScrollRef}
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background min-h-30 flex max-h-80 flex-col gap-2 overflow-y-auto"
    >
      {notifications.length > 0 ? (
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={isMarkingAllRead}
        >
          Mark all as read
        </Button>
      ) : null}
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            role="button"
            tabIndex={0}
            className={cn(
              'flex w-full flex-col gap-1 rounded-md border p-3 text-left hover:shadow-sm',
              notification.isRead
                ? 'bg-background border-border'
                : 'bg-background border-[#0000008c] dark:border-[#afc3fa73]',
            )}
            onClick={() => {
              void handleOpen(notification);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                void handleOpen(notification);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <UserAvatar
                  username={notification.payload.actorUsername}
                  avatarUrl={notification.payload.actorAvatarUrl}
                  size={24}
                  className="h-6 min-h-6 w-6 min-w-6"
                  fallback="initials"
                />
                <span
                  className={cn(
                    'text-[13px] leading-snug',
                    notification.isRead
                      ? 'text-muted-foreground'
                      : 'text-foreground font-medium',
                  )}
                >
                  {getNotificationText(notification, user?.id)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={notification.isRead || isMarkingRead}
                className="hover:bg-muted h-auto w-auto shrink-0"
                title="Mark as read"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleMarkRead([notification.id]);
                }}
              >
                <Eye
                  className={cn(
                    notification.isRead ? 'text-muted-foreground' : '',
                  )}
                />
              </Button>
            </div>
            <span className="text-muted-foreground ml-auto text-xs">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
        ))
      ) : (
        <div className="text-muted-foreground my-auto px-3 py-2 text-center text-sm">
          No notifications yet
        </div>
      )}
      {isError ? (
        <div className="text-destructive -mt-2 mb-2 px-3 py-2 text-sm">
          Failed to load notifications
        </div>
      ) : null}
      {hasNextPage ? <div ref={loadMoreRef} className="h-1 shrink-0" /> : null}
      {isFetchingNextPage ? (
        <div className="text-muted-foreground -mt-2 mb-2 flex items-center justify-center px-3 py-2">
          <Loader2 className="animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
