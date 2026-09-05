import { io, type Socket } from 'socket.io-client';
import {
  REALTIME_NAMESPACE,
  RealtimeEvent,
} from '@/src/constants/realtime.constants';
import { clientEnv } from '@/src/env/client';
import type { WorkspaceJoinPayload } from '@/src/types/realtime.types';

type RealtimeHandler = (...args: unknown[]) => void;

function getRealtimeUrl(): string {
  const apiUrl = new URL(clientEnv.NEXT_PUBLIC_API_URL);
  return `${apiUrl.origin}${REALTIME_NAMESPACE}`;
}

class RealtimeClient {
  private socket: Socket | null = null;
  private workspaceId: string | undefined;
  private readonly listeners = new Map<string, Set<RealtimeHandler>>();

  connect(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.socket) {
      if (!this.socket.connected) {
        this.socket.connect();
      }

      return;
    }

    this.socket = io(getRealtimeUrl(), {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000,
      timeout: 20_000,
    });

    this.socket.on('connect', () => {
      this.emitJoinIfNeeded();
    });

    this.attachStoredListeners();
    this.socket.connect();
  }

  disconnect(): void {
    if (this.socket?.connected && this.workspaceId) {
      this.socket.emit(RealtimeEvent.WORKSPACE_LEAVE);
    }

    this.workspaceId = undefined;
    this.socket?.disconnect();
    this.socket = null;
  }

  joinWorkspace(workspaceId: string): void {
    this.workspaceId = workspaceId;
    this.emitJoinIfNeeded();
  }

  leaveWorkspace(): void {
    if (this.socket?.connected && this.workspaceId) {
      this.socket.emit(RealtimeEvent.WORKSPACE_LEAVE);
    }

    this.workspaceId = undefined;
  }

  on(event: string, handler: RealtimeHandler): void {
    const handlers = this.listeners.get(event) ?? new Set<RealtimeHandler>();
    handlers.add(handler);
    this.listeners.set(event, handlers);
    this.socket?.on(event, handler);
  }

  off(event: string, handler: RealtimeHandler): void {
    this.listeners.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  get connected(): boolean {
    return Boolean(this.socket?.connected);
  }

  private emitJoinIfNeeded(): void {
    if (!this.socket?.connected || !this.workspaceId) {
      return;
    }

    const payload: WorkspaceJoinPayload = { workspaceId: this.workspaceId };
    this.socket.emit(RealtimeEvent.WORKSPACE_JOIN, payload);
  }

  private attachStoredListeners(): void {
    if (!this.socket) {
      return;
    }

    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) {
        this.socket.on(event, handler);
      }
    }
  }
}

export const realtimeClient = new RealtimeClient();

export function subscribeRealtimeConnection(
  onStoreChange: () => void,
): () => void {
  realtimeClient.on('connect', onStoreChange);
  realtimeClient.on('disconnect', onStoreChange);

  return () => {
    realtimeClient.off('connect', onStoreChange);
    realtimeClient.off('disconnect', onStoreChange);
  };
}

export function getRealtimeConnectionSnapshot(): boolean {
  return realtimeClient.connected;
}
