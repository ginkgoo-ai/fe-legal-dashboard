'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotStepBody } from '@/components/case/pilotStepBody';
import { Button } from '@/components/ui/button';
import { IconFoldRight } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { IActionItemType, ICaseItemType } from '@/types/case';
import { IPilotType, IWorkflowStepType } from '@/types/casePilot';
import { memo } from 'react';

interface PanelPanelPilotProps {
  caseInfo: ICaseItemType | null;
  pilotInfo: IPilotType | null;
  stepListItems: IWorkflowStepType[];
  isFold: boolean;
  onBtnPanelRightClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const { caseInfo, pilotInfo, stepListItems, isFold, onBtnPanelRightClick } = props;

  const handleStepCollapseChange = async (stepKey: string) => {
    const message = {
      type: 'ginkgoo-page-background-polit-step-query',
      workflowId: pilotInfo?.workflowId,
      stepKey,
    };

    window.postMessage(message, window.location.origin);
  };

  const handleStepContinueFilling = (params: { actionlistPre: IActionItemType[] }) => {
    const { actionlistPre } = params || {};

    try {
      window.postMessage({
        type: 'ginkgoo-page-all-case-start',
        pilotId: pilotInfo?.id,
        actionlistPre,
      });
    } catch (error) {
      console.error('[Ginkgoo] Sidepanel handleContinueFilling error', error);
    }
  };

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
      <div className={cn('flex flex-col overflow-y-auto p-4 box-border flex-1 h-0')}>
        <PilotStepBody
          pilotInfo={pilotInfo}
          stepListItems={stepListItems}
          onCollapseChange={handleStepCollapseChange}
          onContinueFilling={handleStepContinueFilling}
        />
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
