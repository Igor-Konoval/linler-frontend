import {
  DEFAULT_TASK_COLUMNS,
  EMPTY_TASK_DESCRIPTION,
  TASK_BOARD_COLORS,
  TASK_PRIORITIES,
} from '@/src/constants/task-board.constants';
import type { TiptapDocument } from '@/src/types/pages.types';
import {
  TaskBoardColor,
  TaskBoardNodeName,
  type TaskBoardAttrs,
  type TaskCard,
  TaskCardSort,
  type TaskColumn,
  TaskPriority,
} from '@/src/types/task-board.types';

export function createTaskBoardId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `tb_${Date.now().toString(36)}_${Math.random().toString(16).slice(2)}`;
}

export function cloneTaskBoard<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDefaultTaskBoard(): TaskBoardAttrs {
  return {
    boardId: createTaskBoardId(),
    columns: DEFAULT_TASK_COLUMNS.map((column, index) => ({
      id: createTaskBoardId(),
      name: column.name,
      color: column.color,
      order: index,
    })),
    cards: [],
  };
}

export function createTaskColumn(
  name = 'New column',
  color: TaskBoardColor = TaskBoardColor.Gray,
  order = 0,
): TaskColumn {
  return {
    id: createTaskBoardId(),
    name,
    color,
    order,
  };
}

