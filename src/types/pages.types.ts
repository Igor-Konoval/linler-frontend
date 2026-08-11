import type { ProjectMemberRole } from '@/src/constants/workspaces.constants';

export type TiptapDocument = {
  type: 'doc';
  content?: Array<Record<string, unknown>>;
};

export interface PageResponse {
  id: string;
  projectId: string;
  parentPageId: string | null;
  title: string;
  icon: string | null;
  cover: string | null;
  width: number;
  height: number;
  objectPositionX: number;
  objectPositionY: number;
  contentWidth: number;
  contentOffsetX: number;
  content: TiptapDocument;
  orderIndex: number;
  isArchived: boolean;
  coverMeta: PageCoverMeta | null;
  editorMeta: PageEditorMeta | null;
  createdById: string;
  updatedById: string;
  attachments: PageAttachment[];
  projectRole: ProjectMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface GetSidebarPagesResponse {
  pages: PageSidebarItem[];
}

export interface PageSidebarItem {
  id: string;
  parentPageId: string | null;
  title: string;
  icon: string | null;
  orderIndex: number;
  isArchived: boolean;
}

export interface PageCoverMeta {
  width: number;
  height: number;
  objectPositionX: number;
  objectPositionY: number;
}

export interface PageEditorMeta {
  contentWidth: number;
  contentOffsetX?: number;
}

export interface PageAttachment {
  id: string;
  pageId: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  fullUrl: string;
  uploadedById: string;
  createdAt: string;
}

export interface GetPageAttachmentsResponse {
  attachments: PageAttachment[];
}

export interface UpdatePageRequest {
  title?: string;
  icon?: string | null;
  cover?: string | null;
  width?: number;
  height?: number;
  objectPositionX?: number;
  objectPositionY?: number;
  contentWidth?: number;
  contentOffsetX?: number;
  coverMeta?: PageCoverMeta | null;
  editorMeta?: PageEditorMeta | null;
  content?: TiptapDocument;
  parentPageId?: string | null;
  orderIndex?: number;
  isArchived?: boolean;
}

export interface CreateProjectPageRequest {
  title: string;
  icon?: string | null;
  parentPageId?: string | null;
}
