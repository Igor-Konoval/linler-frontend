'use client';

import { realtimeClient } from '@/src/api/realtime/realtime-client';
import type { RemoteBlockAwareness } from '@/src/components/editor/collaboration-highlight';
import {
  RealtimeEvent,
  TASK_BOARD_BROADCAST_DEBOUNCE_MS,
  TASK_COLUMN_AWARENESS_PREFIX,
} from '@/src/constants/realtime.constants';
import {
  holdEditorAwareness,
  releaseEditorAwareness,
  setLastLocalAwarenessBlockId,
} from '@/src/hooks/realtime/use-page-awareness';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import type {
  PageAwarenessPayload,
  PageAwarenessSyncPayload,
  TaskBoardChangedPayload,
} from '@/src/types/realtime.types';
import type { TaskBoardAttrs } from '@/src/types/task-board.types';
import { TaskBoardNodeName } from '@/src/types/task-board.types';
import { getUserColor } from '@/src/utils/user-color.utils';
import {
  areTaskBoardsEqual,
  cloneTaskBoard,
  parseTaskBoardAttrs,
} from '@/src/utils/task-board.utils';
import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getTaskBoardAwarenessId,
  getTaskCardAwarenessId,
  getTaskCardDescriptionAwarenessId,
  getTaskColumnAwarenessId,
  parseTaskCardAwareness,
} from '@/src/utils/realtime.utils';

function toRemoteAwareness(
  payload: PageAwarenessPayload,
): RemoteBlockAwareness | null {
  if (!payload.blockId) {
    return null;
  }

  return {
    userId: payload.user.id,
    username: payload.user.username,
    color: getUserColor(payload.user.id),
    blockId: payload.blockId,
  };
}

function groupTaskAwareness(
  users: RemoteBlockAwareness[],
  boardId: string,
): {
  boardUsers: RemoteBlockAwareness[];
  usersByCardId: Record<string, RemoteBlockAwareness[]>;
  usersByColumnId: Record<string, RemoteBlockAwareness[]>;
} {
  const boardAwarenessId = getTaskBoardAwarenessId(boardId);
  const boardUsers: RemoteBlockAwareness[] = [];
  const usersByCardId: Record<string, RemoteBlockAwareness[]> = {};
  const usersByColumnId: Record<string, RemoteBlockAwareness[]> = {};

  for (const user of users) {
    if (user.blockId === boardAwarenessId) {
      boardUsers.push(user);
      continue;
    }

    if (user.blockId.startsWith(TASK_COLUMN_AWARENESS_PREFIX)) {
      const columnId = user.blockId.slice(TASK_COLUMN_AWARENESS_PREFIX.length);
      const current = usersByColumnId[columnId] ?? [];
      current.push(user);
      usersByColumnId[columnId] = current;
      continue;
    }

    const cardAwareness = parseTaskCardAwareness(user.blockId);

    if (cardAwareness) {
      const current = usersByCardId[cardAwareness.cardId] ?? [];
      current.push(user);
      usersByCardId[cardAwareness.cardId] = current;
    }
  }

  return { boardUsers, usersByCardId, usersByColumnId };
}

