'use client';

import { realtimeClient } from '@/src/api/realtime/realtime-client';
import {
  RealtimeEvent,
  WorkspaceMemberChangeAction,
} from '@/src/constants/realtime.constants';
import { GET_PAGE_LINKS_QUERY_KEY } from '@/src/hooks/page/use-get-page-links';
import { GET_PROJECT_PAGE_QUERY_KEY } from '@/src/hooks/page/use-get-project-page';
import { GET_SIDEBAR_PAGES_QUERY_KEY } from '@/src/hooks/page/use-get-sidebar-pages';
import { GET_PROJECT_MEMBERS_QUERY_KEY } from '@/src/hooks/projects/use-get-project-members';
import { GET_PROJECTS_QUERY_KEY } from '@/src/hooks/projects/use-get-projects';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { GET_CURRENT_WORKSPACE_QUERY_KEY } from '@/src/hooks/workspaces/use-get-current-workspace';
import { GET_MINE_INVITATIONS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-mine-invitations';
import { GET_WORKSPACE_INVITATIONS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspace-invitations';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspace-members';
import { GET_WORKSPACES_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspaces';
import { upsertPageActivity } from '@/src/hooks/realtime/use-page-activity';
import type {
  PageChangedPayload,
  ProjectChangedPayload,
  ProjectMemberChangedPayload,
  WorkspaceChangedPayload,
  WorkspaceInvitationChangedPayload,
  WorkspaceMemberChangedPayload,
} from '@/src/types/realtime.types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useRealtimeEntityEvents(): void {
  const queryClient = useQueryClient();
  const { data: user } = useGetUser();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let pageInvalidateTimer: number | undefined;

    const onWorkspaceChanged = (payload: unknown) => {
      const data = payload as WorkspaceChangedPayload;

      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACES_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_CURRENT_WORKSPACE_QUERY_KEY, data.workspaceId],
      });
    };

    const onMemberChanged = (payload: unknown) => {
      const data = payload as WorkspaceMemberChangedPayload;

      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY, data.workspaceId],
      });

      if (
        data.action === WorkspaceMemberChangeAction.Removed &&
        data.targetUserId === userId
      ) {
        void queryClient.invalidateQueries({
          queryKey: [GET_WORKSPACES_QUERY_KEY],
        });
      }

      if (
        data.action === WorkspaceMemberChangeAction.Joined &&
        data.targetUserId === userId
      ) {
        void queryClient.invalidateQueries({
          queryKey: [GET_WORKSPACES_QUERY_KEY],
        });
      }
    };

    const onInvitationChanged = (payload: unknown) => {
      const data = payload as WorkspaceInvitationChangedPayload;

      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACE_INVITATIONS_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_MINE_INVITATIONS_QUERY_KEY],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY, data.workspaceId],
      });
    };

    const onProjectChanged = (payload: unknown) => {
      const data = payload as ProjectChangedPayload;

      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECTS_QUERY_KEY, data.workspaceId],
      });
    };

    const onProjectMemberChanged = (payload: unknown) => {
      const data = payload as ProjectMemberChangedPayload;

      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECT_MEMBERS_QUERY_KEY, data.projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_PROJECTS_QUERY_KEY, data.workspaceId],
      });
    };

    const onPageChanged = (payload: unknown) => {
      const data = payload as PageChangedPayload;

      if (data.actor && data.updatedAt) {
        upsertPageActivity(data.pageId, {
          id: data.actor.id,
          username: data.actor.username,
          avatarUrl: data.actor.avatarUrl,
          updatedAt: data.updatedAt,
        });
      }

      void queryClient.invalidateQueries({
        queryKey: [GET_SIDEBAR_PAGES_QUERY_KEY, data.projectId],
      });
      void queryClient.invalidateQueries({
        queryKey: [GET_PAGE_LINKS_QUERY_KEY, data.projectId],
      });

      if (data.actorUserId === userId) {
        return;
      }

      window.clearTimeout(pageInvalidateTimer);
      pageInvalidateTimer = window.setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: [GET_PROJECT_PAGE_QUERY_KEY, data.pageId],
        });
      }, 1_500);
    };

    realtimeClient.on(RealtimeEvent.WORKSPACE_CHANGED, onWorkspaceChanged);
    realtimeClient.on(RealtimeEvent.WORKSPACE_MEMBER_CHANGED, onMemberChanged);
    realtimeClient.on(
      RealtimeEvent.WORKSPACE_INVITATION_CHANGED,
      onInvitationChanged,
    );
    realtimeClient.on(RealtimeEvent.PROJECT_CHANGED, onProjectChanged);
    realtimeClient.on(
      RealtimeEvent.PROJECT_MEMBER_CHANGED,
      onProjectMemberChanged,
    );
    realtimeClient.on(RealtimeEvent.PAGE_CHANGED, onPageChanged);

    return () => {
      window.clearTimeout(pageInvalidateTimer);
      realtimeClient.off(RealtimeEvent.WORKSPACE_CHANGED, onWorkspaceChanged);
      realtimeClient.off(
        RealtimeEvent.WORKSPACE_MEMBER_CHANGED,
        onMemberChanged,
      );
      realtimeClient.off(
        RealtimeEvent.WORKSPACE_INVITATION_CHANGED,
        onInvitationChanged,
      );
      realtimeClient.off(RealtimeEvent.PROJECT_CHANGED, onProjectChanged);
      realtimeClient.off(
        RealtimeEvent.PROJECT_MEMBER_CHANGED,
        onProjectMemberChanged,
      );
      realtimeClient.off(RealtimeEvent.PAGE_CHANGED, onPageChanged);
    };
  }, [queryClient, userId]);
}
