import { Skeleton } from '../../ui/skeleton';

export function InvitationSkeleton() {
  return (
    <div className="pl-4">
      <Skeleton className="bg-(--skeleton-background) h-[32px] w-full rounded-md" />
    </div>
  );
}
