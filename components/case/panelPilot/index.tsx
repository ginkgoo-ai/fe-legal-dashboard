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
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Alert, Spin } from 'antd';
import { Loader2Icon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface PanelPanelPilotProps {
  isLoadingQueryWorkflowList: boolean;
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  pilotList: IPilotType[];
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
  onShowNewWorkflow: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const {
    isLoadingQueryWorkflowList,
    pageTabInfo,
    caseInfo,
    pilotInfoCurrent,
    pilotList,
    onQueryWorkflowDetail,
    onShowNewWorkflow,
  } = props;

  const [isLoadingExtensionStop, setLoadingExtensionStop] = useState<boolean>(false);
  const { extensionsInfo } = useExtensionsStore();

  useEffect(() => {
    if (!!pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id) {
      setLoadingExtensionStop(false);
    }
  }, [pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id]);

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
          !!extensionsInfo?.version && (
            <div className="flex flex-row items-center justify-between gap-2.5">
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
          )
        );
      }}
    >
      <div className="box-border p-4">
        {extensionsInfo?.version ? (
          isLoadingQueryWorkflowList ? (
            <Spin>
              <div className="w-full h-40"></div>
            </Spin>
          ) : (
            <>
              {pilotList?.length === 0 ? (
                <PilotReady onBtnStartClick={handleBtnExtensionStartClick} />
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
                        pilotInfoCurrent={pilotInfoCurrent}
                        indexPilot={indexPilot}
                        onQueryWorkflowDetail={onQueryWorkflowDetail}
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
