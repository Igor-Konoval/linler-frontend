'use client';

import { realtimeClient } from '@/src/api/realtime/realtime-client';
import { getAwarenessBlockId } from '@/src/components/editor/block-id';
import type { RemoteBlockAwareness } from '@/src/components/editor/collaboration-highlight';
import {
  PAGE_COVER_BLOCK_ID,
  PAGE_TITLE_BLOCK_ID,
  RealtimeEvent,
} from '@/src/constants/realtime.constants';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useWorkspacePresence } from '@/src/hooks/realtime/use-workspace-presence';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import type {
  PageAwarenessPayload,
  PageAwarenessSyncPayload,
} from '@/src/types/realtime.types';
import { getUserColor } from '@/src/utils/user-color.utils';
import type { Editor } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function applyEditorAwareness(
  editor: Editor | null,
  users: RemoteBlockAwareness[],
): void {
  if (!editor || editor.isDestroyed) {
    return;
  }

  const editorUsers = users.filter(
    (entry) =>
      entry.blockId !== PAGE_TITLE_BLOCK_ID &&
      entry.blockId !== PAGE_COVER_BLOCK_ID,
  );

  editor.view.dispatch(
    editor.state.tr
      .setMeta('pageAwareness', editorUsers)
      .setMeta('addToHistory', false)
      .setMeta('skipSave', true),
  );
}

export function usePageAwareness({
  editor,
  pageId,
  enabled,
}: {
  editor: Editor | null;
  pageId: string;
  enabled: boolean;
}): {
  titleUsers: RemoteBlockAwareness[];
  coverUsers: RemoteBlockAwareness[];
  emitTitleAwareness: () => void;
  emitCoverAwareness: () => void;
} {
  const { data: user } = useGetUser();
  const workspaceId = useCurrentWorkspaceId();
  const { isConnected } = useWorkspacePresence();
  const [remoteByUserId, setRemoteByUserId] = useState<
    Record<string, RemoteBlockAwareness>
  >({});
  const lastBlockIdRef = useRef<string | null>(null);

  const emitAwareness = useCallback(
    (blockId: string | null) => {
      if (!enabled || !workspaceId) {
        return;
      }

      lastBlockIdRef.current = blockId;
      realtimeClient.emit(RealtimeEvent.PAGE_AWARENESS, {
        workspaceId,
        pageId,
        blockId,
      });
    },
    [enabled, pageId, workspaceId],
  );

  const emitTitleAwareness = useCallback(() => {
    emitAwareness(PAGE_TITLE_BLOCK_ID);
  }, [emitAwareness]);

  const emitCoverAwareness = useCallback(() => {
    emitAwareness(PAGE_COVER_BLOCK_ID);
  }, [emitAwareness]);

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

    realtimeClient.on(RealtimeEvent.PAGE_AWARENESS, onAwareness);
    realtimeClient.on(RealtimeEvent.PAGE_AWARENESS_SYNC, onAwarenessSync);

    return () => {
      realtimeClient.off(RealtimeEvent.PAGE_AWARENESS, onAwareness);
      realtimeClient.off(RealtimeEvent.PAGE_AWARENESS_SYNC, onAwarenessSync);
    };
  }, [enabled, pageId, user?.id, workspaceId]);

  useEffect(() => {
    if (!enabled || !workspaceId || !isConnected) {
      return;
    }

    realtimeClient.emit(RealtimeEvent.PAGE_AWARENESS_REQUEST, {
      workspaceId,
    });
  }, [enabled, isConnected, pageId, workspaceId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return () => {
      emitAwareness(null);
    };
  }, [emitAwareness, enabled, pageId]);

  useEffect(() => {
    if (!editor || !enabled) {
      return;
    }

    const emitSelection = () => {
      const blockId = getAwarenessBlockId(editor.state.selection.$from);

      if (blockId === lastBlockIdRef.current) {
        return;
      }

      emitAwareness(blockId);
    };

    emitSelection();
    editor.on('selectionUpdate', emitSelection);
    editor.on('focus', emitSelection);

    return () => {
      editor.off('selectionUpdate', emitSelection);
      editor.off('focus', emitSelection);
    };
  }, [editor, emitAwareness, enabled]);

  const remoteUsers = useMemo(
    () => Object.values(remoteByUserId),
    [remoteByUserId],
  );

  const lastAppliedAwarenessRef = useRef<string | null>(null);

  useEffect(() => {
    const fingerprint = `${editor ? 'ready' : 'empty'}:${remoteUsers
      .map((entry) => `${entry.userId}:${entry.blockId}`)
      .join('|')}`;

    if (fingerprint === lastAppliedAwarenessRef.current) {
      return;
    }

    lastAppliedAwarenessRef.current = fingerprint;
    applyEditorAwareness(editor, remoteUsers);
  }, [editor, remoteUsers]);

  return {
    titleUsers: remoteUsers.filter(
      (entry) => entry.blockId === PAGE_TITLE_BLOCK_ID,
    ),
    coverUsers: remoteUsers.filter(
      (entry) => entry.blockId === PAGE_COVER_BLOCK_ID,
    ),
    emitTitleAwareness,
    emitCoverAwareness,
  };
}
