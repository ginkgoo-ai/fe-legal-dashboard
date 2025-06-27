'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PanelProfileVaultOverview } from '@/components/case/panelProfileVaultOverview';
import { Button, buttonVariants } from '@/components/ui/button';
import { IconExtensionStart, IconExtensionStop } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { camelToCapitalizedWords, cn } from '@/lib/utils';
import { getMissingFieldEmailTemplate } from '@/service/api';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import { PanelProfileVaultDynamicTab } from '../panelProfileVaultDynamicTab';
import { PanelProfileVaultRtxDialog } from '../panelProfileVaultRtxDialog';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  isFold: boolean;
  onShowInstallExtension: () => void;
  onShowNewWorkflow: () => void;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const {
    caseInfo = null,
    pilotInfoCurrent = null,
    isFold,
    onShowInstallExtension,
    onShowNewWorkflow,
  } = props;

  const [isLoadingExtensionStop, setLoadingExtensionStop] = useState<boolean>(false);
  const [missingFieldsEmail, setMissingFieldsEmail] = useState<string>('');
  const [tabList, setTabList] = useState<any[]>([]);
  const { extensionsInfo } = useExtensionsStore();

  useEffect(() => {
    if (!pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id) {
      setLoadingExtensionStop(false);
    }
  }, [pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id]);

  useEffect(() => {
    if (caseInfo?.profileData) {
      const list = getTabList(caseInfo.profileData);
      console.log(list);
      setTabList([
        {
          label: 'Overview',
          value: 'overview',
        },
        ...list,
      ]);
    }
  }, [caseInfo]);

  useEffect(() => {
    if (caseInfo?.id) {
      getMissingFieldsEmail();
    }
  }, [caseInfo]);

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
      type: 'ginkgoo-page-all-pilot-stop',
      workflowId: pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id,
    });
  };

  const getMissingFieldsEmail = async () => {
    try {
      const res = await getMissingFieldEmailTemplate(caseInfo!.id);
      if (res.htmlBody) {
        setMissingFieldsEmail(res.htmlBody);
      }
    } catch (error) {
      console.error('Error fetching missing fields email:', error);
    }
  };

  const getTabList = (profileData: ICaseItemType['profileData']) => {
    if (!profileData) return [];
    return Object.keys(profileData)
      .map(key => ({
        value: key,
        label: camelToCapitalizedWords(key),
      }))
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  return (
    <PanelContainer
      title="Profile vault"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <div className="mt-2 flex flex-row items-center justify-between gap-2.5">
            <PanelProfileVaultRtxDialog content={missingFieldsEmail}>
              <div
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'default' }),
                  'h-9 flex-1'
                )}
              >
                <span className="font-bold">Draft email</span>
              </div>
            </PanelProfileVaultRtxDialog>
            {!pilotInfoCurrent ||
            pilotInfoCurrent?.pilotStatus === PilotStatusEnum.HOLD ? (
              <Button
                variant="default"
                color="primary"
                className="h-9 flex-1"
                onClick={handleBtnExtensionStartClick}
              >
                <IconExtensionStart />
                <span className="font-bold">Start auto-fill</span>
              </Button>
            ) : (
              <Button
                variant="default"
                color="primary"
                className="h-9 flex-1"
                disabled={isLoadingExtensionStop}
                onClick={handleBtnExtensionStopClick}
              >
                {isLoadingExtensionStop ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <IconExtensionStop />
                )}
                <span className="font-bold">Stop auto-fill</span>
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
            <TabsList className="rounded-full gap-x-2 bg-[#F1F1F4] mb-2 max-w-full overflow-x-auto justify-start snap-proximity snap-x">
              {tabList.map(({ label, value }) => (
                <TabsTrigger
                  value={value}
                  key={value}
                  className={cn(
                    'rounded-full px-4 text-[#6B7280] data-[state="active"]:!text-white cursor-pointer snap-start'
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <PanelProfileVaultOverview {...caseInfo} />
            </TabsContent>
            {tabList
              .filter(tab => tab.value !== 'overview')
              .map(({ value, label }) => (
                <TabsContent value={value} key={value}>
                  <PanelProfileVaultDynamicTab
                    data={caseInfo?.profileData?.[value] as Record<string, unknown>}
                    label={label}
                    originalKey={value}
                    caseId={caseInfo?.id}
                  />
                </TabsContent>
              ))}
          </Tabs>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full">
          <Image
            src="/imgProfileVaultEmpty.png"
            width={220}
            height={238}
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
