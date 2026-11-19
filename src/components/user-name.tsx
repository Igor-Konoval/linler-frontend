import { cn } from '@/src/utils/utils';
import { Sparkles } from 'lucide-react';

export function UserName({
  name,
  subscribed = false,
  className,
}: {
  name: string;
  subscribed?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
      <span className="truncate">{name}</span>
      {subscribed ? (
        <Sparkles
          className="size-3.5 shrink-0 text-amber-500"
          aria-label="Subscribed"
        />
      ) : null}
    </span>
  );
}
