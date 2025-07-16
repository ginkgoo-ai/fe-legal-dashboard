'use client';

import { Button } from '@/components/ui/button';
import { IconActionBarSend } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { memo } from 'react';

interface ActionBarContainerProps {
  title?: string | React.ReactNode;
  isLoadingBtnSend?: boolean;
  isDisabledBtnSend?: boolean;
  onBtnBackClick?: () => void;
  onBtnSendClick?: () => void;
  renderContent?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

function PureActionBarContainer(props: ActionBarContainerProps) {
  const {
    title,
    isLoadingBtnSend = false,
    isDisabledBtnSend = false,
    onBtnBackClick,
    onBtnSendClick,
    renderContent,
    renderFooter,
  } = props || {};

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
      {/* footer */}
      {!!renderFooter && (
        <div className="flex flex-row justify-between items-center">
          <>{renderFooter?.()}</>
          <Button
            type="button"
            variant="default"
            className={cn('w-9 h-9 flex-shrink-0 cursor-pointer', {})}
            disabled={isDisabledBtnSend || isLoadingBtnSend}
            onClick={onBtnSendClick}
          >
            {isLoadingBtnSend ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <IconActionBarSend />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export const ActionBarContainer = memo(PureActionBarContainer);
