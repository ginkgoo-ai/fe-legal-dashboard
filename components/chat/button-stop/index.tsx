import { Button } from '@/components/ui/button';
import { IconStop } from '@/components/ui/icon';
import { memo } from 'react';

interface ButtonStopProps {
  onStop: () => void;
}

function PureButtonStop(props: ButtonStopProps) {
  const { onStop } = props;

  return (
    <Button
      data-testid="stop-button"
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      onClick={event => {
        event.preventDefault();
        onStop?.();
      }}
    >
      <IconStop size={14} />
    </Button>
  );
}

export const ButtonStop = memo(PureButtonStop);
