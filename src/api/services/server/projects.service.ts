import type {
  CreateProjectRequest,
  EditProjectRequest,
  GetProjectsResponse,
  ProjectResponse,
  SetDefaultPageRequest,
} from '@/src/types/projects.types';
import { serverHttp } from '../../http/server-http';

export const ProjectsService = {
  apiUrl: '/projects',
  workspaceApiUrl: '/workspaces',

  getProjects(workspaceId: string) {
    return serverHttp.request<GetProjectsResponse, void>({
      endpoint: `${this.workspaceApiUrl}/${workspaceId}/projects`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  getProject(projectId: string) {
    return serverHttp.request<ProjectResponse, void>({
      endpoint: `${this.apiUrl}/${projectId}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  editProject(projectId: string, request: Partial<EditProjectRequest>) {
    return serverHttp.request<ProjectResponse, Partial<EditProjectRequest>>({
      endpoint: `${this.apiUrl}/${projectId}`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  createProject(workspaceId: string, request: CreateProjectRequest) {
    return serverHttp.request<ProjectResponse, CreateProjectRequest>({
      endpoint: `${this.workspaceApiUrl}/${workspaceId}/projects`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  setDefaultPage(projectId: string, request: SetDefaultPageRequest) {
    return serverHttp.request<ProjectResponse, SetDefaultPageRequest>({
      endpoint: `${this.apiUrl}/${projectId}/default-page`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },
};
