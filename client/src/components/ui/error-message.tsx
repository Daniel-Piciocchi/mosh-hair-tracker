import type { ReactNode } from 'react';
import { cn } from '@/lib';

interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

function ErrorMessage({ children, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-red-50 border border-red-200 p-4 text-red-700',
        className
      )}
      role="alert"
    >
      {children}
    </div>
  );
}

export { ErrorMessage };
export type { ErrorMessageProps };
