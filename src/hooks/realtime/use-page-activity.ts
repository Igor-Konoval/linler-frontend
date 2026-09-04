'use client';

import { useSyncExternalStore } from 'react';

export type PageActivityEntry = {
  id: string;
  username: string;
  avatarUrl: string | null;
  updatedAt: string;
};

const EMPTY_ACTIVITY: PageActivityEntry[] = [];
const listeners = new Set<() => void>();
const activityByPageId = new Map<string, PageActivityEntry[]>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function areSameEntries(
  left: PageActivityEntry[],
  right: PageActivityEntry[],
): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (entry, index) =>
      entry.id === right[index]?.id &&
      entry.updatedAt === right[index]?.updatedAt &&
      entry.username === right[index]?.username &&
      entry.avatarUrl === right[index]?.avatarUrl,
  );
}

function mergeEntries(
  current: PageActivityEntry[],
  incoming: PageActivityEntry[],
): PageActivityEntry[] {
  const byId = new Map<string, PageActivityEntry>();

  for (const entry of [...current, ...incoming]) {
    const existing = byId.get(entry.id);

    if (!existing || existing.updatedAt <= entry.updatedAt) {
      byId.set(entry.id, entry);
    }
  }

  return [...byId.values()]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 8);
}

function setPageActivity(
  pageId: string,
  incoming: PageActivityEntry[],
): void {
  const current = activityByPageId.get(pageId) ?? EMPTY_ACTIVITY;
  const next = mergeEntries(current, incoming);

  if (areSameEntries(current, next)) {
    return;
  }

  activityByPageId.set(pageId, next);
  emit();
}

export function seedPageActivity(
  pageId: string,
  entries: PageActivityEntry[],
): void {
  setPageActivity(pageId, entries);
}

export function upsertPageActivity(
  pageId: string,
  entry: PageActivityEntry,
): void {
  setPageActivity(pageId, [entry]);
}

export function getPageActivity(pageId?: string): PageActivityEntry[] {
  if (!pageId) {
    return EMPTY_ACTIVITY;
  }

  return activityByPageId.get(pageId) ?? EMPTY_ACTIVITY;
}

export function subscribePageActivity(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): PageActivityEntry[] {
  return EMPTY_ACTIVITY;
}

export function usePageActivity(pageId?: string): PageActivityEntry[] {
  return useSyncExternalStore(
    subscribePageActivity,
    () => getPageActivity(pageId),
    getServerSnapshot,
  );
}
