import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils';
import React from 'react';

interface BadgeStatusProps {
  status: string;
  className?: string;
}

export const BadgeStatus = React.memo(function BadgeStatus({
  status,
  className,
}: BadgeStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFTING':
        return {
          label: status,
          className: 'bg-slate-50 dark:bg-slate-800',
        };
      case 'UPLOADING':
        return {
          label: status,
          className: 'bg-purple-50 border-purple-500 text-purple-500',
        };
      case 'ANALYSIS':
        return {
          label: status,
          className: 'border-green-500 text-green-500 bg-green-50',
        };
      case 'DONE':
        return {
          label: status,
          className: 'border-blue-500 text-blue-500 bg-blue-50',
        };
      default:
        return {
          label: status,
          className: 'bg-slate-50',
        };
    }
  };

  const config = getStatusConfig(status as any);

  return (
    <Badge
      variant="outline"
      className={cn('flex items-center', config.className, className)}
    >
      {config.label}
    </Badge>
  );
});
