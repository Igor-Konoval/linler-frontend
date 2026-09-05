'use client';

import { ROUTES } from '@/src/constants/routes.constants';
import { usePathname } from 'next/navigation';

function useWorkspacePathSegments(): string[] {
  const pathname = usePathname();
  const workspacePath = `${ROUTES.WORKSPACE}/`;

  if (!pathname.startsWith(workspacePath)) {
    return [];
  }

  return pathname.slice(workspacePath.length).split('/').filter(Boolean);
}

export function useCurrentProjectId(): string | undefined {
  return useWorkspacePathSegments()[1];
}

export function useCurrentPageId(): string | undefined {
  return useWorkspacePathSegments()[2];
}
