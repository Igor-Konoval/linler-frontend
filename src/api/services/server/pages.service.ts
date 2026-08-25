import type {
  CreateProjectPageRequest,
  GetSidebarPagesResponse,
  PageResponse,
} from '@/src/types/pages.types';
import { serverHttp } from '../../http/server-http';

export const PagesService = {
  apiUrl: '/pages',
  projectApiUrl: '/projects',

  getPage(pageId: string) {
    return serverHttp.request<PageResponse, void>({
      endpoint: `${this.apiUrl}/${pageId}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  getSidebarPages(projectId: string) {
    return serverHttp.request<GetSidebarPagesResponse, void>({
      endpoint: `${this.projectApiUrl}/${projectId}/pages`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  createProjectPage(projectId: string, request: CreateProjectPageRequest) {
    return serverHttp.request<PageResponse, CreateProjectPageRequest>({
      endpoint: `${this.projectApiUrl}/${projectId}/pages`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },
};
