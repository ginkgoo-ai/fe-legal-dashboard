'use client';

import { Button } from '@/components/ui/button';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { CirclePlay, CircleStop } from 'lucide-react';
import { memo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface HeaderRobotProps {}

function PureHeaderRobot(props: HeaderRobotProps) {
  const {} = props;

  const pilotId = useRef<string>(uuidv4());
  const { extensionsInfo } = useExtensionsStore();

  const { emit } = useEventManager('ginkgo-message', message => {
    console.log('🚀 ~ useEventManager ~ data:', message);

    const { type } = message;
    if (type === 'ginkgo-background-page-register') {
      // setPilotStatus(PilotStatusEnum.HOLD);
    } else if (type === 'ginkgo-background-all-pilot-start') {
      // setPilotStatus(PilotStatusEnum.START);
    } else if (type === 'ginkgo-background-all-pilot-stop') {
      // setPilotStatus(PilotStatusEnum.HOLD);
    } else if (type === 'ginkgo-background-all-pilot-update') {
      // setStatus(StatusEnum.UPDATE);
    }
  });

  const handleBtnStartClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-pilot-start',
      pilotId: pilotId.current,
      caseId: 'demo',
    };

    window.postMessage(message, window.location.origin);
  };

  const handleBtnStopClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-pilot-stop',
      pilotId: pilotId.current,
    };

    window.postMessage(message, window.location.origin);
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        <span className="whitespace-nowrap font-bold">Version:</span>
        <span className={cn('font-bold')}>{extensionsInfo?.version}</span>
      </div>
      <Button
        variant="default"
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
        disabled={!extensionsInfo?.version}
        onClick={handleBtnStartClick}
      >
        <CirclePlay size={14} />
      </Button>
      <Button
        variant="ghost"
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
        disabled={!extensionsInfo?.version}
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