export function useTaskBoardRealtime({
  editor,
  getPos,
  pageId,
  boardId,
  enabled,
  isBusy,
}: {
  editor: Editor;
  getPos: () => number | undefined;
  pageId: string;
  boardId: string;
  enabled: boolean;
  isBusy: () => boolean;
}): {
  boardUsers: RemoteBlockAwareness[];
  usersByCardId: Record<string, RemoteBlockAwareness[]>;
  usersByColumnId: Record<string, RemoteBlockAwareness[]>;
  emitBoardAwareness: () => void;
  emitColumnAwareness: (columnId: string) => void;
  emitCardAwareness: (cardId: string) => void;
  emitCardDescriptionAwareness: (
    cardId: string,
    blockId?: string | null,
  ) => void;
  holdCardAwareness: (cardId: string) => void;
  releaseCardAwareness: () => void;
  broadcastBoard: (next: TaskBoardAttrs) => void;
} {
  const { data: user } = useGetUser();
  const workspaceId = useCurrentWorkspaceId();
  const [remoteByUserId, setRemoteByUserId] = useState<
    Record<string, RemoteBlockAwareness>
  >({});
  const applyingRemoteRef = useRef(false);
  const emitTimerRef = useRef<number | null>(null);
  const pendingBoardRef = useRef<TaskBoardAttrs | null>(null);
  const getPosRef = useRef(getPos);
  const isBusyRef = useRef(isBusy);
  const workspaceIdRef = useRef(workspaceId);
  const holdToken = `task-board-sheet:${boardId}`;

  useEffect(() => {
    getPosRef.current = getPos;
    isBusyRef.current = isBusy;
    workspaceIdRef.current = workspaceId;
  }, [getPos, isBusy, workspaceId]);

  const emitAwareness = useCallback(
    (blockId: string | null) => {
      if (!enabled || !workspaceId || !pageId) {
        return;
      }

      setLastLocalAwarenessBlockId(blockId);
      realtimeClient.emit(RealtimeEvent.PAGE_AWARENESS, {
        workspaceId,
        pageId,
        blockId,
      });
    },
    [enabled, pageId, workspaceId],
  );

  const emitBoardAwareness = useCallback(() => {
    if (!boardId) {
      return;
    }

    emitAwareness(getTaskBoardAwarenessId(boardId));
  }, [boardId, emitAwareness]);

  const emitColumnAwareness = useCallback(
    (columnId: string) => {
      emitAwareness(getTaskColumnAwarenessId(columnId));
    },
    [emitAwareness],
  );

  const emitCardAwareness = useCallback(
    (cardId: string) => {
      emitAwareness(getTaskCardAwarenessId(cardId));
    },
    [emitAwareness],
  );

  const emitCardDescriptionAwareness = useCallback(
    (cardId: string, blockId?: string | null) => {
      emitAwareness(getTaskCardDescriptionAwarenessId(cardId, blockId));
    },
    [emitAwareness],
  );

  const holdCardAwareness = useCallback(
    (cardId: string) => {
      holdEditorAwareness(holdToken);
      emitCardAwareness(cardId);
    },
    [emitCardAwareness, holdToken],
  );

  const releaseCardAwareness = useCallback(() => {
    releaseEditorAwareness(holdToken);
  }, [holdToken]);

  const broadcastBoard = useCallback(
    (next: TaskBoardAttrs) => {
      if (!enabled || !workspaceId || !pageId || !boardId) {
        return;
      }

      if (applyingRemoteRef.current) {
        return;
      }

      pendingBoardRef.current = next;

      if (emitTimerRef.current) {
        window.clearTimeout(emitTimerRef.current);
      }

      emitTimerRef.current = window.setTimeout(() => {
        const board = pendingBoardRef.current;

        if (!board || !workspaceId) {
          return;
        }

        realtimeClient.emit(RealtimeEvent.TASK_BOARD_CHANGED, {
          workspaceId,
          pageId,
          boardId,
          board,
        });
      }, TASK_BOARD_BROADCAST_DEBOUNCE_MS);
    },
    [boardId, enabled, pageId, workspaceId],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onAwareness = (payload: unknown) => {
      const data = payload as PageAwarenessPayload;

      if (data.pageId !== pageId || data.user.id === user?.id) {
        return;
      }

      setRemoteByUserId((current) => {
        if (!data.blockId) {
          if (!current[data.user.id]) {
            return current;
          }

          const next = { ...current };
          delete next[data.user.id];
          return next;
        }

        const remote = toRemoteAwareness(data);

        if (!remote) {
          return current;
        }

        return {
          ...current,
          [data.user.id]: remote,
        };
      });
    };

    const onAwarenessSync = (payload: unknown) => {
      const data = payload as PageAwarenessSyncPayload;

      if (data.workspaceId !== workspaceId) {
        return;
      }

      setRemoteByUserId((current) => {
        const next: Record<string, RemoteBlockAwareness> = {};

        for (const entry of data.entries) {
          if (entry.pageId !== pageId || entry.user.id === user?.id) {
            continue;
          }

          const remote = toRemoteAwareness(entry);

          if (!remote) {
            continue;
          }

          next[entry.user.id] = remote;
        }

        const currentIds = Object.keys(current);
        const nextIds = Object.keys(next);

        if (
          currentIds.length === nextIds.length &&
          nextIds.every(
            (id) =>
              current[id]?.blockId === next[id]?.blockId &&
              current[id]?.username === next[id]?.username,
          )
        ) {
          return current;
        }

        return next;
      });
    };

    const onBoardChanged = (payload: unknown) => {
      const data = payload as TaskBoardChangedPayload;

      if (
        data.pageId !== pageId ||
        data.boardId !== boardId ||
        data.actorUserId === user?.id
      ) {
        return;
      }

      if (isBusyRef.current() || editor.isDestroyed) {
        return;
      }

      const pos = getPosRef.current();

      if (typeof pos !== 'number') {
        return;
      }

      const node = editor.state.doc.nodeAt(pos);

      if (!node || node.type.name !== TaskBoardNodeName.TaskBoard) {
        return;
      }

      const local = parseTaskBoardAttrs(node.attrs);
      const remote = parseTaskBoardAttrs(data.board);

      if (areTaskBoardsEqual(local, remote)) {
        return;
      }

      applyingRemoteRef.current = true;
      editor.view.dispatch(
        editor.state.tr
          .setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...cloneTaskBoard(remote),
          })
          .setMeta('skipSave', true)
          .setMeta('addToHistory', false),
      );
      applyingRemoteRef.current = false;
    };

    realtimeClient.on(RealtimeEvent.PAGE_AWARENESS, onAwareness);
    realtimeClient.on(RealtimeEvent.PAGE_AWARENESS_SYNC, onAwarenessSync);
    realtimeClient.on(RealtimeEvent.TASK_BOARD_CHANGED, onBoardChanged);

    return () => {
      realtimeClient.off(RealtimeEvent.PAGE_AWARENESS, onAwareness);
      realtimeClient.off(RealtimeEvent.PAGE_AWARENESS_SYNC, onAwarenessSync);
      realtimeClient.off(RealtimeEvent.TASK_BOARD_CHANGED, onBoardChanged);
    };
  }, [boardId, editor, enabled, pageId, user?.id, workspaceId]);

  useEffect(() => {
    return () => {
      if (emitTimerRef.current) {
        window.clearTimeout(emitTimerRef.current);
      }

      const pending = pendingBoardRef.current;
      const currentWorkspaceId = workspaceIdRef.current;

      if (pending && currentWorkspaceId && pageId && boardId) {
        realtimeClient.emit(RealtimeEvent.TASK_BOARD_CHANGED, {
          workspaceId: currentWorkspaceId,
          pageId,
          boardId,
          board: pending,
        });
      }

      releaseEditorAwareness(holdToken);
    };
  }, [boardId, holdToken, pageId]);

  const grouped = useMemo(
    () => groupTaskAwareness(Object.values(remoteByUserId), boardId),
    [boardId, remoteByUserId],
  );

  return {
    boardUsers: grouped.boardUsers,
    usersByCardId: grouped.usersByCardId,
    usersByColumnId: grouped.usersByColumnId,
    emitBoardAwareness,
    emitColumnAwareness,
    emitCardAwareness,
    emitCardDescriptionAwareness,
    holdCardAwareness,
    releaseCardAwareness,
    broadcastBoard,
  };
}
