'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  TASK_BOARD_COLUMN_GAP_PX,
  TASK_BOARD_COLUMN_WIDTH_PX,
  TASK_BOARD_COLOR_STYLES,
} from '@/src/constants/task-board.constants';
import { useTaskBoardRealtime } from '@/src/hooks/realtime/use-task-board-realtime';
import { useGetProjectMembers } from '@/src/hooks/projects/use-get-project-members';
import {
  TaskBoardColor,
  TaskBoardDragKind,
  type TaskBoardAttrs,
  type TaskCard,
  type TaskCardSort,
  type TaskColumn,
} from '@/src/types/task-board.types';
import {
  cardMatchesQuery,
  cardsInColumn,
  cloneTaskBoard,
  columnShiftPx,
  createTaskCard,
  createTaskColumn,
  moveCard,
  parseTaskBoardAttrs,
  reorderColumns,
  sortCardsInColumn,
} from '@/src/utils/task-board.utils';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { TaskBoardColumn } from './task-board-column';
import { TaskCardSheet } from './task-card-sheet';
import { RemoteUserFrame } from '../remote-user-frame';

type TaskBoardUiState = {
  search: string;
  openCardId: string | null;
};

const boardUiState = new Map<string, TaskBoardUiState>();

type TaskBoardOptions = {
  projectId: string;
  getPageId?: () => string;
};

type ColumnDragState = {
  columnId: string;
  fromIndex: number;
  toIndex: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
};

type CardDragState = {
  cardId: string;
  title: string;
  color: TaskBoardColor;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
  columnId: string;
  index: number;
};

