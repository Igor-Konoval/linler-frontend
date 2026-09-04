'use client';

import { RealtimePresenceContext } from '@/src/components/providers/realtime-provider';
import { useContext } from 'react';

export function useWorkspacePresence() {
  return useContext(RealtimePresenceContext);
}

export function useIsUserOnline(userId?: string): boolean {
  const { onlineUserIds } = useWorkspacePresence();

  if (!userId) {
    return false;
  }

  return onlineUserIds.has(userId);
}
