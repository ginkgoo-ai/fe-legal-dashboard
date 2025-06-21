'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { Button } from '@/components/ui/button';
import { IconFoldRight } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ICaseItemType } from '@/types/case';
import { IWorkflowType } from '@/types/casePilot';
import { memo, useMemo } from 'react';

interface PanelPanelPilotProps {
  caseInfo: ICaseItemType;
  currentWorkflowId: string;
  pilotWorkflowList: IWorkflowType[];
  isFold: boolean;
  onBtnPanelRightClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const { caseInfo, currentWorkflowId, pilotWorkflowList, isFold, onBtnPanelRightClick } =
    props;

  const indexCurrentWorkflow = useMemo(() => {
    return pilotWorkflowList.findIndex(item => {
      return item.workflow_instance_id === currentWorkflowId;
    });
  }, [currentWorkflowId, pilotWorkflowList]);

  // const handleStepCollapseChange = async (stepKey: string) => {
  //   const message = {
  //     type: 'ginkgoo-page-background-polit-step-query',
  //     workflowId: pilotWorkflowList,
  //     stepKey,
  //   };

  //   window.postMessage(message, window.location.origin);
  // };

  // const handleStepContinueFilling = (params: { actionlistPre: IActionItemType[] }) => {
  //   const { actionlistPre } = params || {};

  //   try {
  //     window.postMessage({
  //       type: 'ginkgoo-page-all-case-start',
  //       pilotId: pilotInfo?.id,
  //       actionlistPre,
  //     });
  //   } catch (error) {
  //     console.error('[Ginkgoo] Sidepanel handleContinueFilling error', error);
  //   }
  // };

  return (
    <PanelContainer
      title="Pilot"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <Button variant="ghost" onClick={onBtnPanelRightClick}>
            <IconFoldRight size={24} />
          </Button>
        );
      }}
    >
      <div
        className={cn('flex flex-col overflow-y-auto p-4 box-border flex-1 h-0 gap-3')}
      >
        {pilotWorkflowList.map((itemWorkflow, indexWorkflow) => {
          return (
            <PilotWorkflow
              key={`workflow-item-${indexWorkflow}`}
              caseInfo={caseInfo}
              workflowInfo={itemWorkflow}
              isCurrentWorkflow={indexCurrentWorkflow === indexWorkflow}
            />
          );
        })}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
