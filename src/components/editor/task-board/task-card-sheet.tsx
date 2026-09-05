'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet';
import { SMALL_MOBILE_BREAKPOINT } from '@/src/constants/base.constants';
import {
  TASK_BOARD_COLOR_STYLES,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_STYLES,
} from '@/src/constants/task-board.constants';
import { useMediaQuery } from '@/src/hooks/use-media-query';
import type { TiptapDocument } from '@/src/types/pages.types';
import type { GetProjectMemberResponse } from '@/src/types/projects.types';
import { type TaskCard, type TaskColumn } from '@/src/types/task-board.types';
import { cn } from '@/src/utils/utils';
import { Trash2 } from 'lucide-react';
import type { RemoteBlockAwareness } from '../collaboration-highlight';
import { RemoteUserFrame } from '../remote-user-frame';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { TaskDescriptionEditor } from './task-description-editor';
import { TaskMemberAvatar } from './task-member-avatar';
import { parseTaskCardAwareness } from '@/src/utils/realtime.utils';

export function TaskCardSheet({
  card,
  column,
  columns,
  members,
  editable,
  users,
  pageId,
  projectId,
  open,
  onOpenChange,
  onCardAwareness,
  onDescriptionAwareness,
  onChange,
  onDelete,
}: {
  card: TaskCard | null;
  column: TaskColumn | null;
  columns: TaskColumn[];
  members: GetProjectMemberResponse[];
  editable: boolean;
  users: RemoteBlockAwareness[];
  pageId: string;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardAwareness: () => void;
  onDescriptionAwareness: (blockId: string | null) => void;
  onChange: (cardId: string, patch: Partial<TaskCard>) => void;
  onDelete: (cardId: string) => void;
}) {
  const isMobile = useMediaQuery(
    `(max-width: ${SMALL_MOBILE_BREAKPOINT - 1}px)`,
  );

  if (!card || !column) {
    return null;
  }

  const titleUsers = users.filter((user) => {
    const parsed = parseTaskCardAwareness(user.blockId);
    return Boolean(parsed && !parsed.descriptionBlockId);
  });
  const descriptionUsers = users.filter((user) => {
    const parsed = parseTaskCardAwareness(user.blockId);
    return Boolean(parsed?.descriptionBlockId);
  });
  const assignee = members.find((member) => member.userId === card.assigneeId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full flex-col gap-0 overflow-hidden data-[side=right]:sm:max-w-2xl',
          isMobile && 'max-w-screen! w-screen!',
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          const target = event.target;

          if (
            target instanceof Element &&
            target.closest('[data-linler-floating-menu]')
          ) {
            event.preventDefault();
          }
        }}
        onFocusOutside={(event) => {
          const target = event.target;

          if (
            target instanceof Element &&
            target.closest('[data-linler-floating-menu]')
          ) {
            event.preventDefault();
          }
        }}
      >
        <SheetHeader className="mt-7 border-b">
          <SheetTitle className="sr-only">Task</SheetTitle>
          <SheetDescription className="sr-only">
            Task details and description
          </SheetDescription>
          <RemoteUserFrame users={titleUsers}>
            {editable ? (
              <Input
                value={card.title}
                placeholder="Untitled"
                onFocus={onCardAwareness}
                onChange={(event) =>
                  onChange(card.id, { title: event.target.value })
                }
                className="mr-7 h-10 border-transparent bg-transparent pl-3 pr-7 text-xl font-semibold shadow-none focus-visible:ring-0"
              />
            ) : (
              <p className="pr-7 text-xl font-semibold">
                {card.title.trim() || 'Untitled'}
              </p>
            )}
          </RemoteUserFrame>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          <PropertyRow label="Status">
            {editable ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium',
                      TASK_BOARD_COLOR_STYLES[column.color].pill,
                    )}
                  >
                    {column.name}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-44">
                  {columns.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onSelect={() => onChange(card.id, { columnId: item.id })}
                    >
                      <span
                        className={cn(
                          'size-2.5 rounded-full',
                          TASK_BOARD_COLOR_STYLES[item.color].dot,
                        )}
                      />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium',
                  TASK_BOARD_COLOR_STYLES[column.color].pill,
                )}
              >
                {column.name}
              </span>
            )}
          </PropertyRow>

          <PropertyRow label="Priority">
            {editable ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'rounded-md px-2 py-1 text-xs font-medium',
                      card.priority
                        ? TASK_PRIORITY_STYLES[card.priority]
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {card.priority
                      ? TASK_PRIORITY_LABELS[card.priority]
                      : 'Empty'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-36">
                  {TASK_PRIORITIES.map((priority) => (
                    <DropdownMenuItem
                      key={priority}
                      onSelect={() => onChange(card.id, { priority })}
                    >
                      {TASK_PRIORITY_LABELS[priority]}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onChange(card.id, { priority: null })}
                  >
                    Clear
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="text-muted-foreground text-xs">
                {card.priority ? TASK_PRIORITY_LABELS[card.priority] : 'Empty'}
              </span>
            )}
          </PropertyRow>

          <PropertyRow label="Start">
            {editable ? (
              <input
                type="date"
                value={card.startDate ?? ''}
                onChange={(event) =>
                  onChange(card.id, { startDate: event.target.value || null })
                }
                className="bg-transparent text-sm outline-none"
              />
            ) : (
              <span className="text-muted-foreground text-sm">
                {card.startDate ?? 'Empty'}
              </span>
            )}
          </PropertyRow>

          <PropertyRow label="Due">
            {editable ? (
              <input
                type="date"
                value={card.dueDate ?? ''}
                onChange={(event) =>
                  onChange(card.id, { dueDate: event.target.value || null })
                }
                className="bg-transparent text-sm outline-none"
              />
            ) : (
              <span className="text-muted-foreground text-sm">
                {card.dueDate ?? 'Empty'}
              </span>
            )}
          </PropertyRow>

          <PropertyRow label="Assignee">
            {editable ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <TaskMemberAvatar member={assignee} size={22} />
                    {assignee?.username ?? 'Empty'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-48">
                  <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                  {members.map((member) => (
                    <DropdownMenuItem
                      key={member.userId}
                      onSelect={() =>
                        onChange(card.id, { assigneeId: member.userId })
                      }
                    >
                      <TaskMemberAvatar member={member} size={20} />
                      {member.username}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onChange(card.id, { assigneeId: null })}
                  >
                    Unassigned
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm">
                <TaskMemberAvatar member={assignee} size={22} />
                {assignee?.username ?? 'Empty'}
              </span>
            )}
          </PropertyRow>

          <div className="border-t pt-3">
            <p className="text-muted-foreground mb-2 text-sm">Description</p>
            <TaskDescriptionEditor
              key={card.id}
              cardId={card.id}
              pageId={pageId}
              projectId={projectId}
              editable={editable}
              users={descriptionUsers}
              content={card.description}
              onChange={(description: TiptapDocument) =>
                onChange(card.id, { description })
              }
              onAwareness={onDescriptionAwareness}
            />
          </div>
        </div>

        {editable ? (
          <SheetFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(card.id);
                onOpenChange(false);
              }}
            >
              <Trash2 />
              Delete task
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div>{children}</div>
    </div>
  );
}
