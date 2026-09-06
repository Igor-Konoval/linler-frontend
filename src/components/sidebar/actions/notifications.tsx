'use client';

import { Button } from '@/src/components/ui/button';
import { PaginationQueryParamsValues } from '@/src/constants/routes.constants';
import { useGetNotifications } from '@/src/hooks/notifications/use-get-notifications';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useInfiniteScroll } from '@/src/hooks/use-infinite-scroll';
import type { GetNotificationsResponse } from '@/src/types/notifications.types';
import { Bell } from 'lucide-react';
import { useMemo, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { NotificationsList } from './notifications-list';

export function Notifications({
  initialData,
}: {
  initialData?: GetNotificationsResponse;
}) {
  const { data: user } = useGetUser();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
  } = useGetNotifications({
    initialData,
    userId: user?.id,
    params: { limit: PaginationQueryParamsValues.LIMIT },
  });

  const notificationsScrollRef = useRef<HTMLDivElement>(null);
  const { loadMoreRef } = useInfiniteScroll({
    rootRef: notificationsScrollRef,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
    enabled: !isError,
  });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data],
  );

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  return (
    <div className="flex items-center gap-2 pr-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-(--sidebar-item-hover)! ml-2 w-full justify-start"
          >
            <Bell size={16} /> Notifications
            {unreadCount > 0 ? ` (${unreadCount})` : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto" align="start">
          <div className="w-[320px] p-1">
            {isPending && flatData.length === 0 ? (
              <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                Loading notifications…
              </div>
            ) : (
              <NotificationsList
                notifications={flatData}
                hasNextPage={hasNextPage}
                isError={isError}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                notificationsScrollRef={notificationsScrollRef}
              />
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
