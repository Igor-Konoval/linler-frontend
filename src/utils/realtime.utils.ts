import {
  TASK_BOARD_AWARENESS_PREFIX,
  TASK_CARD_AWARENESS_PREFIX,
  TASK_COLUMN_AWARENESS_PREFIX,
  TASK_DESCRIPTION_BLOCK_ID,
} from '../constants/realtime.constants';

export function getTaskBoardAwarenessId(boardId: string): string {
  return `${TASK_BOARD_AWARENESS_PREFIX}${boardId}`;
}

export function getTaskCardAwarenessId(cardId: string): string {
  return `${TASK_CARD_AWARENESS_PREFIX}${cardId}`;
}

export function getTaskCardDescriptionAwarenessId(
  cardId: string,
  blockId?: string | null,
): string {
  const inner =
    blockId && blockId.length > 0 ? blockId : TASK_DESCRIPTION_BLOCK_ID;

  return `${TASK_CARD_AWARENESS_PREFIX}${cardId}:${inner}`;
}

export function getTaskColumnAwarenessId(columnId: string): string {
  return `${TASK_COLUMN_AWARENESS_PREFIX}${columnId}`;
}

export function parseTaskCardAwareness(blockId: string): {
  cardId: string;
  descriptionBlockId: string | null;
} | null {
  if (!blockId.startsWith(TASK_CARD_AWARENESS_PREFIX)) {
    return null;
  }

  const rest = blockId.slice(TASK_CARD_AWARENESS_PREFIX.length);
  const separator = rest.indexOf(':');

  if (separator < 0) {
    return rest.length > 0 ? { cardId: rest, descriptionBlockId: null } : null;
  }

  const cardId = rest.slice(0, separator);
  const descriptionBlockId = rest.slice(separator + 1);

  if (!cardId) {
    return null;
  }

  return {
    cardId,
    descriptionBlockId:
      descriptionBlockId.length > 0 ? descriptionBlockId : null,
  };
}

export function isTaskAwarenessId(blockId: string): boolean {
  return (
    blockId.startsWith(TASK_BOARD_AWARENESS_PREFIX) ||
    blockId.startsWith(TASK_CARD_AWARENESS_PREFIX) ||
    blockId.startsWith(TASK_COLUMN_AWARENESS_PREFIX)
  );
}
