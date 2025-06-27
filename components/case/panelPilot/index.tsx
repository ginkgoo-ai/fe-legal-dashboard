'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { cn } from '@/lib/utils';
import { ICaseItemType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Alert } from 'antd';
import { memo } from 'react';

interface PanelPanelPilotProps {
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  pilotList: IPilotType[];
  isFold?: boolean;
  onBtnPanelRightClick?: () => void;
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const {
    pageTabInfo,
    caseInfo,
    pilotInfoCurrent,
    pilotList,
    // isFold,
    // onBtnPanelRightClick,
    onQueryWorkflowDetail,
  } = props;

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
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
