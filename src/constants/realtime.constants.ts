export const REALTIME_NAMESPACE = '/realtime';

export const PAGE_ACTIVITY_INTERVAL = 30_000;

export const RealtimeEvent = {
  WORKSPACE_JOIN: 'workspace:join',
  WORKSPACE_LEAVE: 'workspace:leave',
  PRESENCE_SYNC: 'presence:sync',
  PRESENCE_JOINED: 'presence:joined',
  PRESENCE_LEFT: 'presence:left',
  WORKSPACE_CHANGED: 'workspace:changed',
  WORKSPACE_MEMBER_CHANGED: 'workspace:member-changed',
  WORKSPACE_INVITATION_CHANGED: 'workspace:invitation-changed',
  PROJECT_CHANGED: 'project:changed',
  PROJECT_MEMBER_CHANGED: 'project:member-changed',
  PAGE_CHANGED: 'page:changed',
  PAGE_AWARENESS: 'page:awareness',
  PAGE_AWARENESS_SYNC: 'page:awareness-sync',
  PAGE_AWARENESS_REQUEST: 'page:awareness-request',
  TASK_BOARD_CHANGED: 'task-board:changed',
} as const;

export const PAGE_TITLE_BLOCK_ID = '__title__';
export const PAGE_COVER_BLOCK_ID = '__cover__';

export const TASK_BOARD_AWARENESS_PREFIX = 'task-board:';
export const TASK_CARD_AWARENESS_PREFIX = 'task-card:';
export const TASK_COLUMN_AWARENESS_PREFIX = 'task-column:';
export const TASK_DESCRIPTION_BLOCK_ID = '__description__';
export const TASK_BOARD_BROADCAST_DEBOUNCE_MS = 120;

export type RealtimeEventName =
  (typeof RealtimeEvent)[keyof typeof RealtimeEvent];

export enum EntityChangeAction {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
}

export enum PageChangeAction {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
  Archived = 'archived',
}

export enum WorkspaceMemberChangeAction {
  Joined = 'joined',
  Updated = 'updated',
  Removed = 'removed',
}

export enum WorkspaceInvitationChangeAction {
  Created = 'created',
  Accepted = 'accepted',
  Declined = 'declined',
  Revoked = 'revoked',
}

export enum ProjectMemberChangeAction {
  Added = 'added',
  Updated = 'updated',
  Removed = 'removed',
}
