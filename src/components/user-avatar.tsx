'use client';

import { cn } from '@/src/utils/utils';
import Image from 'next/image';
import type { CSSProperties } from 'react';

export function UserAvatar({
  username,
  avatarUrl,
  size = 24,
  className,
  style,
}: {
  username?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
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
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  const initial = username?.trim().slice(0, 1).toUpperCase() || '?';

  return (
    <span
      className={cn(
        'dark:bg-muted dark:text-muted-foreground inline-flex select-none items-center justify-center rounded-full bg-[#dedede] font-medium text-neutral-600',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.42)),
        ...style,
      }}
      aria-hidden={!username}
    >
      {initial}
    </span>
  );
}
