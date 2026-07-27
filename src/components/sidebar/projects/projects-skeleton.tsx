import { WorkspaceProjectsSkeleton } from './workspace-projects-skeleton';
import { PrivateProjectsSkeleton } from './private-projects-skeleton';

export function ProjectsSkeleton() {
  return (
    <>
      <WorkspaceProjectsSkeleton />
      <PrivateProjectsSkeleton />
    </>
  );
}
