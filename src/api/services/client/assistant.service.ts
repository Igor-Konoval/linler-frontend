import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from '@/src/types/assistant.types';
import { clientHttp } from '../../http/client-http';

export const AssistantService = {
  apiUrl: '/assistant',

  chat(body: AssistantChatRequest) {
    return clientHttp.request<AssistantChatResponse, AssistantChatRequest>({
      endpoint: `${this.apiUrl}/chat`,
      method: 'POST',
      body,
      retryOnUnauthorized: true,
    });
  },
};
