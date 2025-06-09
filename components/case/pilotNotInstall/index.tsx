import { Button } from '@/components/ui/button';
import { IconExtension, IconInfo } from '@/components/ui/icon';
import { memo, MouseEventHandler } from 'react';

interface PilotNotInstallProps {
  onBtnClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

function PurePilotNotInstall(props: PilotNotInstallProps) {
  const { onBtnClick } = props;

  return (
    <div className="flex flex-col">
      <div className="mt-[3.75rem] mb-4 w-full flex justify-center items-center">
        Power Up Your Forms!⚡️
      </div>
      <div className="flex flex-col bg-[#EEF4FF] box-border p-2.5 rounded-lg w-full">
        <div className="flex flex-row mt-2.5 mb-3.5">
          <div className="flex-[0_0_2.25rem] flex flex-row justify-center">
            <IconInfo size={18} />
          </div>
          <div className="text-primary flex-1">
            Install our Chrome browser extension to enable seamless automation.
          </div>
        </div>
        <Button
          variant="ghost"
          className="border border-[#D8DFF5] border-dashed h-11 bg-white"
          onClick={onBtnClick}
        >
          <IconExtension size={24} />
          <span className="text-[var(--color-primary)] font-semibold">
            Install Extension
          </span>
        </Button>
      </div>
    </div>
  );
}

export const PilotNotInstall = memo(PurePilotNotInstall);
