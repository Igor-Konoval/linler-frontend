'use client';

import type { WorkspaceInvitationResponse } from '@/src/types/workspaces.types';
import { formatDateTime } from '@/src/utils/date.utils';
import { getWorkspaceRole } from '@/src/utils/workspaces.utils';
import { Loader2, Trash } from 'lucide-react';
import { useCallback, type RefCallback, type RefObject } from 'react';
import { Skeleton } from '../../ui/skeleton';
import { useDeleteInvitation } from '@/src/hooks/workspaces/use-delete-invitation';
import { toast } from 'sonner';
import { isRequestFailure } from '@/src/utils/request-failure.utils';
import { Button } from '../../ui/button';

export function WorkspaceInvitations({
  invitations,
  hasNextPage,
  isError,
  isFetchingNextPage,
  loadMoreRef,
  isPending,
  invitationsScrollRef,
}: {
  invitations: WorkspaceInvitationResponse[];
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  loadMoreRef: RefCallback<Element>;
  isPending: boolean;
  invitationsScrollRef: RefObject<HTMLDivElement | null>;
}) {
  const { mutateAsync: deleteInvitation, isPending: isDeletingInvitation } =
    useDeleteInvitation();

  const handleDeleteInvitation = useCallback(
    async (id: string, invitationId: string) => {
      try {
        await deleteInvitation({ id, invitationId });
        toast.success('Invitation deleted');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(error);
        }
        if (isRequestFailure(error)) {
          toast.error(error.message);
        }
      }
    },
    [deleteInvitation],
  );

  if (isPending) {
    return (
      <div
        ref={invitationsScrollRef}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background flex h-full max-h-[320px] min-h-[120px] flex-col gap-2 overflow-y-auto"
      >
        <Skeleton className="bg-(--skeleton-background) mb-1 h-[100px] w-full rounded-md" />
        <Skeleton className="bg-(--skeleton-background) mb-1 h-[100px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div
      ref={invitationsScrollRef}
      className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background flex h-full max-h-[320px] min-h-[120px] flex-col gap-2 overflow-y-auto"
    >
      {invitations.length > 0 ? (
        invitations.map((invitation) => {
          const isExpired = new Date(invitation.expiresAt) < new Date();

          return (
            <div
              key={invitation.id}
              className="group relative flex flex-col gap-1 rounded-md border p-3 transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="truncate text-[15px] font-semibold"
                  title={invitation.email}
                >
                  Invitation for {invitation.email}
                </span>
                <span
                  className="bg-muted text-muted-foreground ml-1 inline-block rounded-full border p-1 px-2 text-xs"
                  title={invitation.status}
                >
                  {invitation.status}
                </span>
                {isExpired ? (
                  <span
                    className="bg-destructive/10 text-destructive ml-1 inline-block rounded-full border p-1 px-2 text-xs"
                    title="Expired"
                  >
                    Expired
                  </span>
                ) : null}
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
                <Button
                  variant="outline"
                  disabled={isDeletingInvitation}
                  className="hover:bg-muted h-auto w-auto gap-1 p-1 px-2"
                  title="Delete invitation"
                  onClick={() =>
                    handleDeleteInvitation(
                      invitation.workspaceId,
                      invitation.id,
                    )
                  }
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
                <span className="ml-auto">
                  {formatDateTime(invitation.createdAt)}
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-muted-foreground my-auto px-3 py-2 text-center text-sm">
          No workspace invitations found
        </div>
      )}
      {isError ? (
        <div className="text-destructive -mt-2 mb-2 px-3 py-2 text-sm">
          Failed to load workspace invitations
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
