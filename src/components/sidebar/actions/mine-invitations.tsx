'use client';

import { WorkspaceInvitationStatus } from '@/src/constants/workspaces.constants';
import { useAcceptInvitation } from '@/src/hooks/workspaces/use-accept-invitation';
import { useDeclineInvitation } from '@/src/hooks/workspaces/use-decline-invitation';
import { GET_MINE_INVITATIONS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-mine-invitations';
import { useMarkInvitationsAsRead } from '@/src/hooks/workspaces/use-mark-invitations-as-read';
import { useMarkInvitationsAsReadAll } from '@/src/hooks/workspaces/use-mark-invitations-as-read-all';
import type {
  GetMineInvitationsResponse,
  InvitationResponse,
} from '@/src/types/workspaces.types';
import { formatDateTime } from '@/src/utils/date.utils';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import { cn } from '@/src/utils/utils';
import { getWorkspaceRole } from '@/src/utils/workspaces.utils';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { CircleCheckBig, Eye, Loader2, X } from 'lucide-react';
import { useCallback, type RefCallback, type RefObject } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';

export function MineInvitations({
  invitations,
  hasNextPage,
  isError,
  isFetchingNextPage,
  loadMoreRef,
  invitationsScrollRef,
  isPending,
}: {
  invitations: InvitationResponse[];
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: RefCallback<Element>;
  invitationsScrollRef: RefObject<HTMLDivElement | null>;
  isPending: boolean;
}) {
  const {
    mutateAsync: markInvitationsAsRead,
    isPending: isMarkingInvitationsAsRead,
  } = useMarkInvitationsAsRead();

  const {
    mutateAsync: markInvitationsAsReadAll,
    isPending: isMarkingInvitationsAsReadAll,
  } = useMarkInvitationsAsReadAll();

  const { mutateAsync: acceptInvitation, isPending: isAcceptingInvitation } =
    useAcceptInvitation();

  const { mutateAsync: declineInvitation, isPending: isDecliningInvitation } =
    useDeclineInvitation();

  const queryClient = useQueryClient();

  const handleMarkInvitationsAsRead = useCallback(
    async (invitationIds: string[], response?: Partial<InvitationResponse>) => {
      try {
        const result = await markInvitationsAsRead({ invitationIds });
        const invitationIdsSet = new Set(invitationIds);

        queryClient.setQueriesData<InfiniteData<GetMineInvitationsResponse>>(
          { queryKey: [GET_MINE_INVITATIONS_QUERY_KEY] },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                invitations: page.invitations.map((invitation) => ({
                  ...invitation,
                  isRead:
                    invitation.isRead || invitationIdsSet.has(invitation.id),
                  ...response,
                })),
                unreadCount: result.unreadCount,
              })),
            };
          },
        );
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(error);
        }
        if (isRequestFailure(error)) {
          toast.error(error.message);
        }
      }
    },
    [markInvitationsAsRead, queryClient],
  );

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markInvitationsAsReadAll();
      queryClient.setQueriesData<InfiniteData<GetMineInvitationsResponse>>(
        { queryKey: [GET_MINE_INVITATIONS_QUERY_KEY] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              invitations: page.invitations.map((invitation) => ({
                ...invitation,
                isRead: true,
              })),
              unreadCount: result.unreadCount,
            })),
          };
        },
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      if (isRequestFailure(error)) {
        toast.error(error.message);
      }
    }
  };

  const handleAcceptInvitation = useCallback(
    async (id: string) => {
      try {
        await acceptInvitation(id);
        toast.success('Invitation accepted');

        await handleMarkInvitationsAsRead([id], {
          status: WorkspaceInvitationStatus.ACCEPTED,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(error);
        }
        if (isRequestFailure(error)) {
          toast.error(error.message);
        }
      }
    },
    [acceptInvitation, handleMarkInvitationsAsRead],
  );

  const handleDeclineInvitation = useCallback(
    async (id: string) => {
      try {
        await declineInvitation(id);
        toast.success('Invitation declined');

        await handleMarkInvitationsAsRead([id], {
          status: WorkspaceInvitationStatus.REJECTED,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(error);
        }
        if (isRequestFailure(error)) {
          toast.error(error.message);
        }
      }
    },
    [declineInvitation, handleMarkInvitationsAsRead],
  );

  if (isPending) {
    return (
      <div
        ref={invitationsScrollRef}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background min-h-30 flex h-full max-h-80 flex-col gap-2 overflow-y-auto"
      >
        <Skeleton className="bg-(--skeleton-background) h-25 mb-1 w-full rounded-md" />
        <Skeleton className="bg-(--skeleton-background) h-25 mb-1 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div
      ref={invitationsScrollRef}
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background min-h-30 flex max-h-80 flex-col gap-2 overflow-y-auto"
    >
      {invitations.length > 0 ? (
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={isMarkingInvitationsAsReadAll}
        >
          Mark all as read
        </Button>
      ) : null}
      {invitations.length > 0 ? (
        invitations.map((invitation) => {
          const isExpired = new Date(invitation.expiresAt) < new Date();
          return (
            <div
              key={invitation.id}
              className={cn(
                'flex flex-col gap-1 rounded-md border p-3 hover:shadow-sm',
                invitation.isRead
                  ? 'bg-background border-border'
                  : 'bg-background border-[#0000008c] dark:border-[#afc3fa73]',
                'group relative transition-all',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'truncate text-[15px] font-semibold',
                    invitation.isRead ? 'text-muted-foreground' : '',
                  )}
                  title={`Invitation to ${invitation.workspaceName}`}
                >
                  Invitation to {invitation.workspaceName}
                </span>
                <div className="flex items-center gap-1">
                  {isExpired && (
                    <span
                      className="bg-destructive/10 text-destructive ml-1 inline-block rounded-full border p-1 px-2 text-xs"
                      title="Expired"
                    >
                      Expired
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={invitation.isRead || isMarkingInvitationsAsRead}
                    className="hover:bg-muted h-auto w-auto"
                    title="Mark as read"
                    onClick={() => handleMarkInvitationsAsRead([invitation.id])}
                  >
                    <Eye
                      className={cn(
                        invitation.isRead ? 'text-muted-foreground' : '',
                      )}
                    />
                  </Button>
                </div>
              </div>
              <div className="text-muted-foreground flex flex-col gap-1 text-xs">
                <span>
                  {!isExpired &&
                    `Valid until ${formatDateTime(invitation.expiresAt)}`}
                </span>
                <div className="flex items-center gap-1">
                  <span>Role:</span>
                  <span className="mr-2 font-medium">
                    {getWorkspaceRole(invitation.role)}
                  </span>
                </div>
                <div className="flex w-full items-center justify-center gap-1">
                  {invitation.status === WorkspaceInvitationStatus.PENDING ? (
                    <>
                      <Button
                        variant="outline"
                        disabled={isAcceptingInvitation || isExpired}
                        className={cn(
                          'hover:bg-muted h-auto w-1/2 gap-1 p-1 px-2',
                        )}
                        title="Accept invitation"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <CircleCheckBig />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isDecliningInvitation || isExpired}
                        className={cn(
                          'hover:bg-muted h-auto w-1/2 gap-1 p-1 px-2',
                        )}
                        title="Decline invitation"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        <X />
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className={cn(
                        'hover:bg-muted h-auto w-full gap-1 p-1 px-2',
                      )}
                      title={`Invitation ${invitation.status.toLowerCase()}`}
                    >
                      Invitation {invitation.status.toLowerCase()}
                    </Button>
                  )}
                </div>
                <span className="ml-auto">
                  {formatDateTime(invitation.createdAt)}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-muted-foreground my-auto px-3 py-2 text-center text-sm">
          No invitations found
        </div>
      )}
      {isError ? (
        <div className="text-destructive -mt-2 mb-2 px-3 py-2 text-sm">
          Failed to load invitations
        </div>
      ) : null}
      {hasNextPage ? <div ref={loadMoreRef} className="h-1 shrink-0" /> : null}
      {isFetchingNextPage ? (
        <div className="text-muted-foreground -mt-2 mb-2 flex items-center justify-center px-3 py-2 ">
          <Loader2 className="animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
