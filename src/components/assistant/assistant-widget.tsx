'use client';

import { Sparkles } from 'lucide-react';
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { AssistantPanel } from '@/src/components/assistant/assistant-panel';
import { Button } from '@/src/components/ui/button';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import type {
  AssistantConversation,
  AssistantConversationStore,
  AssistantMessage,
} from '@/src/types/assistant.types';
import {
  CONVERSATION_LIMIT,
  EMPTY_SNAPSHOT,
  EMPTY_STORE,
  listeners,
  NEW_CHAT_TITLE,
  snapshots,
  STORAGE_KEY_PREFIX,
  STORED_LIMIT,
  UNSCOPED_STORAGE_KEYS,
} from '@/src/constants/assistant.constants';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStoredConversation(value: unknown): value is Record<
  string,
  unknown
> & {
  id: string;
  title: string;
  messages: unknown[];
  draft: string;
} {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.draft === 'string' &&
    Array.isArray(value.messages)
  );
}

function parseMessages(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is AssistantMessage =>
        isRecord(item) &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string',
    )
    .slice(-STORED_LIMIT);
}

function getConversationTitle(messages: AssistantMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const title = firstUserMessage?.content.trim();

  if (!title) {
    return NEW_CHAT_TITLE;
  }

  return title.length > 36 ? `${title.slice(0, 36)}…` : title;
}

function parseStore(raw: string): AssistantConversationStore {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return EMPTY_STORE;
  }

  if (Array.isArray(parsed)) {
    const messages = parseMessages(parsed);

    return {
      conversations: [
        {
          id: 'legacy-chat',
          title: getConversationTitle(messages),
          messages,
          draft: '',
        },
      ],
      activeConversationId: 'legacy-chat',
    };
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.conversations)) {
    return EMPTY_STORE;
  }

  const conversations: AssistantConversation[] = parsed.conversations
    .filter(isStoredConversation)
    .map((item) => {
      const messages = parseMessages(item.messages);

      return {
        id: item.id,
        title: item.title,
        messages,
        draft: item.draft.slice(0, 2_000),
      };
    })
    .slice(0, CONVERSATION_LIMIT);

  if (conversations.length === 0) {
    return EMPTY_STORE;
  }

  const activeConversationId =
    typeof parsed.activeConversationId === 'string' &&
    conversations.some(
      (conversation) => conversation.id === parsed.activeConversationId,
    )
      ? parsed.activeConversationId
      : conversations[0].id;

  return { conversations, activeConversationId };
}

