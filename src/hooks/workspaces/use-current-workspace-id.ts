'use client';

import { ROUTES } from '@/src/constants/routes.constants';
import { usePathname } from 'next/navigation';

export function useCurrentWorkspaceId(): string | undefined {
  const pathname = usePathname();
  const workspacePath = `${ROUTES.WORKSPACE}/`;

  if (!pathname.startsWith(workspacePath)) {
    return undefined;
  }

  return pathname.slice(workspacePath.length).split('/')[0] || undefined;
}
