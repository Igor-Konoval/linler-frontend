import type {
  AddMemberToWorkspaceRequest,
  CreateWorkspaceRequest,
  EditWorkspaceMemberRequest,
  EditWorkspaceRequest,
  GetMineInvitationsResponse,
  GetWorkspaceInvitationsResponse,
  GetWorkspaceMembersResponse,
  GetWorkspaceResponse,
  GetWorkspacesResponse,
  WorkspaceInvitationResponse,
  WorkspaceMemberResponse,
} from '@/src/types/workspaces.types';
import { serverHttp } from '../../http/server-http';
import type { PaginationParams } from '@/src/types/base.types';
import {
  PaginationQueryParams,
  PaginationQueryParamsValues,
} from '@/src/constants/routes.constants';

export const WorkspaceService = {
  apiUrl: '/workspaces',

  getWorkspaces() {
    return serverHttp.request<GetWorkspacesResponse, void>({
      endpoint: `${this.apiUrl}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  getCurrentWorkspace(id: string) {
    return serverHttp.request<GetWorkspaceResponse, void>({
      endpoint: `${this.apiUrl}/${id}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  createWorkspace(request: CreateWorkspaceRequest) {
    return serverHttp.request<GetWorkspaceResponse, CreateWorkspaceRequest>({
      endpoint: `${this.apiUrl}`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  editWorkspace(id: string, request: EditWorkspaceRequest) {
    return serverHttp.request<GetWorkspaceResponse, EditWorkspaceRequest>({
      endpoint: `${this.apiUrl}/${id}`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  getMineInvitations(params?: PaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.set(
      PaginationQueryParams.LIMIT,
      (params?.limit ?? PaginationQueryParamsValues.LIMIT).toString(),
    );
    queryParams.set(
      PaginationQueryParams.PAGE,
      (params?.page ?? PaginationQueryParamsValues.PAGE).toString(),
    );

    return serverHttp.request<GetMineInvitationsResponse, void>({
      endpoint: `${this.apiUrl}/invitations/mine?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  getWorkspaceInvitations(id: string) {
    const queryParams = new URLSearchParams();
    queryParams.set(
      PaginationQueryParams.LIMIT,
      PaginationQueryParamsValues.LIMIT.toString(),
    );
    queryParams.set(
      PaginationQueryParams.PAGE,
      PaginationQueryParamsValues.PAGE.toString(),
    );

    return serverHttp.request<GetWorkspaceInvitationsResponse, void>({
      endpoint: `${this.apiUrl}/${id}/invitations?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  getWorkspaceMembers(workspaceId: string) {
    return serverHttp.request<GetWorkspaceMembersResponse, void>({
      endpoint: `${this.apiUrl}/${workspaceId}/members`,
      method: 'GET',
      retryOnUnauthorized: false,
    });
  },

  addMemberToWorkspace(
    workspaceId: string,
    request: AddMemberToWorkspaceRequest,
  ) {
    return serverHttp.request<
      WorkspaceInvitationResponse,
      AddMemberToWorkspaceRequest
    >({
      endpoint: `${this.apiUrl}/${workspaceId}/invitations`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  editWorkspaceMember(
    id: string,
    userId: string,
    request: Partial<EditWorkspaceMemberRequest>,
  ) {
    return serverHttp.request<
      WorkspaceMemberResponse,
      Partial<EditWorkspaceMemberRequest>
    >({
      endpoint: `${this.apiUrl}/${id}/members/${userId}`,
      method: 'PATCH',
      body: request,
      retryOnUnauthorized: true,
    });
  },
};
