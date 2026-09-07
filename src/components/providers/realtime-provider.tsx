'use client';

import {
  getRealtimeConnectionSnapshot,
  realtimeClient,
  subscribeRealtimeConnection,
} from '@/src/api/realtime/realtime-client';
import { AuthService } from '@/src/api/services/client/auth.service';
import { RealtimeEvent } from '@/src/constants/realtime.constants';
import { useRealtimeEntityEvents } from '@/src/hooks/realtime/use-realtime-entity-events';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import type {
  PresenceJoinedPayload,
  PresenceLeftPayload,
  PresenceSyncPayload,
} from '@/src/types/realtime.types';
import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type JSX,
  type PropsWithChildren,
} from 'react';

const EMPTY_ONLINE_USER_IDS: ReadonlySet<string> = new Set();

export type RealtimePresenceValue = {
  isConnected: boolean;
  onlineUserIds: ReadonlySet<string>;
  lastSeenAtByUserId: Readonly<Record<string, string>>;
};

export const RealtimePresenceContext = createContext<RealtimePresenceValue>({
  isConnected: false,
  onlineUserIds: EMPTY_ONLINE_USER_IDS,
  lastSeenAtByUserId: {},
});

export function RealtimeProvider({ children }: PropsWithChildren): JSX.Element {
  const { data: user } = useGetUser();
  const workspaceId = useCurrentWorkspaceId();
  useRealtimeEntityEvents();
  const socketConnected = useSyncExternalStore(
    subscribeRealtimeConnection,
    getRealtimeConnectionSnapshot,
    () => false,
  );
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [lastSeenAtByUserId, setLastSeenAtByUserId] = useState<
    Record<string, string>
  >({});

  const userId = user?.id;
  const isConnected = Boolean(userId) && socketConnected;
  const joinedWorkspaceIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!userId) {
      realtimeClient.disconnect();
      return;
    }

    let didRefreshSession = false;

    const onConnectError = async () => {
      if (didRefreshSession) {
        return;
      }

      didRefreshSession = true;

      try {
        await AuthService.getUser();
      } catch {
        realtimeClient.disconnect();
      }
    };

    realtimeClient.disconnect();
    realtimeClient.on('connect_error', onConnectError);
    realtimeClient.connect();

    return () => {
      realtimeClient.off('connect_error', onConnectError);
      realtimeClient.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !workspaceId) {
      joinedWorkspaceIdRef.current = undefined;

      if (userId) {
        realtimeClient.leaveWorkspace();
      }

      return;
    }

    const onSync = (payload: unknown) => {
      const data = payload as PresenceSyncPayload;

      if (data.workspaceId !== workspaceId) {
        return;
      }

      setOnlineUserIds((current) => {
        const nextIds = [
          ...data.users.map((presenceUser) => presenceUser.id),
          userId,
        ];
        const next = new Set(nextIds);

        if (
          current.size === next.size &&
          nextIds.every((id) => current.has(id))
        ) {
          return current;
        }

        return next;
      });
    };

    const onJoined = (payload: unknown) => {
      const data = payload as PresenceJoinedPayload;

      if (data.workspaceId !== workspaceId) {
        return;
      }

      setOnlineUserIds((current) => {
        if (current.has(data.user.id)) {
          return current;
        }

        const next = new Set(current);
        next.add(data.user.id);
        return next;
      });
    };

    const onLeft = (payload: unknown) => {
      const data = payload as PresenceLeftPayload;

      if (data.workspaceId !== workspaceId) {
        return;
      }

      setOnlineUserIds((current) => {
        if (!current.has(data.userId)) {
          return current;
        }

        const next = new Set(current);
        next.delete(data.userId);
        return next;
      });

      setLastSeenAtByUserId((current) => ({
        ...current,
        [data.userId]: data.lastSeenAt,
      }));
    };

    realtimeClient.on(RealtimeEvent.PRESENCE_SYNC, onSync);
    realtimeClient.on(RealtimeEvent.PRESENCE_JOINED, onJoined);
    realtimeClient.on(RealtimeEvent.PRESENCE_LEFT, onLeft);

    if (joinedWorkspaceIdRef.current !== workspaceId) {
      joinedWorkspaceIdRef.current = workspaceId;
      setOnlineUserIds(new Set([userId]));
      setLastSeenAtByUserId({});
    } else {
      setOnlineUserIds((current) => {
        if (current.has(userId)) {
          return current;
        }

        const next = new Set(current);
        next.add(userId);
        return next;
      });
    }

    realtimeClient.joinWorkspace(workspaceId);
    realtimeClient.emit(RealtimeEvent.PAGE_AWARENESS_REQUEST, { workspaceId });

    const retryJoin = window.setTimeout(() => {
      realtimeClient.joinWorkspace(workspaceId);
      realtimeClient.emit(RealtimeEvent.PAGE_AWARENESS_REQUEST, {
        workspaceId,
      });
    }, 400);

    return () => {
      window.clearTimeout(retryJoin);
      realtimeClient.off(RealtimeEvent.PRESENCE_SYNC, onSync);
      realtimeClient.off(RealtimeEvent.PRESENCE_JOINED, onJoined);
      realtimeClient.off(RealtimeEvent.PRESENCE_LEFT, onLeft);
      realtimeClient.leaveWorkspace();
    };
  }, [userId, workspaceId]);

  const value = useMemo<RealtimePresenceValue>(
    () => ({
      isConnected,
      onlineUserIds: workspaceId ? onlineUserIds : EMPTY_ONLINE_USER_IDS,
      lastSeenAtByUserId,
    }),
    [isConnected, lastSeenAtByUserId, onlineUserIds, workspaceId],
  );

  return (
    <RealtimePresenceContext.Provider value={value}>
      {children}
    </RealtimePresenceContext.Provider>
  );
}
