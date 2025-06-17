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
import { useExtensionsStore } from '@/store/extensionsStore';
import { IActionItemType, ICaseItemType, IPilotType, PilotModeEnum } from '@/types/case';
import { IWorkflowStepType } from '@/types/casePilot';
import { IOcrFileType } from '@/types/file';
import { message as messageAntd } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { stepListItemsDeclaration } from './config';

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
  const [stepListItems, setStepListItems] = useState<IWorkflowStepType[]>([]);

  const { extensionsInfo } = useExtensionsStore();

  useEventManager('ginkgo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;

    switch (typeMsg) {
      case 'ginkgo-background-all-case-update': {
        const { steps: stepsMsg } = pilotInfoMsg || {};

        setPilotInfo(pilotInfoMsg);
        if (stepsMsg?.length > 0) {
          setStepListItems(stepsMsg.concat(stepListItemsDeclaration));
        }

        // if (
        //   stepListCurrentMsg >= 0 &&
        //   stepListItemsMsg?.length > 0 &&
        //   !!stepListItemsMsg[stepListCurrentMsg]
        // ) {
        //   setTimeout(() => {
        //     const { actioncurrent, actionlist } =
        //       stepListItemsMsg[stepListCurrentMsg] || {};
        //     if (actioncurrent >= 0 && actionlist?.length > 0) {
        //       document
        //         .getElementById(`action-item-${stepListCurrentMsg}-${actioncurrent}`)
        //         ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        //     } else {
        //       document
        //         .getElementById(`step-item-${stepListCurrentMsg}`)
        //         ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        //     }
        //   }, 40);
        // }
        break;
      }
      case 'ginkgo-background-all-toast': {
        const { content } = message || {};
        messageAntd.open({
          content,
          type: 'info',
        });
        console.log('ginkgo-background-all-toast', content);
        break;
      }
      case 'ginkgo-background-all-case-error': {
        const { content } = message || {};
        if (content) {
          messageAntd.open({
            content,
            type: 'error',
          });
        }
        setPilotMode(PilotModeEnum.READY);
        break;
      }
      default: {
        break;
      }
    }
  });

  useEffectStrictMode(() => {
    if (!workflowId) {
      return;
    }

    const message = {
      type: 'ginkgo-page-background-case-query',
      caseId: caseInfo?.id,
      workflowId,
      fill_data: refFillData.current,
    };

    window.postMessage(message, window.location.origin);
  }, [caseInfo?.id, workflowId]);

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
    setPilotMode(PilotModeEnum.READY);
    // setPilotMode(PilotModeEnum.RUNNING);

    // gen fill_data
    refFillData.current = {};
    caseInfo?.documents?.forEach((item: IOcrFileType) => {
      refFillData.current[item.documentType] = item.metadataJson
        ? JSON.parse(item.metadataJson)
        : {};
    });
  }, [extensionsInfo?.version, caseInfo?.timestamp, caseInfo?.documents, caseInfo?.id]);

  const handleBtnStartClick = () => {
    const workflowIdTmp = '1221f2f4-5311-4e15-b7dd-aecd4f8d9401';
    const url = 'https://visas-immigration.service.gov.uk/next'; // test
    //'https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/';
    const message = {
      type: 'ginkgo-page-all-case-start',
      url,
      caseId: caseInfo?.id,
      workflowId: workflowIdTmp,
      fill_data: refFillData.current,
    };

    window.postMessage(message, window.location.origin);

    setPilotMode(PilotModeEnum.RUNNING);
    setWorkflowId(workflowIdTmp);
  };

  const handleBtnPauseClick = () => {
    const message = {
      type: 'ginkgo-page-all-case-stop',
      workflowId,
    };

    window.postMessage(message, window.location.origin);

    setPilotMode(PilotModeEnum.READY);
  };

  const handleStepCollapseChange = async (stepKey: string) => {
    const message = {
      type: 'ginkgo-page-background-polit-step-query',
      workflowId,
      stepKey,
    };

    window.postMessage(message, window.location.origin);
  };

  const handleStepContinueFilling = (params: { actionlistPre: IActionItemType[] }) => {
    const { actionlistPre } = params || {};
    const url = 'https://visas-immigration.service.gov.uk/next'; // test

    try {
      window.postMessage({
        type: 'ginkgo-page-all-case-start',
        url,
        caseId: caseInfo?.id,
        workflowId,
        fill_data: refFillData.current,
        actionlistPre,
      });
    } catch (error) {
      console.error('[Ginkgo] Sidepanel handleContinueFilling error', error);
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
            onContinueFilling={handleStepContinueFilling}
          />
        ) : null}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
