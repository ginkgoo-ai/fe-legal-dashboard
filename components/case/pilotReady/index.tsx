'use client';

import { Button } from '@/components/ui/button';
import { IconMagic } from '@/components/ui/icon';
import { memo, MouseEventHandler } from 'react';

interface PilotReadyProps {
  onBtnStartClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

function PurePilotReady(props: PilotReadyProps) {
  const { onBtnStartClick } = props;

  return (
    <div className="flex flex-col">
      <div className="mt-[2.75rem] mb-4 w-full flex justify-center items-center font-bold">
        You're all set! 🎉️
      </div>
      <div className="flex flex-col box-border p-2.5 rounded-lg w-full">
        <div className="flex flex-row mt-2.5 mb-3.5">
          {/* <div className="flex-[0_0_2.25rem] flex flex-row justify-center">
            <IconInfo size={18} />
          </div> */}
          <div className="text-[#757072] flex-1 text-center">
            CLICK THE BUTTON BELOW TO START THE AUTOMATIC FORM FILLING.
          </div>
        </div>
        <Button
          variant="ghost"
          className="border border-[#D8DFF5] border-dashed h-11 bg-white"
          onClick={onBtnStartClick}
        >
          <IconMagic size={24} />
          <span className="text-[var(--color-primary)] font-semibold">
            Start Auto-Fill
          </span>
        </Button>
      </div>
    </div>
  );
}

export const PilotReady = memo(PurePilotReady);
