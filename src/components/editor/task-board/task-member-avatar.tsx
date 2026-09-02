'use client';

import { UserAvatar } from '@/src/components/user-avatar';
import type { GetProjectMemberResponse } from '@/src/types/projects.types';

export function TaskMemberAvatar({
  member,
  size = 20,
  className,
}: {
  member?: GetProjectMemberResponse | null;
  size?: number;
  className?: string;
}) {
  return (
    <UserAvatar
      username={member?.username}
      avatarUrl={member?.avatarUrl}
      size={size}
      className={className}
      fallback="initials"
    />
  );
}
