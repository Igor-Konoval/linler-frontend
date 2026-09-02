import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TaskBoardNodeName } from '@/src/types/task-board.types';
import {
  createDefaultTaskBoard,
  parseTaskBoardAttrs,
} from '@/src/utils/task-board.utils';
import { TaskBoardView } from './task-board-view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    taskBoard: {
      insertTaskBoard: () => ReturnType;
    };
  }
}

export const TaskBoard = Node.create<{
  projectId: string;
  getPageId?: () => string;
}>({
  name: TaskBoardNodeName.TaskBoard,
  group: 'block',
  atom: true,
  draggable: false,
  selectable: true,
  isolating: true,

  addOptions() {
    return {
      projectId: '',
      getPageId: undefined,
    };
  },

  addAttributes() {
    return {
      boardId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-board-id'),
        renderHTML: (attributes) =>
          attributes.boardId ? { 'data-board-id': attributes.boardId } : {},
      },
      columns: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute('data-columns');

          if (!raw) {
            return [];
          }

          try {
            return parseTaskBoardAttrs({
              columns: JSON.parse(raw),
              cards: [],
            }).columns;
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          'data-columns': JSON.stringify(attributes.columns ?? []),
        }),
      },
      cards: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute('data-cards');

          if (!raw) {
            return [];
          }

          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          'data-cards': JSON.stringify(attributes.cards ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="task-board"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'task-board',
        class: 'linler-task-board',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskBoardView, {
      className: 'linler-task-board-node',
    });
  },

  addCommands() {
    return {
      insertTaskBoard:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: createDefaultTaskBoard(),
          }),
    };
  },
});
