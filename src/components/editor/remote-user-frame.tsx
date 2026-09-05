import { type CSSProperties, type ReactNode } from 'react';
import type { RemoteBlockAwareness } from './collaboration-highlight';
import { cn } from '@/src/utils/utils';

export function RemoteUserFrame({
  users,
  children,
  className,
}: {
  users: RemoteBlockAwareness[];
  children: ReactNode;
  className?: string;
}) {
  const color = users[0]?.color;

  return (
    <div
      className={cn('relative', users.length > 0 && 'collab-chrome', className)}
      style={color ? ({ '--collab-color': color } as CSSProperties) : undefined}
    >
      {users.length > 0 ? (
        <div className="collab-chrome-labels">
          {users.map((user) => (
            <span
              key={user.userId}
              className="collab-block-label"
              style={{ backgroundColor: user.color }}
            >
              {user.username}
            </span>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
