'use client';

import GlobalManager from '@/customManager/GlobalManager';
import UtilsManager from '@/customManager/UtilsManager';
import { Button, Modal } from 'antd';
import { memo, useState } from 'react';

interface ModalInstallExtensionProps {
  isOpen: boolean;
  onOpenUpdate: (value: boolean) => void;
}

function PureModalInstallExtension(props: ModalInstallExtensionProps) {
  const { isOpen = false, onOpenUpdate } = props;

  const [isLoadingInstall, setLoadingInstall] = useState<boolean>(false);

  const handleBtnCancel = () => {
    onOpenUpdate?.(false);
  };

  const handleBtnSubmit = () => {
    setLoadingInstall(true);

    UtilsManager.clickTagA({
      url: GlobalManager.urlInstallExtension,
    });

    setTimeout(() => {
      setLoadingInstall(false);
      onOpenUpdate?.(false);
    }, 2000);
  };

  return (
    <Modal
      title={<div className="box-border pb-6 text-xl font-bold">Install extension</div>}
      closable={false}
      width={422}
      footer={null}
      open={isOpen}
      keyboard={false}
      destroyOnHidden
      forceRender
      // onOk={handleCreateCaseOk}
      onCancel={handleBtnCancel}
    >
      <div className="mb-4 text-sm text-[#1A1A1AB2]">
        Install our Chrome browser extension to enable seamless automation.
      </div>

      <div className="mt-2 flex flex-row items-center justify-between gap-6">
        <Button type="default" className="!h-[44px] flex-1" onClick={handleBtnCancel}>
          <span className="font-bold">Cancel</span>
        </Button>
        <Button
          type="primary"
          className="!h-[44px] flex-1"
          loading={isLoadingInstall}
          onClick={handleBtnSubmit}
        >
          <span className="font-bold">Install Extension</span>
        </Button>
      </div>
    </Modal>
  );
}

export const ModalInstallExtension = memo(PureModalInstallExtension);
