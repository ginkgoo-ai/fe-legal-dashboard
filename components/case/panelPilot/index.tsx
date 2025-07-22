'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotNotInstall } from '@/components/case/pilotNotInstall';
import { PilotReady } from '@/components/case/pilotReady';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { Button } from '@/components/ui/button';
import { IconExtensionStart, IconExtensionStop } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType } from '@/types/case';
import { IPilotType, IWorkflowType, PilotStatusEnum } from '@/types/casePilot';
import { Alert } from 'antd';
import { Loader2Icon, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { SiteLogo } from '../siteLogo';

interface PanelPanelPilotProps {
  isLoadingQueryWorkflowList: boolean;
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  workflowList: IWorkflowType[];
  onShowNewWorkflow: () => void;
  oBtnCloseClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const {
    isLoadingQueryWorkflowList,
    pageTabInfo,
    caseInfo,
    pilotInfoCurrent,
    workflowList,
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
              <X size={24} />
            </Button>
          </div>
        );
      }}
    >
      <div className="box-border p-4">
        {extensionsInfo?.version ? (
          isLoadingQueryWorkflowList ? (
            <div className="flex flex-col justify-center items-center text-primary h-40">
              <SiteLogo size={24} className="animate-spin animation-duration-[2s] mb-2" />
              <p className="after:animate-point-loading">Loading</p>
            </div>
          ) : (
            <>
              {workflowList?.length === 0 ? (
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
                  {workflowList.map((itemWorkflow, indexWorkflow) => {
                    return (
                      <PilotWorkflow
                        key={`workflow-item-${indexWorkflow}`}
                        pageTabInfo={pageTabInfo}
                        caseInfo={caseInfo}
                        workflowInfo={itemWorkflow}
                        indexKey={`panel-pilot-workflow-${indexWorkflow}`}
                        pilotInfoCurrent={pilotInfoCurrent}
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
