'use client';

import { Button } from '@/src/components/ui/button';
import {
  TASK_BOARD_COLOR_LABELS,
  TASK_BOARD_COLOR_STYLES,
  TASK_BOARD_COLORS,
  TASK_BOARD_DRAG_TRANSITION,
  TASK_CARD_SORT_LABELS,
  TASK_CARD_SORTS,
} from '@/src/constants/task-board.constants';
import type { GetProjectMemberResponse } from '@/src/types/projects.types';
import type {
  TaskBoardColor,
  TaskCard,
  TaskCardSort,
  TaskColumn,
} from '@/src/types/task-board.types';
import { cardsInColumn } from '@/src/utils/task-board.utils';
import { cn } from '@/src/utils/utils';
import { Ellipsis, GripVertical, Plus, Trash2 } from 'lucide-react';
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
import { Input } from '../../ui/input';
import { TaskBoardCard } from './task-board-card';

export function TaskBoardColumn({
  column,
  cards,
  members,
  editable,
  users,
  cardUsersById,
  isDropTarget,
  draggingCardId,
  insertIndex,
  shiftX,
  onRename,
  onColorChange,
  onDelete,
  onSort,
  onAddCard,
  onOpenCard,
  onColumnPointerDown,
  onColumnFocus,
  onCardPointerDown,
  onColumnRef,
}: {
  column: TaskColumn;
  cards: TaskCard[];
  members: GetProjectMemberResponse[];
  editable: boolean;
  users: RemoteBlockAwareness[];
  cardUsersById: Record<string, RemoteBlockAwareness[]>;
  isDropTarget: boolean;
  draggingCardId: string | null;
  insertIndex: number | null;
  shiftX: number;
  onRename: (name: string) => void;
  onColorChange: (color: TaskBoardColor) => void;
  onDelete: () => void;
  onSort: (sort: TaskCardSort) => void;
  onAddCard: () => void;
  onOpenCard: (cardId: string) => void;
  onColumnPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onColumnFocus: () => void;
  onCardPointerDown: (
    cardId: string,
    event: React.PointerEvent<HTMLElement>,
  ) => void;
  onColumnRef: (element: HTMLElement | null) => void;
}) {
  const styles = TASK_BOARD_COLOR_STYLES[column.color];
  const columnCards = cardsInColumn(cards, column.id);

  return (
    <RemoteUserFrame users={users} className="w-64 shrink-0">
      <section
        ref={onColumnRef}
        data-task-column-id={column.id}
        className={cn(
          'flex w-64 shrink-0 flex-col rounded-2xl p-2',
          styles.column,
          isDropTarget && 'ring-foreground/20 ring-2',
        )}
        style={{
          transform: shiftX ? `translateX(${shiftX}px)` : undefined,
          transition: TASK_BOARD_DRAG_TRANSITION,
        }}
      >
        <header className="mb-2 flex items-center gap-1 px-1">
          {editable ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground cursor-grab touch-none px-0.5 active:cursor-grabbing"
              aria-label="Reorder column"
              onPointerDown={onColumnPointerDown}
            >
              <GripVertical className="size-3.5" />
            </button>
          ) : null}

          <span className={cn('size-2 shrink-0 rounded-full', styles.dot)} />

          {editable ? (
            <Input
              value={column.name}
              onChange={(event) => onRename(event.target.value)}
              onFocus={onColumnFocus}
              className="h-7 min-w-0 flex-1 border-transparent bg-transparent px-1 text-sm font-medium shadow-none focus-visible:border-transparent focus-visible:ring-0"
            />
          ) : (
            <h3 className="min-w-0 flex-1 truncate px-1 text-sm font-medium">
              {column.name}
            </h3>
          )}

          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              styles.pill,
            )}
          >
            {columnCards.length}
          </span>

          {editable ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-xs">
                  <Ellipsis className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-44">
                <DropdownMenuLabel>Color</DropdownMenuLabel>
                {TASK_BOARD_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color}
                    onSelect={() => onColorChange(color)}
                  >
                    <span
                      className={cn(
                        'size-2.5 rounded-full',
                        TASK_BOARD_COLOR_STYLES[color].dot,
                      )}
                    />
                    {TASK_BOARD_COLOR_LABELS[color]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort cards</DropdownMenuLabel>
                {TASK_CARD_SORTS.map((sort) => (
                  <DropdownMenuItem key={sort} onSelect={() => onSort(sort)}>
                    {TASK_CARD_SORT_LABELS[sort]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 className="size-3.5" />
                  Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </header>

        <div className="flex flex-1 flex-col gap-2">
          {columnCards.map((card, index) => (
            <TaskBoardCard
              key={card.id}
              card={card}
              column={column}
              members={members}
              editable={editable}
              users={cardUsersById[card.id] ?? []}
              isDragging={draggingCardId === card.id}
              insertLine={
                insertIndex === index
                  ? 'before'
                  : insertIndex === columnCards.length &&
                      index === columnCards.length - 1
                    ? 'after'
                    : null
              }
              onOpen={() => onOpenCard(card.id)}
              onCardPointerDown={(event) => onCardPointerDown(card.id, event)}
            />
          ))}
          {columnCards.length === 0 && insertIndex === 0 ? (
            <div className="bg-foreground/70 mx-1 h-0.5 rounded-full" />
          ) : null}
        </div>

        {editable ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('mt-1 justify-start font-normal', styles.action)}
            onClick={onAddCard}
          >
            <Plus className="size-3.5" />
            New task
          </Button>
        ) : null}
      </section>
    </RemoteUserFrame>
  );
}
