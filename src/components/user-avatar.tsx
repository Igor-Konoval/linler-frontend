'use client';

import { cn } from '@/src/utils/utils';
import Image from 'next/image';

export function UserAvatar({
  username,
  avatarUrl,
  size = 24,
  className,
  fallback = 'placeholder',
}: {
  username?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  fallback?: 'placeholder' | 'initials';
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={username ?? 'Avatar'}
        width={size}
        height={size}
        unoptimized
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (fallback === 'initials') {
    return (
      <span
        className={cn(
          'bg-muted text-muted-foreground inline-flex items-center justify-center rounded-full text-[10px] font-medium',
          className,
        )}
        style={{ width: size, height: size }}
      >
        {username?.slice(0, 1).toUpperCase() ?? '?'}
      </span>
    );
  }

  return (
    <div
      className={cn('rounded-full bg-gray-200', className)}
      style={{ width: size, height: size }}
    />
  );
}
