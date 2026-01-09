import type { ReactNode } from 'react';
import { cn } from '@/lib';

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return <div className={cn('card p-4', className)}>{children}</div>;
}

export { Card };
export type { CardProps };
