import type {
  CreateProjectPageRequest,
  GetPageAttachmentsResponse,
  GetSidebarPagesResponse,
  PageAttachment,
  PageResponse,
  UpdatePageRequest,
} from '@/src/types/pages.types';
import { clientHttp } from '../../http/client-http';

export const PagesService = {
  apiUrl: '/pages',
  projectApiUrl: '/projects',

  getPage(pageId: string) {
    return clientHttp.request<PageResponse, void>({
      endpoint: `${this.apiUrl}/${pageId}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  getSidebarPages(projectId: string) {
    return clientHttp.request<GetSidebarPagesResponse, void>({
      endpoint: `${this.projectApiUrl}/${projectId}/pages`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  updatePage(pageId: string, request: UpdatePageRequest) {
    return clientHttp.request<PageResponse, UpdatePageRequest>({
      endpoint: `${this.apiUrl}/${pageId}`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  attachFile(pageId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return clientHttp.request<PageAttachment, FormData>({
      endpoint: `${this.apiUrl}/${pageId}/attachments`,
      method: 'POST',
      body: formData,
      retryOnUnauthorized: true,
    });
  },

  getPageAttachments(pageId: string) {
    return clientHttp.request<GetPageAttachmentsResponse, void>({
      endpoint: `${this.apiUrl}/${pageId}/attachments`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  deletePageAttachment(pageId: string, attachmentId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${pageId}/attachments/${attachmentId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },

  downloadAttachment(pageId: string, attachmentId: string) {
    return clientHttp.request<Blob, void>({
      endpoint: `${this.apiUrl}/${pageId}/attachments/${attachmentId}/download`,
      method: 'GET',
      responseType: 'blob',
      retryOnUnauthorized: true,
    });
  },

  createProjectPage(projectId: string, request: CreateProjectPageRequest) {
    return clientHttp.request<PageResponse, CreateProjectPageRequest>({
      endpoint: `${this.projectApiUrl}/${projectId}/pages`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  deletePage(pageId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${pageId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },
};
