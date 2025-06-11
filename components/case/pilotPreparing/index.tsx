import { Button } from '@/components/ui/button';
import { IconInfo, IconMagic } from '@/components/ui/icon';
import { memo } from 'react';

interface PilotPreparingProps {}

function PurePilotPreparing(props: PilotPreparingProps) {
  const {} = props;

  return (
    <div className="flex flex-col">
      <div className="mt-[2.75rem] mb-4 w-full flex justify-center items-center font-bold">
        Preparing for Auto-Fill 🤖️
      </div>
      <div className="flex flex-col bg-[#EEF4FF] box-border p-2.5 rounded-lg w-full items-center">
        <div className="flex flex-row mt-2.5 mb-3.5">
          <div className="flex-[0_0_2.25rem] flex flex-row justify-center">
            <IconInfo size={18} />
          </div>
          <div className="text-primary flex-1">Document analysis is underway.</div>
        </div>
        <Button
          variant="ghost"
          disabled={true}
          className="border border-[#D8DFF5] border-dashed h-11 bg-white grayscale hover:bg-white!"
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

export const PilotPreparing = memo(PurePilotPreparing);
