import type { TiptapDocument } from '@/src/types/pages.types';

export enum TaskBoardColor {
  Gray = 'gray',
  Brown = 'brown',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Pink = 'pink',
  Red = 'red',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum TaskCardSort {
  Title = 'title',
  Priority = 'priority',
  DueDate = 'dueDate',
}

export enum TaskBoardNodeName {
  TaskBoard = 'taskBoard',
}

export enum TaskBoardDragKind {
  Card = 'card',
  Column = 'column',
}

export interface TaskColumn {
  id: string;
  name: string;
  color: TaskBoardColor;
  order: number;
}

export interface TaskCard {
  id: string;
  columnId: string;
  title: string;
  order: number;
  priority: TaskPriority | null;
  startDate: string | null;
  dueDate: string | null;
  assigneeId: string | null;
  description: TiptapDocument;
}

export interface TaskBoardAttrs {
  boardId: string;
  columns: TaskColumn[];
  cards: TaskCard[];
}
