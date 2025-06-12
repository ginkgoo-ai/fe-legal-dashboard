import { Button } from '@/components/ui/button';
import { IconExtension, IconInfo } from '@/components/ui/icon';
import UtilsManager from '@/customManager/UtilsManager';
import { memo } from 'react';

function PurePilotNotInstall() {
  const handleBtnInstallClick = () => {
    UtilsManager.clickTagA({
      url: 'https://github.com/ginkgoo-ai/fe-chrome-extensions/releases/download/v0.0.1/fe-chrome-extensions-v20250612_150648.zip',
    });
  };

  return (
    <div className="flex flex-col">
      <div className="mt-[2.75rem] mb-4 w-full flex justify-center items-center font-bold">
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
          onClick={handleBtnInstallClick}
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
