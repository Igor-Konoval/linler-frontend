import {
  WorkspaceInvitationStatus,
  WorkspaceMemberStatus,
  WorkspaceRole,
} from '../constants/workspaces.constants';
import type { PaginationMeta } from './base.types';

export interface GetWorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface GetWorkspacesResponse {
  workspaces: GetWorkspaceResponse[];
}

export interface CreateWorkspaceRequest {
  name: string;
}

export interface EditWorkspaceRequest {
  name: string;
}

export interface GetMineInvitationsResponse {
  invitations: InvitationResponse[];
  unreadCount: number;
  meta: PaginationMeta;
}

export interface InvitationResponse {
  id: string;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
  status: WorkspaceInvitationStatus;
  isRead: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface GetWorkspaceInvitationsResponse {
  invitations: WorkspaceInvitationResponse[];
  meta: PaginationMeta;
}

export interface WorkspaceInvitationResponse {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  status: WorkspaceInvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface MarkInvitationAsReadRequest {
  invitationIds: string[];
}

export interface MarkInvitationAsReadResponse {
  unreadCount: number;
}

export interface DeleteInvitationRequest {
  id: string;
  invitationId: string;
}

export interface GetWorkspaceMembersResponse {
  members: WorkspaceMemberResponse[];
}

export interface WorkspaceMemberResponse {
  id: string;
  userId: string;
  email: string;
  username: string;
  avatarUrl: string;
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
  joinedAt: string;
}

export interface EditWorkspaceMemberRequest {
  role: WorkspaceRole;
  status: WorkspaceMemberStatus;
}

export interface AddMemberToWorkspaceRequest {
  email: string;
  role: WorkspaceRole;
}
