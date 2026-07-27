import {
  ProjectMemberRole,
  WorkspaceRole,
} from '../constants/workspaces.constants';

export function getWorkspaceRole(role?: WorkspaceRole) {
  switch (role) {
    case WorkspaceRole.OWNER:
      return 'Owner';
    case WorkspaceRole.ADMIN:
      return 'Admin';
    case WorkspaceRole.MEMBER:
      return 'Member';
    case WorkspaceRole.VIEWER:
      return 'Viewer';
  }
}

export function getProjectMemberRole(role?: ProjectMemberRole) {
  switch (role) {
    case ProjectMemberRole.OWNER:
      return 'Owner';
    case ProjectMemberRole.EDITOR:
      return 'Editor';
    case ProjectMemberRole.VIEWER:
      return 'Viewer';
  }
}

export function isWorkspaceAdmin(role?: WorkspaceRole) {
  switch (role) {
    case WorkspaceRole.OWNER:
      return true;
    case WorkspaceRole.ADMIN:
      return true;
    default:
      return false;
  }
}
