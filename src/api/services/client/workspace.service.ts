import type {
  CreateWorkspaceRequest,
  DeleteInvitationRequest,
  GetMineInvitationsResponse,
  GetWorkspaceInvitationsResponse,
  GetWorkspaceResponse,
  GetWorkspacesResponse,
  MarkInvitationAsReadRequest,
  MarkInvitationAsReadResponse,
} from '@/src/types/workspaces.types';
import { clientHttp } from '../../http/client-http';
import { PaginationParams } from '@/src/types/base.types';
import {
  PaginationQueryParams,
  PaginationQueryParamsValues,
} from '@/src/constants/routes.constants';
import type { GetWorkspaceMembersResponse } from '@/src/types/workspaces.types';

export const WorkspaceService = {
  apiUrl: '/workspaces',

  getWorkspaces() {
    return clientHttp.request<GetWorkspacesResponse, void>({
      endpoint: `${this.apiUrl}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  getCurrentWorkspace(id: string) {
    return clientHttp.request<GetWorkspaceResponse, void>({
      endpoint: `${this.apiUrl}/${id}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  createWorkspace(request: CreateWorkspaceRequest) {
    return clientHttp.request<GetWorkspaceResponse, CreateWorkspaceRequest>({
      endpoint: `${this.apiUrl}`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  deleteWorkspace(workspaceId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${workspaceId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },

  leaveWorkspace(workspaceId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${workspaceId}/leave`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  getMineInvitations(params: PaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.set(PaginationQueryParams.LIMIT, params.limit.toString());
    queryParams.set(
      PaginationQueryParams.PAGE,
      params.page?.toString() ?? PaginationQueryParamsValues.PAGE.toString(),
    );

    return clientHttp.request<GetMineInvitationsResponse, void>({
      endpoint: `${this.apiUrl}/invitations/mine?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  getWorkspaceInvitations(id: string, params: PaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.set(PaginationQueryParams.LIMIT, params.limit.toString());
    queryParams.set(
      PaginationQueryParams.PAGE,
      params.page?.toString() ?? PaginationQueryParamsValues.PAGE.toString(),
    );

    return clientHttp.request<GetWorkspaceInvitationsResponse, void>({
      endpoint: `${this.apiUrl}/${id}/invitations?${queryParams.toString()}`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  markInvitationAsRead(request: MarkInvitationAsReadRequest) {
    return clientHttp.request<
      MarkInvitationAsReadResponse,
      MarkInvitationAsReadRequest
    >({
      endpoint: `${this.apiUrl}/invitations/read`,
      method: 'POST',
      body: request,
      retryOnUnauthorized: true,
    });
  },

  markInvitationsAsReadAll() {
    return clientHttp.request<MarkInvitationAsReadResponse, void>({
      endpoint: `${this.apiUrl}/invitations/read-all`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  acceptInvitation(id: string) {
    return clientHttp.request<GetWorkspaceResponse, void>({
      endpoint: `${this.apiUrl}/invitations/${id}/accept`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  declineInvitation(id: string) {
    return clientHttp.request<GetWorkspaceResponse, void>({
      endpoint: `${this.apiUrl}/invitations/${id}/decline`,
      method: 'POST',
      retryOnUnauthorized: true,
    });
  },

  deleteInvitation(request: DeleteInvitationRequest) {
    return clientHttp.request<void, DeleteInvitationRequest>({
      endpoint: `${this.apiUrl}/${request.id}/invitations/${request.invitationId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },

  getWorkspaceMembers(workspaceId: string) {
    return clientHttp.request<GetWorkspaceMembersResponse, void>({
      endpoint: `${this.apiUrl}/${workspaceId}/members`,
      method: 'GET',
      retryOnUnauthorized: true,
    });
  },

  deleteWorkspaceMember(id: string, userId: string) {
    return clientHttp.request<void, void>({
      endpoint: `${this.apiUrl}/${id}/members/${userId}`,
      method: 'DELETE',
      retryOnUnauthorized: true,
    });
  },
};
