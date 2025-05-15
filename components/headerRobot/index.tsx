'use client';

import { Button } from '@/components/ui/button';
import { useEventManager } from '@/hooks/useEventManager';
import { CirclePlay, CircleStop } from 'lucide-react';
import { memo } from 'react';

interface HeaderRobotProps {}

function PureHeaderRobot(props: HeaderRobotProps) {
  const {} = props;
  const { emit } = useEventManager('ginkgo-message', data => {
    console.log('🚀 ~ useEventManager ~ data:', data);
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
      <Button
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
        onClick={handleBtnStartClick}
      >
        <CirclePlay size={14} />
      </Button>
      <Button
        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
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
