'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { PilotNotInstall } from '@/components/case/pilotNotInstall';
import { PilotPreparing } from '@/components/case/pilotPreparing';
import { PilotReady } from '@/components/case/pilotReady';
import { PilotStepBody } from '@/components/case/pilotStepBody';
import { PilotStepHeader } from '@/components/case/pilotStepHeader';
import { Button } from '@/components/ui/button';
import { IconFoldRight } from '@/components/ui/icon';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { getWorkflowList, getWorkflowStepData } from '@/service/api/case';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType, IPilotType, PilotModeEnum } from '@/types/case';
import { IWorkflowStepType } from '@/types/casePilot';
import { IOcrFileType } from '@/types/file';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { memo, useEffect, useRef, useState } from 'react';

interface PanelPanelPilotProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  onBtnPanelRightClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const { caseInfo, isFold, onBtnPanelRightClick } = props;

  const refFillData = useRef<Record<string, unknown>>({});

  const [workflowId, setWorkflowId] = useState<string>(
    '1221f2f4-5311-4e15-b7dd-aecd4f8d9401'
  );

  const [pilotMode, setPilotMode] = useState<PilotModeEnum | null>(null);
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<IWorkflowStepType[]>([]);

  const { extensionsInfo } = useExtensionsStore();

  useEventManager('ginkgo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;
    if (typeMsg === 'ginkgo-background-all-case-update') {
      const { stepListCurrent: stepListCurrentMsg, stepListItems: stepListItemsMsg } =
        pilotInfoMsg || {};

      // pilotInfoMsg && (pilotInfoMsg.pilotStatus = PilotStatusEnum.COMPLETED);

      setPilotInfo(pilotInfoMsg);
      // setStepListCurrent(stepListCurrentMsg);
      // setStepListItems(stepListItemsMsg);

      if (
        stepListCurrentMsg >= 0 &&
        stepListItemsMsg?.length > 0 &&
        !!stepListItemsMsg[stepListCurrentMsg]
      ) {
        setTimeout(() => {
          const { actioncurrent, actionlist } =
            stepListItemsMsg[stepListCurrentMsg] || {};
          if (actioncurrent >= 0 && actionlist?.length > 0) {
            document
              .getElementById(`action-item-${stepListCurrentMsg}-${actioncurrent}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            document
              .getElementById(`step-item-${stepListCurrentMsg}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 40);
      }
    }
  });

  const init = async () => {
    const res = await getWorkflowList({
      workflowId,
    });

    if (res) {
      setStepListItems(res.steps);
    }
  };

  useEffectStrictMode(() => {
    init();
  }, [workflowId]);

  useEffect(() => {
    if (!extensionsInfo?.version) {
      setPilotMode(PilotModeEnum.NOT_INSTALL);
      return;
    }

    window.postMessage({
      type: 'ginkgo-page-background-case-query',
      caseId: caseInfo?.id,
    });

    // setPilotMode(PilotModeEnum.PREPARING);
    // setPilotMode(PilotModeEnum.READY);
    setPilotMode(PilotModeEnum.RUNNING);

    // gen fill_data
    refFillData.current = {};
    caseInfo?.documents?.forEach((item: IOcrFileType) => {
      refFillData.current[item.documentType] = item.metadataJson
        ? JSON.parse(item.metadataJson)
        : {};
    });
  }, [extensionsInfo?.version, caseInfo?.timestamp, caseInfo?.documents, caseInfo?.id]);

  const handleBtnStartClick = () => {
    const message = {
      type: 'ginkgo-page-all-case-start',
      caseId: caseInfo?.id,
      fill_data: refFillData.current,
    };

    window.postMessage(message, window.location.origin);

    setPilotMode(PilotModeEnum.RUNNING);
  };

  const handleBtnPauseClick = () => {
    const message = {
      type: 'ginkgo-page-all-case-stop',
      caseId: caseInfo?.id,
    };

    window.postMessage(message, window.location.origin);

    setPilotMode(PilotModeEnum.READY);
  };

  const handleStepCollapseChange = async (stepKey: string) => {
    console.log('handleStepCollapseChange', stepKey);

    const res = await getWorkflowStepData({
      workflowId,
      stepKey,
    });

    setStepListItems(prev =>
      cloneDeep(
        produce(prev, draft => {
          const index = draft.findIndex(item => {
            return item.step_key === stepKey;
          });
          if (index >= 0) {
            draft[index].data = res;
          }
        })
      )
    );
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
      renderHeader={() => {
        return pilotMode === PilotModeEnum.RUNNING ? (
          <PilotStepHeader pilotInfo={pilotInfo} onBtnPauseClick={handleBtnPauseClick} />
        ) : null;
      }}
    >
      <div className={cn('flex flex-col overflow-y-auto p-4 box-border flex-1 h-0')}>
        {pilotMode === PilotModeEnum.NOT_INSTALL ? <PilotNotInstall /> : null}

        {pilotMode === PilotModeEnum.PREPARING ? <PilotPreparing /> : null}

        {pilotMode === PilotModeEnum.READY ? (
          <PilotReady onBtnStartClick={handleBtnStartClick} />
        ) : null}

        {/* {pilotMode === PilotModeEnum.RUNNING ? (
          <PilotStepBodyOld
            caseInfo={caseInfo}
            stepListCurrent={stepListCurrent}
            stepListItems={stepListItems}
          />
        ) : null} */}

        {pilotMode === PilotModeEnum.RUNNING ? (
          <PilotStepBody
            pilotInfo={pilotInfo}
            stepListItems={stepListItems}
            onCollapseChange={handleStepCollapseChange}
          />
        ) : null}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
