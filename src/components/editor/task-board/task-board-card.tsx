'use client';

import {
  TASK_BOARD_COLOR_STYLES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_STYLES,
} from '@/src/constants/task-board.constants';
import type { GetProjectMemberResponse } from '@/src/types/projects.types';
import type { TaskCard, TaskColumn } from '@/src/types/task-board.types';
import { formatTaskBoardDate } from '@/src/utils/task-board.utils';
import { cn } from '@/src/utils/utils';
import { Calendar, GripVertical } from 'lucide-react';
import type { RemoteBlockAwareness } from '../collaboration-highlight';
import { RemoteUserFrame } from '../remote-user-frame';
import { TaskMemberAvatar } from './task-member-avatar';

export function TaskBoardCard({
  card,
  column,
  members,
  editable,
  users,
  isDragging,
  insertLine,
  onOpen,
  onCardPointerDown,
}: {
  card: TaskCard;
  column: TaskColumn;
  members: GetProjectMemberResponse[];
  editable: boolean;
  users: RemoteBlockAwareness[];
  isDragging: boolean;
  insertLine: 'before' | 'after' | null;
  onOpen: () => void;
  onCardPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  const assignee = members.find((member) => member.userId === card.assigneeId);
  const columnStyles = TASK_BOARD_COLOR_STYLES[column.color];
  const startLabel = formatTaskBoardDate(card.startDate);
  const dueLabel = formatTaskBoardDate(card.dueDate);

  return (
    <div className="relative">
      {insertLine === 'before' ? <DropLine /> : null}
      <RemoteUserFrame users={users}>
      <article
        data-task-card-id={card.id}
        onClick={onOpen}
        className={cn(
          'bg-background ring-foreground/8 hover:ring-foreground/16 rounded-xl p-2.5 shadow-sm ring-1 transition',
          isDragging && 'opacity-30',
          editable && 'cursor-pointer',
        )}
      >
        <div className="flex items-start gap-1">
          {editable ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground mt-0.5 cursor-grab touch-none px-0.5 active:cursor-grabbing"
              aria-label="Move task"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={onCardPointerDown}
            >
              <GripVertical className="size-3.5" />
            </button>
          ) : null}
          <p className="min-w-0 flex-1 text-sm font-medium">
            {card.title.trim() || 'Untitled'}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-5">
          {card.priority ? (
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                TASK_PRIORITY_STYLES[card.priority],
              )}
            >
              {TASK_PRIORITY_LABELS[card.priority]}
            </span>
          ) : null}
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 text-[11px] font-medium',
              columnStyles.pill,
            )}
          >
            {column.name}
          </span>
          {startLabel ? (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
              <Calendar className="size-3" />
              {startLabel}
            </span>
          ) : null}
          {dueLabel ? (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
              <Calendar className="size-3" />
              {dueLabel}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center gap-1.5 pl-5">
          <TaskMemberAvatar member={assignee} size={20} />
          <span className="text-muted-foreground truncate text-[11px]">
            {assignee?.username ?? 'Unassigned'}
          </span>
        </div>
      </article>
      </RemoteUserFrame>
      {insertLine === 'after' ? <DropLine /> : null}
    </div>
  );
}

function DropLine() {
  return (
    <div
      className="bg-foreground/70 mx-1 my-1 h-0.5 rounded-full"
      aria-hidden
    />
  );
}
