'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { memo } from 'react';

interface ActionBarContainerProps {
  title?: string | React.ReactNode;
  onBtnBackClick?: () => void;
  renderContent?: () => React.ReactNode;
}

function PureActionBarContainer(props: ActionBarContainerProps) {
  const { title, onBtnBackClick, renderContent } = props || {};

  return (
    <div className="relative py-2 px-2 flex flex-col gap-2">
      {/* title */}
      {!!onBtnBackClick || title ? (
        <div className="flex flex-row items-center gap-1 -mb-1">
          <Button
            type="button"
            variant="ghost"
            className={cn('h-9 flex-shrink-0 cursor-pointer', {})}
            onClick={onBtnBackClick}
          >
            <ChevronLeft />
            <div>{title}</div>
          </Button>
        </div>
      ) : null}
      {/* content */}
      <>{renderContent?.()}</>
    </div>
  );
}

export const ActionBarContainer = memo(PureActionBarContainer);
