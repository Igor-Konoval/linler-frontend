import { type AssistantConversationStore } from '../types/assistant.types';

export const HISTORY_LIMIT = 10;
export const HISTORY_CONTENT_MAX_LENGTH = 20_000;
export const MESSAGE_MAX_LENGTH = 2_000;

export const STORAGE_KEY_PREFIX = 'linler-assistant-conversations:';
export const UNSCOPED_STORAGE_KEYS = [
  'linler-assistant-conversations',
  'linler-assistant-transcript',
];
export const STORED_LIMIT = 30;
export const CONVERSATION_LIMIT = 30;
export const NEW_CHAT_TITLE = 'New chat';
export const listeners = new Map<string, Set<() => void>>();
export const snapshots = new Map<string, string>();
export const EMPTY_STORE: AssistantConversationStore = {
  conversations: [
    { id: 'default-chat', title: NEW_CHAT_TITLE, messages: [], draft: '' },
  ],
  activeConversationId: 'default-chat',
};
export const EMPTY_SNAPSHOT = JSON.stringify(EMPTY_STORE);
