'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PanelProfileVaultOverview } from '@/components/case/panelProfileVaultOverview';
import { IconExtensionStart, IconExtensionStop } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType } from '@/types/case';
import { Button } from 'antd';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  currentWorkflowId: string;
  isFold: boolean;
  onShowInstallExtension: () => void;
  onShowNewWorkflow: () => void;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const {
    caseInfo = null,
    currentWorkflowId,
    isFold,
    onShowInstallExtension,
    onShowNewWorkflow,
  } = props;

  const tabList = useRef([
    {
      value: 'overview',
      label: 'Overview',
    },
    {
      value: 'applicantProfile',
      label: 'Applicant Profile',
    },
    {
      value: 'sponsorDetails',
      label: 'Sponsor Details',
    },
    {
      value: 'lawyer',
      label: 'Lawyer',
    },
    {
      value: 'caseSettings',
      label: 'Case Settings',
    },
  ]);

  const [isLoadingExtensionStop, setLoadingExtensionStop] = useState<boolean>(false);

  const { extensionsInfo } = useExtensionsStore();

  useEffect(() => {
    if (!currentWorkflowId) {
      setLoadingExtensionStop(false);
    }
  }, []);

  const handleBtnDraftEmailClick = () => {
    console.log('handleBtnDraftEmailClick');
  };

  const handleBtnExtensionStartClick = () => {
    if (!extensionsInfo?.version) {
      onShowInstallExtension?.();
      return;
    }

    onShowNewWorkflow?.();
  };

  const handleBtnExtensionStopClick = () => {
    setLoadingExtensionStop(true);
    window.postMessage({
      type: 'ginkgoo-page-all-case-stop',
      workflowId: currentWorkflowId,
    });
  };

  return (
    <PanelContainer
      title="Profile vault"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <div className="mt-2 flex flex-row items-center justify-between gap-2.5">
            <Button
              type="default"
              className="h-9 flex-1"
              onClick={handleBtnDraftEmailClick}
            >
              <span className="font-bold">Draft email</span>
            </Button>
            {!!currentWorkflowId ? (
              <Button
                type="primary"
                className="h-9 flex-1"
                loading={isLoadingExtensionStop}
                onClick={handleBtnExtensionStopClick}
              >
                <IconExtensionStop />
                <span className="font-bold">Stop auto-fill</span>
              </Button>
            ) : (
              <Button
                type="primary"
                className="h-9 flex-1"
                onClick={handleBtnExtensionStartClick}
              >
                <IconExtensionStart />
                <span className="font-bold">Start auto-fill</span>
              </Button>
            )}
          </div>
        );
      }}
    >
      {caseInfo ? (
        <div
          className={cn(
            'flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0 text-foreground'
          )}
        >
          <Tabs defaultValue="overview">
            <TabsList className="rounded-full gap-x-2 bg-[#F1F1F4] mb-2">
              {tabList.current.map(({ label, value }) => (
                <TabsTrigger
                  value={value}
                  key={value}
                  className={cn(
                    'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer'
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <PanelProfileVaultOverview {...caseInfo} />
            </TabsContent>
            <TabsContent value="applicantProfile">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="sponsorDetails">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="lawyer">UNDER CONSTRUCTION</TabsContent>
            <TabsContent value="caseSettings">UNDER CONSTRUCTION</TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <Image
            src="/imgProfileVaultEmpty.png"
            width={220}
            height={240}
            alt="default"
            className="mb-4"
          ></Image>
          <p className="text-base mb-8 relative">
            Processing Your Documents
            <span className="after:animate-point-loading inline-block w-1"></span>
          </p>
          <p className="text-[#b4b4b3] w-3/4 text-center">
            Our AI is currently analyzing your documents. This may take a few moments.
            Please wait, and we'll notify you once it's complete.
          </p>
        </div>
      )}
    </PanelContainer>
  );
}

export const PanelProfileVault = memo(PurePanelProfileVault);