export function createTaskCard(columnId: string, order: number): TaskCard {
  return {
    id: createTaskBoardId(),
    columnId,
    title: '',
    order,
    priority: null,
    startDate: null,
    dueDate: null,
    assigneeId: null,
    description: cloneTaskBoard(EMPTY_TASK_DESCRIPTION),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isTaskBoardColor(value: unknown): value is TaskBoardColor {
  return TASK_BOARD_COLORS.includes(value as TaskBoardColor);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseTaskDescription(value: unknown): TiptapDocument {
  if (!isRecord(value) || value.type !== 'doc') {
    return cloneTaskBoard(EMPTY_TASK_DESCRIPTION);
  }

  return cloneTaskBoard(value) as TiptapDocument;
}

export function collectDocumentText(value: unknown): string {
  if (!isRecord(value)) {
    return '';
  }

  const chunks: string[] = [];

  if (typeof value.text === 'string') {
    chunks.push(value.text);
  }

  if (Array.isArray(value.content)) {
    value.content.forEach((child) => {
      chunks.push(collectDocumentText(child));
    });
  }

  return chunks.join(' ').trim();
}

export function cardMatchesQuery(card: TaskCard, query: string): boolean {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const haystack = [
    card.title,
    card.priority ?? '',
    card.startDate ?? '',
    card.dueDate ?? '',
    collectDocumentText(card.description),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

export function parseTaskBoardAttrs(value: unknown): TaskBoardAttrs {
  if (!isRecord(value)) {
    return createDefaultTaskBoard();
  }

  const columns = Array.isArray(value.columns)
    ? value.columns
        .filter(isRecord)
        .map((column, index) => ({
          id:
            typeof column.id === 'string' && column.id.length > 0
              ? column.id
              : createTaskBoardId(),
          name:
            typeof column.name === 'string' && column.name.trim().length > 0
              ? column.name
              : 'Untitled',
          color: isTaskBoardColor(column.color)
            ? column.color
            : TaskBoardColor.Gray,
          order:
            typeof column.order === 'number' && Number.isFinite(column.order)
              ? column.order
              : index,
        }))
        .sort((a, b) => a.order - b.order)
        .map((column, index) => ({ ...column, order: index }))
    : [];

  const columnIds = new Set(columns.map((column) => column.id));
  const fallbackColumnId = columns[0]?.id ?? null;

  const cards = Array.isArray(value.cards)
    ? value.cards
        .filter(isRecord)
        .map((card, index) => ({
          id:
            typeof card.id === 'string' && card.id.length > 0
              ? card.id
              : createTaskBoardId(),
          columnId:
            typeof card.columnId === 'string' && columnIds.has(card.columnId)
              ? card.columnId
              : (fallbackColumnId ?? ''),
          title: typeof card.title === 'string' ? card.title : '',
          order:
            typeof card.order === 'number' && Number.isFinite(card.order)
              ? card.order
              : index,
          priority: isTaskPriority(card.priority) ? card.priority : null,
          startDate: parseOptionalString(card.startDate),
          dueDate: parseOptionalString(card.dueDate),
          assigneeId: parseOptionalString(card.assigneeId),
          description: parseTaskDescription(card.description),
        }))
        .filter((card) => card.columnId.length > 0)
    : [];

  if (columns.length === 0) {
    return createDefaultTaskBoard();
  }

  return {
    boardId:
      typeof value.boardId === 'string' && value.boardId.length > 0
        ? value.boardId
        : createTaskBoardId(),
    columns,
    cards,
  };
}

export function cardsInColumn(cards: TaskCard[], columnId: string): TaskCard[] {
  return cards
    .filter((card) => card.columnId === columnId)
    .sort((a, b) => a.order - b.order)
    .map((card, index) => ({ ...card, order: index }));
}

export function reorderColumns(
  columns: TaskColumn[],
  fromId: string,
  toId: string,
): TaskColumn[] {
  const ordered = [...columns].sort((a, b) => a.order - b.order);
  const fromIndex = ordered.findIndex((column) => column.id === fromId);
  const toIndex = ordered.findIndex((column) => column.id === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return ordered.map((column, index) => ({ ...column, order: index }));
  }

  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(toIndex, 0, moved);

  return ordered.map((column, index) => ({ ...column, order: index }));
}

export function moveCard(params: {
  cards: TaskCard[];
  cardId: string;
  targetColumnId: string;
  targetIndex: number;
}): TaskCard[] {
  const { cards, cardId, targetColumnId, targetIndex } = params;
  const moving = cards.find((card) => card.id === cardId);

  if (!moving) {
    return cards;
  }

  const without = cards.filter((card) => card.id !== cardId);
  const targetCards = cardsInColumn(without, targetColumnId);
  const clampedIndex = Math.max(0, Math.min(targetIndex, targetCards.length));
  const nextTarget = [...targetCards];
  nextTarget.splice(clampedIndex, 0, { ...moving, columnId: targetColumnId });

  const otherCards = without.filter((card) => card.columnId !== targetColumnId);

  return [
    ...otherCards,
    ...nextTarget.map((card, index) => ({ ...card, order: index })),
  ];
}

export function sortCardsInColumn(
  cards: TaskCard[],
  columnId: string,
  sort: TaskCardSort,
): TaskCard[] {
  const priorityRank: Record<TaskPriority, number> = {
    [TaskPriority.High]: 0,
    [TaskPriority.Medium]: 1,
    [TaskPriority.Low]: 2,
  };

  const columnCards = cardsInColumn(cards, columnId).sort((a, b) => {
    if (sort === TaskCardSort.Title) {
      return a.title.localeCompare(b.title);
    }

    if (sort === TaskCardSort.Priority) {
      const aRank = a.priority ? priorityRank[a.priority] : 3;
      const bRank = b.priority ? priorityRank[b.priority] : 3;
      return aRank - bRank;
    }

    const aDue = a.dueDate ?? '9999-12-31';
    const bDue = b.dueDate ?? '9999-12-31';
    return aDue.localeCompare(bDue);
  });

  const others = cards.filter((card) => card.columnId !== columnId);

  return [
    ...others,
    ...columnCards.map((card, index) => ({ ...card, order: index })),
  ];
}

export function formatTaskBoardDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function columnShiftPx(
  index: number,
  fromIndex: number,
  toIndex: number,
  stride: number,
): number {
  if (index === fromIndex) {
    return 0;
  }

  if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
    return -stride;
  }

  if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
    return stride;
  }

  return 0;
}

export function isTaskBoardNodeType(value: unknown): boolean {
  return value === TaskBoardNodeName.TaskBoard;
}

export function areTaskBoardsEqual(
  left: TaskBoardAttrs,
  right: TaskBoardAttrs,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
