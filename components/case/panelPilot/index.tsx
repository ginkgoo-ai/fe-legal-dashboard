import { PanelContainer } from '@/components/case/panelContainer';
import { PilotNotInstall } from '@/components/case/pilotNotInstall';
import { PilotPreparing } from '@/components/case/pilotPreparing';
import { PilotReady } from '@/components/case/pilotReady';
import { PilotRunningHeader } from '@/components/case/pilotRunningHeader';
import { PilotRunningStep } from '@/components/case/pilotRunningStep';
import { Button } from '@/components/ui/button';
import { IconFoldRight } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import {
  ICaseItemType,
  IPilotType,
  IStepItemType,
  PilotModeEnum,
  PilotStatusEnum,
} from '@/types/case';
import { IOcrFileType } from '@/types/file';
import { memo, useEffect, useRef, useState } from 'react';

interface PanelPanelPilotProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  onBtnPanelRightClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const { caseInfo, isFold, onBtnPanelRightClick } = props;

  const fillDataRef = useRef<Record<string, unknown>>({});

  const [pilotMode, setPilotMode] = useState<PilotModeEnum | null>(null);
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<IStepItemType[]>([]);

  const { extensionsInfo } = useExtensionsStore();

  const { emit } = useEventManager('ginkgo-message', message => {
    console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;
    if (typeMsg === 'ginkgo-background-all-case-update') {
      const {
        caseId: caseIdMsg,
        stepListCurrent: stepListCurrentMsg,
        stepListItems: stepListItemsMsg,
      } = pilotInfoMsg || {};

      pilotInfoMsg.pilotStatus = PilotStatusEnum.COMPLETED;

      setPilotInfo(pilotInfoMsg);
      setStepListCurrent(stepListCurrentMsg);
      setStepListItems(stepListItemsMsg);

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

  useEffect(() => {
    if (!extensionsInfo?.version) {
      setPilotMode(PilotModeEnum.NOT_INSTALL);
      return;
    }

    window.postMessage({
      type: 'ginkgo-page-background-case-query',
      caseId: caseInfo?.id,
    });

    if (false && Math.random() > 0.5) {
      setPilotMode(PilotModeEnum.PREPARING);
    } else {
      setPilotMode(PilotModeEnum.READY);
    }

    // gen fill_data
    fillDataRef.current = {};
    caseInfo?.documents?.forEach((item: IOcrFileType, index: number) => {
      fillDataRef.current[item.documentType] = item.metadataJson
        ? JSON.parse(item.metadataJson)
        : {};
    });
  }, [extensionsInfo?.version, caseInfo?.timestamp]);

  const handleBtnStartClick = () => {
    const message = {
      type: 'ginkgo-page-all-case-start',
      caseId: caseInfo?.id,
      fill_data: fillDataRef.current,
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

  // const handleBtnDownloadClick = async () => {
  //   console.log('handleBtnDownloadClick', pilotInfo);
  //   if (pilotInfo?.pdfUrl && pilotInfo?.cookiesStr) {
  //     const headers = new AxiosHeaders();
  //     // headers.set('Accept', 'application/octet-stream');
  //     headers.set('withCredentials', true);
  //     headers.set('Cookie', pilotInfo.cookiesStr);

  //     const resDownloadCustomFile = await downloadCustomFile({
  //       url: pilotInfo.pdfUrl,
  //       headers,
  //     });

  //     // await saveBlob({ blobPart: resDownloadCustomFile });
  //   }
  // };

  const handleBtnJumpClick = async () => {
    if (!!pilotInfo?.tabInfo?.url) {
      const messageJump = {
        type: 'ginkgo-page-background-tab-update',
        tabId: pilotInfo?.tabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);

      const messageOpenSidepanel = {
        type: 'ginkgo-page-background-sidepanel-open',
        options: {
          tabId: pilotInfo?.tabInfo?.id,
        },
      };
      window.postMessage(messageOpenSidepanel, window.location.origin);

      // console.log('handleBtnJumpClick', messageJump, messageOpenSidepanel);
    }
  };

  const handleBtnSidepanelOpenClick = async () => {
    const messageOpenSidepanel = {
      type: 'ginkgo-page-background-sidepanel-open',
      options: {
        tabId: pilotInfo?.tabInfo?.id,
      },
    };

    window.postMessage(messageOpenSidepanel, window.location.origin);
  };

  const handleBtnInstallExtensionClick = () => {
    console.log('handleBtnInstallExtensionClick');
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
          <PilotRunningHeader
            pilotInfo={pilotInfo}
            onBtnPauseClick={handleBtnPauseClick}
          />
        ) : null;
      }}
      // renderFooter={() => {
      //   return (
      //     <div className="flex flex-col w-full">
      //       <div className="flex flex-col flex-[0_0_auto]">
      //         <div className="flex flex-row gap-2">
      //           <div className="flex flex-row gap-2">
      //             <span className="whitespace-nowrap font-bold">Status:</span>
      //             <span
      //               className={cn('font-bold', {
      //                 'text-green-500': pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
      //                 'text-red-500': pilotInfo?.pilotStatus === PilotStatusEnum.HOLD,
      //               })}
      //             >
      //               {pilotInfo?.pilotStatus || ''}
      //             </span>
      //           </div>
      //           <div className="flex flex-row gap-2">
      //             <span className="whitespace-nowrap font-bold">Version:</span>
      //             <span className={cn('font-bold')}>{extensionsInfo?.version}</span>
      //           </div>
      //         </div>
      //       </div>
      //       <div className="flex flex-row gap-2">
      //         <Button
      //           variant="default"
      //           disabled={!extensionsInfo?.version}
      //           onClick={handleBtnStartClick}
      //         >
      //           <CirclePlay />
      //         </Button>
      //         <Button
      //           variant="outline"
      //           disabled={!extensionsInfo?.version}
      //           onClick={handleBtnStopClick}
      //         >
      //           <CircleStop />
      //         </Button>

      //         <Button
      //           variant="outline"
      //           disabled={!extensionsInfo?.version || !pilotInfo?.tabInfo?.id}
      //           onClick={handleBtnJumpClick}
      //         >
      //           <SquareArrowOutUpRight />
      //         </Button>

      //         <Button
      //           variant="outline"
      //           disabled={!extensionsInfo?.version || !pilotInfo?.tabInfo?.id}
      //           onClick={handleBtnSidepanelOpenClick}
      //         >
      //           <PanelRight />
      //         </Button>
      //       </div>
      //     </div>
      //   );
      // }}
    >
      <div className={cn('flex flex-col overflow-y-auto p-4 box-border flex-1 h-0')}>
        {/* <div className="flex-[0_0_auto]">
          <div className="whitespace-nowrap font-bold">Steps:</div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto box-border flex-1 h-0">
          <Steps direction="vertical" current={stepListCurrent} items={stepListItems} />
        </div> */}

        {pilotMode === PilotModeEnum.NOT_INSTALL ? (
          <PilotNotInstall onBtnInstallClick={handleBtnInstallExtensionClick} />
        ) : null}

        {pilotMode === PilotModeEnum.PREPARING ? <PilotPreparing /> : null}

        {pilotMode === PilotModeEnum.READY ? (
          <PilotReady onBtnStartClick={handleBtnStartClick} />
        ) : null}

        {/* {pilotMode === PilotModeEnum.RUNNING ? (
          <PilotRunningStep
            caseInfo={caseInfo}
            stepListCurrent={stepListCurrent}
            stepListItems={stepListItems}
          />
        ) : null} */}

        {pilotMode === PilotModeEnum.RUNNING ? (
          <PilotRunningStep
            caseInfo={caseInfo}
            pilotInfo={pilotInfo}
            stepListCurrent={stepListCurrent}
            stepListItems={stepListItems}
          />
        ) : null}
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
