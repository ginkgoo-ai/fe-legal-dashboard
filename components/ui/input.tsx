import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
  isBorder?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = {}, type, isBorder = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          {
            'border border-input shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ':
              isBorder,
            'focus-visible:outline-none': !isBorder,
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
