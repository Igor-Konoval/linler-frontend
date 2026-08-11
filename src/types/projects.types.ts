import { ProjectVisibility } from '../constants/projects.constants';
import { ProjectMemberRole } from '../constants/workspaces.constants';

export interface GetProjectsResponse {
  projects: ProjectResponse[];
}

export interface ProjectResponse {
  id: string;
  workspaceId: string;
  ownerId: string;
  name: string;
  icon: string | null;
  description: string | null;
  defaultPageId: string | null;
  visibility: ProjectVisibility;
  orderIndex: number;
  isArchived: boolean;
  role: ProjectMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface EditProjectRequest {
  name: string;
  icon: string | null;
  description: string | null;
  visibility: ProjectVisibility;
  orderIndex: number;
  isArchived: boolean;
}

export interface GetProjectMembersResponse {
  members: GetProjectMemberResponse[];
}

export interface GetProjectMemberResponse {
  id: string;
  userId: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  role: ProjectMemberRole;
  createdAt: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  role: ProjectMemberRole;
}

export interface EditProjectMemberRequest {
  role: ProjectMemberRole;
}

export interface RemoveProjectMemberRequest {
  projectId: string;
  userId: string;
}

export interface CreateProjectRequest {
  name: string;
  icon: string | null;
  description: string | null;
  visibility: ProjectVisibility;
}

export interface SetDefaultPageRequest {
  pageId: string;
}