export function TaskBoardView({
  node,
  updateAttributes,
  editor,
  extension,
  getPos,
}: NodeViewProps) {
  const editable = editor.isEditable;
  const options = extension.options as TaskBoardOptions;
  const projectId = options.projectId;
  const pageId = options.getPageId?.() ?? '';
  const board = useMemo(() => parseTaskBoardAttrs(node.attrs), [node.attrs]);
  const { data: membersData } = useGetProjectMembers({ projectId });
  const members = membersData?.members ?? [];
  const [search, setSearch] = useState(
    () => boardUiState.get(board.boardId)?.search ?? '',
  );
  const [openCardId, setOpenCardId] = useState<string | null>(
    () => boardUiState.get(board.boardId)?.openCardId ?? null,
  );
  const [columnDrag, setColumnDrag] = useState<ColumnDragState | null>(null);
  const [cardDrag, setCardDrag] = useState<CardDragState | null>(null);
  const columnRefs = useRef(new Map<string, HTMLElement>());
  const columnRectsRef = useRef<Array<{ left: number; width: number }>>([]);
  const movedRef = useRef(false);
  const columnDragRef = useRef<ColumnDragState | null>(null);
  const cardDragRef = useRef<CardDragState | null>(null);
  const boardRef = useRef(board);
  const orderedColumnsRef = useRef<TaskColumn[]>([]);
  const openCardIdRef = useRef<string | null>(openCardId);

  const getBoardPos = useCallback(() => {
    if (typeof getPos !== 'function') {
      return undefined;
    }

    const pos = getPos();
    return typeof pos === 'number' ? pos : undefined;
  }, [getPos]);

  const isBusy = useCallback(
    () => Boolean(columnDragRef.current || cardDragRef.current),
    [],
  );

  const {
    boardUsers,
    usersByCardId,
    usersByColumnId,
    emitBoardAwareness,
    emitColumnAwareness,
    emitCardAwareness,
    emitCardDescriptionAwareness,
    holdCardAwareness,
    releaseCardAwareness,
    broadcastBoard,
  } = useTaskBoardRealtime({
    editor,
    getPos: getBoardPos,
    pageId,
    boardId: board.boardId,
    enabled: Boolean(pageId && board.boardId),
    isBusy,
  });

  const persist = useCallback(
    (next: TaskBoardAttrs) => {
      updateAttributes(cloneTaskBoard(next));
      broadcastBoard(next);
    },
    [broadcastBoard, updateAttributes],
  );

  const updateBoard = useCallback(
    (patch: Partial<TaskBoardAttrs>) => {
      persist({
        ...board,
        ...patch,
      });
    },
    [board, persist],
  );

  const orderedColumns = useMemo(
    () => [...board.columns].sort((a, b) => a.order - b.order),
    [board.columns],
  );

  const visibleCards = useMemo(
    () => board.cards.filter((card) => cardMatchesQuery(card, search)),
    [board.cards, search],
  );

  useEffect(() => {
    columnDragRef.current = columnDrag;
    cardDragRef.current = cardDrag;
    boardRef.current = board;
    orderedColumnsRef.current = orderedColumns;
    openCardIdRef.current = openCardId;
  }, [board, cardDrag, columnDrag, openCardId, orderedColumns]);

  const openCard = board.cards.find((card) => card.id === openCardId) ?? null;
  const resolvedOpenCardId = openCard?.id ?? null;

  useEffect(() => {
    boardUiState.set(board.boardId, {
      search,
      openCardId: resolvedOpenCardId,
    });
  }, [board.boardId, resolvedOpenCardId, search]);

  useEffect(() => {
    if (!resolvedOpenCardId) {
      releaseCardAwareness();
      return;
    }

    holdCardAwareness(resolvedOpenCardId);
  }, [holdCardAwareness, releaseCardAwareness, resolvedOpenCardId]);
  const openColumn = openCard
    ? (orderedColumns.find((column) => column.id === openCard.columnId) ?? null)
    : null;

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const currentColumnDrag = columnDragRef.current;
      const currentCardDrag = cardDragRef.current;

      if (!currentColumnDrag && !currentCardDrag) {
        return;
      }

      event.preventDefault();
      movedRef.current = true;

      if (currentColumnDrag) {
        let closestIndex = currentColumnDrag.fromIndex;
        let closestDistance = Number.POSITIVE_INFINITY;

        columnRectsRef.current.forEach((rect, index) => {
          const center = rect.left + rect.width / 2;
          const distance = Math.abs(event.clientX - center);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setColumnDrag({
          ...currentColumnDrag,
          toIndex: closestIndex,
          x: event.clientX - currentColumnDrag.offsetX,
          y: event.clientY - currentColumnDrag.offsetY,
        });
      }

      if (currentCardDrag) {
        let nextColumnId = currentCardDrag.columnId;
        let closestColumnDistance = Number.POSITIVE_INFINITY;

        orderedColumnsRef.current.forEach((column) => {
          const rect = columnRefs.current
            .get(column.id)
            ?.getBoundingClientRect();

          if (!rect) {
            return;
          }

          const center = rect.left + rect.width / 2;
          const distance = Math.abs(event.clientX - center);

          if (distance < closestColumnDistance) {
            closestColumnDistance = distance;
            nextColumnId = column.id;
          }
        });

        const columnEl = columnRefs.current.get(nextColumnId);
        const cardElements = columnEl
          ? Array.from(
              columnEl.querySelectorAll<HTMLElement>('[data-task-card-id]'),
            ).filter(
              (element) =>
                element.getAttribute('data-task-card-id') !==
                currentCardDrag.cardId,
            )
          : [];
        let nextIndex = cardElements.length;

        cardElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();

          if (event.clientY < rect.top + rect.height / 2 && index < nextIndex) {
            nextIndex = index;
          }
        });

        setCardDrag({
          ...currentCardDrag,
          x: event.clientX - currentCardDrag.offsetX,
          y: event.clientY - currentCardDrag.offsetY,
          columnId: nextColumnId,
          index: nextIndex,
        });
      }
    };

    const onUp = () => {
      const currentColumnDrag = columnDragRef.current;
      const currentCardDrag = cardDragRef.current;
      const currentBoard = boardRef.current;
      const currentColumns = orderedColumnsRef.current;

      if (currentColumnDrag) {
        const fromColumn = currentColumns[currentColumnDrag.fromIndex];
        const toColumn = currentColumns[currentColumnDrag.toIndex];

        if (fromColumn && toColumn && fromColumn.id !== toColumn.id) {
          persist({
            ...currentBoard,
            columns: reorderColumns(
              currentBoard.columns,
              fromColumn.id,
              toColumn.id,
            ),
          });
        }

        setColumnDrag(null);
        columnDragRef.current = null;
      }

      if (currentCardDrag) {
        persist({
          ...currentBoard,
          cards: moveCard({
            cards: currentBoard.cards,
            cardId: currentCardDrag.cardId,
            targetColumnId: currentCardDrag.columnId,
            targetIndex: currentCardDrag.index,
          }),
        });
        setCardDrag(null);
        cardDragRef.current = null;
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [persist]);

  useEffect(() => {
    if (!columnDrag && !cardDrag) {
      return;
    }

    document.body.setAttribute(
      'data-task-board-dragging',
      columnDrag ? TaskBoardDragKind.Column : TaskBoardDragKind.Card,
    );
    document.body.style.userSelect = 'none';

    return () => {
      document.body.removeAttribute('data-task-board-dragging');
      document.body.style.userSelect = '';
    };
  }, [cardDrag, columnDrag]);

  const handleRenameColumn = (columnId: string, name: string) => {
    updateBoard({
      columns: board.columns.map((column) =>
        column.id === columnId ? { ...column, name } : column,
      ),
    });
  };

  const handleColorChange = (columnId: string, color: TaskBoardColor) => {
    updateBoard({
      columns: board.columns.map((column) =>
        column.id === columnId ? { ...column, color } : column,
      ),
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    if (board.columns.length <= 1) {
      return;
    }

    const remaining = board.columns
      .filter((column) => column.id !== columnId)
      .map((column, index) => ({ ...column, order: index }));
    const fallbackColumnId = remaining[0]?.id;

    if (!fallbackColumnId) {
      return;
    }

    updateBoard({
      columns: remaining,
      cards: board.cards.map((card) =>
        card.columnId === columnId
          ? { ...card, columnId: fallbackColumnId }
          : card,
      ),
    });
  };

  const handleSortColumn = (columnId: string, sort: TaskCardSort) => {
    updateBoard({
      cards: sortCardsInColumn(board.cards, columnId, sort),
    });
  };

  const handleAddColumn = () => {
    updateBoard({
      columns: [
        ...board.columns,
        createTaskColumn(
          'New column',
          TaskBoardColor.Gray,
          board.columns.length,
        ),
      ],
    });
  };

  const handleAddCard = (columnId: string) => {
    const order = board.cards.filter(
      (card) => card.columnId === columnId,
    ).length;
    const card = createTaskCard(columnId, order);
    updateBoard({
      cards: [...board.cards, card],
    });
    setOpenCardId(card.id);
  };

  const handleCardChange = (cardId: string, patch: Partial<TaskCard>) => {
    const current = board.cards.find((card) => card.id === cardId);

    if (!current) {
      return;
    }

    if (patch.columnId && patch.columnId !== current.columnId) {
      updateBoard({
        cards: moveCard({
          cards: board.cards.map((card) =>
            card.id === cardId ? { ...card, ...patch } : card,
          ),
          cardId,
          targetColumnId: patch.columnId,
          targetIndex: board.cards.filter(
            (card) => card.columnId === patch.columnId,
          ).length,
        }),
      });
      return;
    }

    updateBoard({
      cards: board.cards.map((card) =>
        card.id === cardId ? { ...card, ...patch } : card,
      ),
    });
  };

  const handleDeleteCard = (cardId: string) => {
    updateBoard({
      cards: board.cards.filter((card) => card.id !== cardId),
    });
    if (openCardId === cardId) {
      setOpenCardId(null);
    }
  };

  const handleColumnPointerDown = (
    columnId: string,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (!editable || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const fromIndex = orderedColumns.findIndex(
      (column) => column.id === columnId,
    );
    const rect = columnRefs.current.get(columnId)?.getBoundingClientRect();

    if (fromIndex < 0 || !rect) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    movedRef.current = false;
    columnRectsRef.current = orderedColumns.map((column) => {
      const nextRect = columnRefs.current
        .get(column.id)
        ?.getBoundingClientRect();

      return {
        left: nextRect?.left ?? 0,
        width: nextRect?.width ?? TASK_BOARD_COLUMN_WIDTH_PX,
      };
    });
    const nextDrag: ColumnDragState = {
      columnId,
      fromIndex,
      toIndex: fromIndex,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: rect.left,
      y: rect.top,
    };
    columnDragRef.current = nextDrag;
    setColumnDrag(nextDrag);
  };

  const handleCardPointerDown = (
    cardId: string,
    event: React.PointerEvent<HTMLElement>,
  ) => {
    if (!editable || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const card = board.cards.find((item) => item.id === cardId);
    const handle = event.currentTarget;
    const article = handle.closest('article');
    const rect = article?.getBoundingClientRect();

    if (!card || !rect) {
      return;
    }

    const column = orderedColumns.find((item) => item.id === card.columnId);

    handle.setPointerCapture(event.pointerId);
    movedRef.current = false;
    const nextDrag: CardDragState = {
      cardId,
      title: card.title.trim() || 'Untitled',
      color: column?.color ?? TaskBoardColor.Gray,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: rect.left,
      y: rect.top,
      columnId: card.columnId,
      index: cardsInColumn(board.cards, card.columnId).findIndex(
        (item) => item.id === cardId,
      ),
    };
    cardDragRef.current = nextDrag;
    setCardDrag(nextDrag);
  };

  const stride = TASK_BOARD_COLUMN_WIDTH_PX + TASK_BOARD_COLUMN_GAP_PX;
  const draggedColumn = columnDrag
    ? orderedColumns.find((column) => column.id === columnDrag.columnId)
    : null;

  return (
    <NodeViewWrapper
      data-type="task-board"
      className="linler-task-board-wrap"
      onMouseDown={(event: React.MouseEvent) => event.stopPropagation()}
      onPointerDown={() => {
        if (!openCardId) {
          emitBoardAwareness();
        }
      }}
    >
      <RemoteUserFrame users={boardUsers}>
        <div className="mb-3 flex items-center gap-2 px-1 pt-1">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="h-8 pl-7"
            />
          </div>
        </div>

        <div className="linler-task-board-scroller">
          <div className="flex w-max min-w-full items-start gap-3 pb-2">
            {orderedColumns.map((column: TaskColumn, index) => (
              <TaskBoardColumn
                key={column.id}
                column={column}
                cards={visibleCards}
                members={members}
                editable={editable}
                users={usersByColumnId[column.id] ?? []}
                cardUsersById={usersByCardId}
                isDropTarget={
                  cardDrag?.columnId === column.id ||
                  columnDrag?.toIndex === index
                }
                draggingCardId={cardDrag?.cardId ?? null}
                insertIndex={
                  cardDrag?.columnId === column.id ? cardDrag.index : null
                }
                shiftX={
                  columnDrag
                    ? columnShiftPx(
                        index,
                        columnDrag.fromIndex,
                        columnDrag.toIndex,
                        stride,
                      )
                    : 0
                }
                onRename={(name) => handleRenameColumn(column.id, name)}
                onColorChange={(color) => handleColorChange(column.id, color)}
                onDelete={() => handleDeleteColumn(column.id)}
                onSort={(sort) => handleSortColumn(column.id, sort)}
                onAddCard={() => handleAddCard(column.id)}
                onOpenCard={(cardId) => {
                  if (movedRef.current) {
                    movedRef.current = false;
                    return;
                  }

                  setOpenCardId(cardId);
                }}
                onColumnPointerDown={(event) =>
                  handleColumnPointerDown(column.id, event)
                }
                onColumnFocus={() => emitColumnAwareness(column.id)}
                onCardPointerDown={handleCardPointerDown}
                onColumnRef={(element) => {
                  if (element) {
                    columnRefs.current.set(column.id, element);
                  } else {
                    columnRefs.current.delete(column.id);
                  }
                }}
              />
            ))}

            {editable ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground mt-2 shrink-0"
                onClick={handleAddColumn}
              >
                <Plus className="size-4" />
                Add column
              </Button>
            ) : null}
          </div>
        </div>

        <TaskCardSheet
          card={openCard}
          column={openColumn}
          columns={orderedColumns}
          members={members}
          editable={editable}
          users={openCard ? (usersByCardId[openCard.id] ?? []) : []}
          pageId={pageId}
          projectId={projectId}
          open={Boolean(openCard)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setOpenCardId(null);
              emitBoardAwareness();
            }
          }}
          onCardAwareness={() => {
            if (openCard) {
              emitCardAwareness(openCard.id);
            }
          }}
          onDescriptionAwareness={(blockId) => {
            if (openCard) {
              emitCardDescriptionAwareness(openCard.id, blockId);
            }
          }}
          onChange={handleCardChange}
          onDelete={handleDeleteCard}
        />

        {columnDrag && draggedColumn && typeof document !== 'undefined'
          ? createPortal(
              <div
                className="z-80 pointer-events-none fixed rounded-2xl p-3 shadow-2xl"
                style={{
                  left: columnDrag.x,
                  top: columnDrag.y,
                  width: columnDrag.width,
                  minHeight: 88,
                  background: 'var(--background)',
                  opacity: 0.92,
                  transform: 'rotate(2deg)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${TASK_BOARD_COLOR_STYLES[draggedColumn.color].dot}`}
                  />
                  <p className="text-sm font-medium">{draggedColumn.name}</p>
                </div>
              </div>,
              document.body,
            )
          : null}

        {cardDrag && typeof document !== 'undefined'
          ? createPortal(
              <div
                className="bg-background z-80 pointer-events-none fixed rounded-xl p-3 shadow-2xl ring-1 ring-black/10"
                style={{
                  left: cardDrag.x,
                  top: cardDrag.y,
                  width: cardDrag.width,
                  opacity: 0.92,
                  transform: 'rotate(2deg)',
                }}
              >
                <p className="text-sm font-medium">{cardDrag.title}</p>
              </div>,
              document.body,
            )
          : null}
      </RemoteUserFrame>
    </NodeViewWrapper>
  );
}
