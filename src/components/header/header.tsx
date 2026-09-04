'use client';

import { useGetProjectPage } from '@/src/hooks/page/use-get-project-page';
import {
  seedPageActivity,
  usePageActivity,
} from '@/src/hooks/realtime/use-page-activity';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useCurrentPageId } from '@/src/hooks/workspaces/use-current-page-id';
import { formatRelativeTime } from '@/src/utils/date.utils';
import { getUserColor } from '@/src/utils/user-color.utils';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SidebarTrigger } from '../sidebar/sidebar';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import { Separator } from '../ui/separator';
import { HeaderDropdownBtn } from './header-dropdown-btn';
import { PAGE_ACTIVITY_INTERVAL } from '@/src/constants/realtime.constants';

export function Header() {
  const pageId = useCurrentPageId();
  const { data: page } = useGetProjectPage({ pageId });
  const { data: currentUser } = useGetUser();
  const activity = usePageActivity(pageId);
  const [, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, PAGE_ACTIVITY_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!page) {
      return;
    }

    seedPageActivity(
      page.id,
      page.recentEditors?.length
        ? page.recentEditors
        : page.updatedBy
          ? [
              {
                id: page.updatedBy.id,
                username: page.updatedBy.username,
                avatarUrl: page.updatedBy.avatarUrl,
                updatedAt: page.updatedAt,
              },
            ]
          : [],
    );
  }, [page]);

  const editors = activity.length
    ? activity
    : page?.updatedBy
      ? [
          {
            id: page.updatedBy.id,
            username: page.updatedBy.username,
            avatarUrl: page.updatedBy.avatarUrl,
            updatedAt: page.updatedAt,
          },
        ]
      : [];
  const latest = editors[0];
  const relativeTime = latest ? formatRelativeTime(latest.updatedAt) : null;

  return (
    <header className="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 pl-1 pr-4 lg:gap-2 lg:pr-6">
        <SidebarTrigger />
        <div className="ml-auto flex items-center gap-1">
          {page && latest && relativeTime ? (
            <HoverCard openDelay={200}>
              <HoverCardTrigger className="text-(--hover-card) px-1" asChild>
                <Button variant="ghost">Edited {relativeTime}</Button>
              </HoverCardTrigger>
              <HoverCardContent className="flex w-72 flex-col gap-0.5">
                <h6 className="font-semibold">Activity</h6>
                <Separator className="my-2" />
                <div className="flex flex-col gap-2 text-sm">
                  {editors.map((editor) => {
                    const isOwnEdit = currentUser?.id === editor.id;
                    const name = editor.username
                      ? isOwnEdit
                        ? `${editor.username} (you)`
                        : editor.username
                      : 'Unknown';
                    const color = getUserColor(editor.id);

                    return (
                      <div
                        key={`${editor.id}-${editor.updatedAt}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="relative inline-flex shrink-0"
                            style={{ color }}
                          >
                            {editor.avatarUrl ? (
                              <Image
                                src={editor.avatarUrl}
                                alt=""
                                width={20}
                                height={20}
                                className="h-5 w-5 rounded-full"
                                style={{ boxShadow: `0 0 0 2px ${color}` }}
                              />
                            ) : (
                              <span
                                className="h-5 w-5 rounded-full bg-gray-200"
                                style={{ boxShadow: `0 0 0 2px ${color}` }}
                              />
                            )}
                          </span>
                          <p className="truncate">
                            Edited by <b>{name}</b>
                          </p>
                        </div>
                        <p className="text-muted-foreground shrink-0 text-xs">
                          {formatRelativeTime(editor.updatedAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : null}

          <HoverCard openDelay={200}>
            <HoverCardTrigger className="px-1" asChild>
              <Button variant="ghost">
                <Star />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit">
              <p>Add to Favorites</p>
            </HoverCardContent>
          </HoverCard>

          <HeaderDropdownBtn />
        </div>
      </div>
    </header>
  );
}
