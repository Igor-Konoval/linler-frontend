import type { TiptapDocument } from '@/src/types/pages.types';
import {
  TaskBoardColor,
  TaskCardSort,
  TaskPriority,
} from '@/src/types/task-board.types';

export const TASK_BOARD_COLORS = Object.values(TaskBoardColor);

export const TASK_PRIORITIES = Object.values(TaskPriority);

export const TASK_CARD_SORTS = Object.values(TaskCardSort);

export const TASK_BOARD_COLOR_LABELS: Record<TaskBoardColor, string> = {
  [TaskBoardColor.Gray]: 'Gray',
  [TaskBoardColor.Brown]: 'Brown',
  [TaskBoardColor.Orange]: 'Orange',
  [TaskBoardColor.Yellow]: 'Yellow',
  [TaskBoardColor.Green]: 'Green',
  [TaskBoardColor.Blue]: 'Blue',
  [TaskBoardColor.Purple]: 'Purple',
  [TaskBoardColor.Pink]: 'Pink',
  [TaskBoardColor.Red]: 'Red',
};

export const TASK_BOARD_COLOR_STYLES: Record<
  TaskBoardColor,
  { pill: string; column: string; action: string; dot: string }
> = {
  [TaskBoardColor.Gray]: {
    pill: 'bg-zinc-500/18 text-zinc-700 dark:text-zinc-300',
    column: 'bg-zinc-500/8',
    action: 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200',
    dot: 'bg-zinc-400',
  },
  [TaskBoardColor.Brown]: {
    pill: 'bg-amber-800/18 text-amber-900 dark:text-amber-200',
    column: 'bg-amber-800/10',
    action: 'text-amber-800/80 hover:text-amber-950 dark:text-amber-300',
    dot: 'bg-amber-700',
  },
  [TaskBoardColor.Orange]: {
    pill: 'bg-orange-500/18 text-orange-800 dark:text-orange-200',
    column: 'bg-orange-500/10',
    action: 'text-orange-600 hover:text-orange-800 dark:text-orange-300',
    dot: 'bg-orange-400',
  },
  [TaskBoardColor.Yellow]: {
    pill: 'bg-yellow-400/25 text-yellow-800 dark:text-yellow-200',
    column: 'bg-yellow-400/12',
    action: 'text-yellow-700 hover:text-yellow-900 dark:text-yellow-300',
    dot: 'bg-yellow-400',
  },
  [TaskBoardColor.Green]: {
    pill: 'bg-emerald-500/18 text-emerald-800 dark:text-emerald-200',
    column: 'bg-emerald-500/10',
    action: 'text-emerald-600 hover:text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  [TaskBoardColor.Blue]: {
    pill: 'bg-sky-500/18 text-sky-800 dark:text-sky-200',
    column: 'bg-sky-500/10',
    action: 'text-sky-600 hover:text-sky-800 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  [TaskBoardColor.Purple]: {
    pill: 'bg-violet-500/18 text-violet-800 dark:text-violet-200',
    column: 'bg-violet-500/10',
    action: 'text-violet-600 hover:text-violet-800 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  [TaskBoardColor.Pink]: {
    pill: 'bg-pink-500/18 text-pink-800 dark:text-pink-200',
    column: 'bg-pink-500/10',
    action: 'text-pink-600 hover:text-pink-800 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  [TaskBoardColor.Red]: {
    pill: 'bg-rose-500/18 text-rose-800 dark:text-rose-200',
    column: 'bg-rose-500/10',
    action: 'text-rose-600 hover:text-rose-800 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'High',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.Low]: 'Low',
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  [TaskPriority.High]: 'bg-rose-500/18 text-rose-800 dark:text-rose-200',
  [TaskPriority.Medium]: 'bg-amber-500/18 text-amber-800 dark:text-amber-200',
  [TaskPriority.Low]:
    'bg-emerald-500/18 text-emerald-800 dark:text-emerald-200',
};

export const TASK_CARD_SORT_LABELS: Record<TaskCardSort, string> = {
  [TaskCardSort.Title]: 'By title',
  [TaskCardSort.Priority]: 'By priority',
  [TaskCardSort.DueDate]: 'By due date',
};

export const DEFAULT_TASK_COLUMNS: ReadonlyArray<{
  name: string;
  color: TaskBoardColor;
}> = [
  { name: 'Not started', color: TaskBoardColor.Gray },
  { name: 'In progress', color: TaskBoardColor.Blue },
  { name: 'In testing', color: TaskBoardColor.Purple },
  { name: 'Done', color: TaskBoardColor.Green },
];

export const EMPTY_TASK_DESCRIPTION: TiptapDocument = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

export const TASK_BOARD_COLUMN_WIDTH_PX = 256;
export const TASK_BOARD_COLUMN_GAP_PX = 12;
export const TASK_BOARD_DRAG_TRANSITION = 'transform 180ms ease';
