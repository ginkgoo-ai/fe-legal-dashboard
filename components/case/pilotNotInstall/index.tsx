'use client';

import { IconExtension, IconInfo } from '@/components/ui/icon';
import GlobalManager from '@/customManager/GlobalManager';
import UtilsManager from '@/customManager/UtilsManager';
import { Button } from 'antd';
import { memo, useState } from 'react';

function PurePilotNotInstall() {
  const [isLoadingInstall, setLoadingInstall] = useState<boolean>(false);

  const handleBtnInstallClick = () => {
    setLoadingInstall(true);

    UtilsManager.clickTagA({
      url: GlobalManager.urlInstallExtension,
    });

    setTimeout(() => {
      setLoadingInstall(false);
    }, 2000);
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
          // className="border border-[#D8DFF5] border-dashed h-11 bg-white"
          loading={isLoadingInstall}
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
