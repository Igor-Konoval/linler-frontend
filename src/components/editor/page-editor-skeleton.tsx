import { Skeleton } from '../ui/skeleton';

export function PageEditorSkeleton() {
  return (
    <main className="bg-background min-h-[calc(100vh-var(--header-height))] px-5 py-8 sm:px-10 lg:px-16">
      <div className="mb-5">
        <div className="relative mx-auto w-full">
          <div className="relative mx-auto">
            <Skeleton className="h-80 w-full rounded-[14px] object-cover" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7 flex w-full items-center gap-2">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="max-w-75 h-14 w-full rounded-md" />
        </div>

        <Skeleton className="mb-5 h-8 w-1/2 rounded-md" />
        <Skeleton className="mb-5 h-6 w-1/3 rounded-md" />
        <Skeleton className="mb-5 h-6 w-full rounded-md" />
        <Skeleton className="mb-5 h-8 w-1/4 rounded-md" />
        <Skeleton className="mb-5 h-20 w-full rounded-md" />
        <Skeleton className="mb-5 h-6 w-1/6 rounded-md" />
      </div>
    </main>
  );
}
