'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { cn } from '@/lib/utils';
import { ICaseItemType } from '@/types/case';
import { IPilotType } from '@/types/casePilot';
import { memo, useMemo } from 'react';

interface PanelPanelPilotProps {
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  currentWorkflowId: string;
  pilotList: IPilotType[];
  isFold?: boolean;
  onBtnPanelRightClick?: () => void;
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const {
    pageTabInfo,
    caseInfo,
    currentWorkflowId,
    pilotList,
    // isFold,
    // onBtnPanelRightClick,
    onQueryWorkflowDetail,
  } = props;

  const indexCurrentPilot = useMemo(() => {
    const result = pilotList.findIndex(item => {
      return item.pilotWorkflowInfo?.workflow_instance_id === currentWorkflowId;
    });
    // console.log('PurePanelPilot', currentWorkflowId, pilotWorkflowList, result);
    return result;
  }, [currentWorkflowId, pilotList]);

  // const handleStepCollapseChange = async (stepKey: string) => {
  //   const message = {
  //     type: 'ginkgoo-page-background-pilot-step-query',
  //     workflowId: pilotWorkflowList,
  //     stepKey,
  //   };

  //   window.postMessage(message, window.location.origin);
  // };

  return (
    <PanelContainer
      title="Pilot"
      showTitle={true}
      // renderTitleExtend={() => {
      //   return (
      //     <Button variant="ghost" onClick={onBtnPanelRightClick}>
      //       <IconFoldRight size={24} />
      //     </Button>
      //   );
      // }}
    >
      <div
        className={cn('flex flex-col overflow-y-auto p-4 box-border flex-1 h-0 gap-3')}
      >
        {pilotList.map((itemPilot, indexPilot) => {
          return (
            <PilotWorkflow
              key={`pilot-item-${indexPilot}`}
              pageTabInfo={pageTabInfo}
              caseInfo={caseInfo}
              pilotInfo={itemPilot}
              indexPilot={indexPilot}
              isCurrentPilot={indexCurrentPilot === indexPilot}
              onQueryWorkflowDetail={onQueryWorkflowDetail}
            />
          );
        })}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
