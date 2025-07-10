'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotNotInstall } from '@/components/case/pilotNotInstall';
import { PilotReady } from '@/components/case/pilotReady';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { Button } from '@/components/ui/button';
import {
  IconClose,
  IconExtensionStart,
  IconExtensionStop,
  IconLogo,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import GlobalManager from '@/customManager/GlobalManager';
import UtilsManager from '@/customManager/UtilsManager';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Alert, message as messageAntd } from 'antd';
import { Loader2Icon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface PanelPanelPilotProps {
  isLoadingQueryWorkflowList: boolean;
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  pilotList: IPilotType[];
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
  onBtnContinueClick: (params: { workflowId: string }) => void;
  onShowNewWorkflow: () => void;
  oBtnCloseClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const {
    isLoadingQueryWorkflowList,
    pageTabInfo,
    caseInfo,
    pilotInfoCurrent,
    pilotList,
    onQueryWorkflowDetail,
    onBtnContinueClick,
    onShowNewWorkflow,
    oBtnCloseClick,
  } = props;

  const [isLoadingExtensionStop, setLoadingExtensionStop] = useState<boolean>(false);
  const { extensionsInfo } = useExtensionsStore();

  useEffect(() => {
    if (
      !!pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id &&
      pilotInfoCurrent?.pilotStatus !== PilotStatusEnum.HOLD
    ) {
      setLoadingExtensionStop(false);
    }
  }, [
    pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id,
    pilotInfoCurrent?.pilotStatus,
  ]);

  const handleBtnExtensionStartClick = () => {
    if (
      extensionsInfo?.version !== '999.998.997' &&
      extensionsInfo?.version !== GlobalManager.versionExtension
    ) {
      messageAntd.open({
        type: 'warning',
        content: MESSAGE.TOAST_VERSION_MISMATCH,
      });
      UtilsManager.clickTagA({
        url: GlobalManager.urlInstallExtension,
      });
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

  return (
    <PanelContainer
      title="Pilot"
      showTitle={true}
      renderTitleExtend={() => {
        return (
          <div className="flex flex-row items-center gap-2.5">
            {!!extensionsInfo?.version && (
              <>
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
              </>
            )}
            <Button
              type="button"
              variant="ghost"
              className={cn('w-9 h-9 flex-shrink-0 cursor-pointer')}
              onClick={oBtnCloseClick}
            >
              <IconClose size={24} />
            </Button>
          </div>
        );
      }}
    >
      <div className="box-border p-4">
        {extensionsInfo?.version ? (
          isLoadingQueryWorkflowList ? (
            <div className="flex flex-col justify-center items-center text-primary h-40">
              <IconLogo size={24} className="animate-spin animation-duration-[2s] mb-2" />
              <p className="after:animate-point-loading">Loading</p>
            </div>
          ) : (
            <>
              {pilotList?.length === 0 ? (
                <PilotReady />
              ) : (
                <div
                  className={cn('box-border flex flex-1 flex-col gap-3 overflow-y-auto')}
                >
                  {pilotInfoCurrent?.pilotStatus === PilotStatusEnum.HOLD &&
                  !!pilotInfoCurrent?.pilotLastMessage ? (
                    <Alert
                      style={{ width: '100%' }}
                      message={pilotInfoCurrent.pilotLastMessage}
                      type="warning"
                      showIcon
                      closable
                    />
                  ) : null}
                  {pilotList.map((itemPilot, indexPilot) => {
                    return (
                      <PilotWorkflow
                        key={`pilot-item-${indexPilot}`}
                        pageTabInfo={pageTabInfo}
                        caseInfo={caseInfo}
                        pilotInfo={itemPilot}
                        indexPilot={indexPilot}
                        pilotInfoCurrent={pilotInfoCurrent}
                        onQueryWorkflowDetail={onQueryWorkflowDetail}
                        onBtnContinueClick={onBtnContinueClick}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )
        ) : (
          <PilotNotInstall />
        )}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
