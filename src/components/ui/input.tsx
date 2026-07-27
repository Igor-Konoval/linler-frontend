import { cn } from '@/src/utils/utils';
import * as React from 'react';

function Input({
  className,
  type,
  showNumberArrows = false,
  ...props
}: React.ComponentProps<'input'> & { showNumberArrows?: boolean }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        showNumberArrows
          ? ''
          : '[&::-webkit-inner-spin-button]:appearance-none! [&::-webkit-inner-spin-button]:m-0! [&::-webkit-outer-spin-button]:appearance-none! [&::-webkit-outer-spin-button]:m-0!',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
