import React from 'react';
import { Skeleton } from '../../ui/skeleton';
import { Eye } from 'lucide-react';

export function AppSidebarSkeleton(): React.ReactElement {
  return (
    <div className="flex gap-2 p-2">
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg p-2">
        <Eye />
      </div>
      <div className="flex flex-col gap-0.5">
        <Skeleton className="bg-(--skeleton-background) mb-1 h-[14px] w-[160px] rounded-[12px]" />
        <Skeleton className="bg-(--skeleton-background) h-[14px] w-[160px] rounded-[12px]" />
      </div>
    </div>
  );
}
