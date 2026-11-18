export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantConversation {
  id: string;
  title: string;
  messages: AssistantMessage[];
  draft: string;
}

export interface AssistantConversationStore {
  conversations: AssistantConversation[];
  activeConversationId: string;
}

export interface AssistantChatRequest {
  message: string;
  history: AssistantMessage[];
}

export interface AssistantChatResponse {
  reply: string;
  changed: boolean;
}