function readStored(storageKey: string | null): string {
  if (typeof window === 'undefined' || !storageKey) {
    return EMPTY_SNAPSHOT;
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === null ? EMPTY_SNAPSHOT : JSON.stringify(parseStore(stored));
}

function subscribe(
  listener: () => void,
  storageKey: string | null,
): () => void {
  if (!storageKey) {
    return () => {};
  }

  const currentListeners = listeners.get(storageKey) ?? new Set();
  currentListeners.add(listener);
  listeners.set(storageKey, currentListeners);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      snapshots.set(
        storageKey,
        event.newValue
          ? JSON.stringify(parseStore(event.newValue))
          : EMPTY_SNAPSHOT,
      );
      currentListeners.forEach((currentListener) => currentListener());
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    currentListeners.delete(listener);
    if (currentListeners.size === 0) {
      listeners.delete(storageKey);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

function getSnapshot(storageKey: string | null): string {
  if (!storageKey) {
    return EMPTY_SNAPSHOT;
  }

  const snapshot = snapshots.get(storageKey);
  if (snapshot !== undefined) {
    return snapshot;
  }

  const stored = readStored(storageKey);
  snapshots.set(storageKey, stored);
  return stored;
}

function writeStore(
  storageKey: string | null,
  store: AssistantConversationStore,
): void {
  if (!storageKey) {
    return;
  }

  const snapshot = JSON.stringify({
    ...store,
    conversations: store.conversations
      .slice(0, CONVERSATION_LIMIT)
      .map((conversation) => ({
        ...conversation,
        messages: conversation.messages.slice(-STORED_LIMIT),
      })),
  });
  window.localStorage.setItem(storageKey, snapshot);
  snapshots.set(storageKey, snapshot);
  listeners.get(storageKey)?.forEach((listener) => listener());
}

function updateStore(
  storageKey: string | null,
  update: (current: AssistantConversationStore) => AssistantConversationStore,
): void {
  if (!storageKey) {
    return;
  }

  writeStore(storageKey, update(parseStore(getSnapshot(storageKey))));
}

function useConversations(
  storageKey: string | null,
): [
  AssistantConversationStore,
  (
    update: (current: AssistantConversationStore) => AssistantConversationStore,
  ) => void,
] {
  const raw = useSyncExternalStore(
    (listener) => subscribe(listener, storageKey),
    () => getSnapshot(storageKey),
    () => EMPTY_SNAPSHOT,
  );
  return [parseStore(raw), (update) => updateStore(storageKey, update)];
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const { data: user } = useGetUser();
  const storageKey = user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : null;
  const [store, update] = useConversations(storageKey);
  const activeConversation =
    store.conversations.find(
      (conversation) => conversation.id === store.activeConversationId,
    ) ?? store.conversations[0];

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    UNSCOPED_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  }, [user?.id]);

  const setMessages: Dispatch<SetStateAction<AssistantMessage[]>> = (
    change,
  ) => {
    update((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation;
        }

        const messages =
          typeof change === 'function' ? change(conversation.messages) : change;

        return {
          ...conversation,
          messages: messages.slice(-STORED_LIMIT),
          title:
            conversation.title === NEW_CHAT_TITLE
              ? getConversationTitle(messages)
              : conversation.title,
        };
      }),
    }));
  };

  const setDraft: Dispatch<SetStateAction<string>> = (change) => {
    update((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === activeConversation.id
          ? {
              ...conversation,
              draft:
                typeof change === 'function'
                  ? change(conversation.draft)
                  : change,
            }
          : conversation,
      ),
    }));
  };

  const createConversation = () => {
    const conversation: AssistantConversation = {
      id: window.crypto.randomUUID(),
      title: NEW_CHAT_TITLE,
      messages: [],
      draft: '',
    };

    update((current) => ({
      conversations: [conversation, ...current.conversations].slice(
        0,
        CONVERSATION_LIMIT,
      ),
      activeConversationId: conversation.id,
    }));
  };

  const deleteConversation = (id: string) => {
    update((current) => {
      const conversations = current.conversations.filter(
        (conversation) => conversation.id !== id,
      );

      if (conversations.length === 0) {
        const conversation: AssistantConversation = {
          id: window.crypto.randomUUID(),
          title: NEW_CHAT_TITLE,
          messages: [],
          draft: '',
        };

        return {
          conversations: [conversation],
          activeConversationId: conversation.id,
        };
      }

      return {
        ...current,
        conversations,
        activeConversationId:
          current.activeConversationId === id
            ? conversations[0].id
            : current.activeConversationId,
      };
    });
  };

  return (
    <>
      {open ? (
        <AssistantPanel
          conversations={store.conversations}
          activeConversationId={activeConversation.id}
          messages={activeConversation.messages}
          draft={activeConversation.draft}
          onMessagesChange={setMessages}
          onDraftChange={setDraft}
          onCreateConversation={createConversation}
          onDeleteConversation={deleteConversation}
          onSelectConversation={(id) => {
            update((current) => ({
              ...current,
              activeConversationId: id,
            }));
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
      {open ? null : (
        <Button
          type="button"
          size="icon-lg"
          aria-label="Open AI assistant"
          className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Sparkles />
        </Button>
      )}
    </>
  );
}
