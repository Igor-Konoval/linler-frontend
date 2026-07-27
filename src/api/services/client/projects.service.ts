import type {
  AddProjectMemberRequest,
  EditProjectMemberRequest,
  GetProjectMemberResponse,
  GetProjectMembersResponse,
  GetProjectsResponse,
  RemoveProjectMemberRequest,
} from '@/src/types/projects.types';
import { clientHttp } from '../../http/client-http';

export const ProjectsService = {
  apiUrl: '/projects',
  workspaceApiUrl: '/workspaces',

  getProjects(workspaceId: string) {
    return clientHttp.request<GetProjectsResponse, void>({
      endpoint: `${this.workspaceApiUrl}/${workspaceId}/projects`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  deleteProject(projectId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${projectId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },

  addProjectMember(request: AddProjectMemberRequest, projectId: string) {
    return clientHttp.request<
      GetProjectMemberResponse,
      AddProjectMemberRequest
    >({
      endpoint: `${this.apiUrl}/${projectId}/members`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  getProjectMembers(projectId: string) {
    return clientHttp.request<GetProjectMembersResponse, void>({
      endpoint: `${this.apiUrl}/${projectId}/members`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  editProjectMember(
    request: EditProjectMemberRequest,
    projectId: string,
    userId: string,
  ) {
    return clientHttp.request<
      GetProjectMemberResponse,
      EditProjectMemberRequest
    >({
      endpoint: `${this.apiUrl}/${projectId}/members/${userId}`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  removeProjectMember(request: RemoveProjectMemberRequest) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${request.projectId}/members/${request.userId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },
};
