'use client';

import { Button } from '@/components/ui/button';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { PilotStatusEnum } from '@/types/pilot';
import { CirclePlay, CircleStop } from 'lucide-react';
import { memo, useState } from 'react';

interface HeaderRobotProps {}

function PureHeaderRobot(props: HeaderRobotProps) {
  const {} = props;

  const [pilotStatus, setPilotStatus] = useState<PilotStatusEnum>(PilotStatusEnum.INIT);

  const { emit } = useEventManager('ginkgo-message', message => {
    console.log('🚀 ~ useEventManager ~ data:', message);

    const { type } = message;
    if (type === 'ginkgo-background-page-register') {
      setPilotStatus(PilotStatusEnum.HOLD);
    } else if (type === 'ginkgo-background-all-pilot-start') {
      setPilotStatus(PilotStatusEnum.START);
    } else if (type === 'ginkgo-background-all-pilot-stop') {
      setPilotStatus(PilotStatusEnum.HOLD);
    } else if (type === 'ginkgo-background-all-pilot-update') {
      // setStatus(StatusEnum.UPDATE);
    }
  });

  const handleBtnStartClick = () => {
    // 只发送消息给本页面
    const message = { type: 'ginkgo-page-all-pilot-start', timestamp: Date.now() };

    window.postMessage(message, window.location.origin);
  };

  const handleBtnStopClick = () => {
    // 只发送消息给本页面
    const message = { type: 'ginkgo-page-all-pilot-stop', timestamp: Date.now() };

    window.postMessage(message, window.location.origin);
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        <span className="whitespace-nowrap font-bold">Status:</span>
        <span
          className={cn('font-bold', {
            'text-green-500': pilotStatus !== PilotStatusEnum.HOLD,
            'text-red-500': pilotStatus === PilotStatusEnum.HOLD,
          })}
        >
          {pilotStatus}
        </span>
      </div>
      <Button
        variant="default"
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
        disabled={pilotStatus !== PilotStatusEnum.HOLD}
        onClick={handleBtnStartClick}
      >
        <CirclePlay size={14} />
      </Button>
      <Button
        variant="ghost"
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
        disabled={pilotStatus === PilotStatusEnum.HOLD}
        onClick={handleBtnStopClick}
      >
        <CircleStop size={14} />
      </Button>
    </>
  );
}

export const HeaderRobot = memo(PureHeaderRobot, (prevProps, nextProps) => {
  return true;
});
