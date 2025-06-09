import { PanelContainer } from '@/components/case/panelContainer';
import { PilotNotInstall } from '@/components/case/pilotNotInstall';
import { PilotPreparing } from '@/components/case/pilotPreparing';
import { PilotReady } from '@/components/case/pilotReady';
import { Button } from '@/components/ui/button';
import { IconFoldRight } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { IActionItemType, ICaseItemType, IPilotType, IStepItemType } from '@/types/case';
import { StepProps, Steps, Tag, Tooltip } from 'antd';
import { memo, useEffect, useState } from 'react';

interface PanelPanelPilotProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  onBtnPanelRightClick: () => void;
}

function PurePanelPilot(props: PanelPanelPilotProps) {
  const { caseInfo, isFold, onBtnPanelRightClick } = props;

  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<StepProps[]>([]);

  const { extensionsInfo } = useExtensionsStore();

  const { emit } = useEventManager('ginkgo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;
    if (typeMsg === 'ginkgo-background-all-case-update') {
      const {
        caseId: caseIdMsg,
        stepListCurrent: stepListCurrentMsg,
        stepListItems: stepListItemsMsg,
      } = pilotInfoMsg || {};

      setPilotInfo(pilotInfoMsg);
      setStepListCurrent(stepListCurrentMsg);
      setStepListItems(calcStepListCurrent(stepListItemsMsg));

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

  const calcActionItem = (
    item: IActionItemType,
    indexStep: number,
    indexAction: number
  ) => {
    const { type, selector, value, actionresult, actiontimestamp } = item || {};

    return {
      title: (
        <div
          id={`action-item-${indexStep}-${indexAction}`}
          className="flex flex-row items-center gap-1"
        >
          <Tag className="flex-0 whitespace-nowrap" color="success">
            {type}
          </Tag>
          <Tooltip placement="top" title={selector} mouseEnterDelay={1}>
            <div className="flex-1 truncate">{selector}</div>
          </Tooltip>
          {actionresult && (
            <Tag
              className="flex-0 whitespace-nowrap"
              color={actionresult === 'success' ? 'success' : 'error'}
            >
              {actionresult}
            </Tag>
          )}
        </div>
      ),
      description: (
        <div className="flex w-full flex-col">
          {value && (
            <div className="flex flex-row gap-1 text-gray-400">value: {value}</div>
          )}
          <div className="flex flex-row gap-1 text-gray-400">{actiontimestamp}</div>
        </div>
      ),
    };
  };

  const calcStepListCurrent = (source: IStepItemType[] = []) => {
    const result = source.map((itemStep, indexStep) => {
      return {
        title: (
          <div id={`step-item-${indexStep}`} className="font-bold">
            {itemStep.title}
          </div>
        ),
        description: (
          <div className="box-border pl-2">
            <Steps
              progressDot
              direction="vertical"
              current={itemStep.actioncurrent}
              items={itemStep.actionlist.map((itemAction, indexAction) =>
                calcActionItem(itemAction, indexStep, indexAction)
              )}
            />
          </div>
        ),
      };
    });

    return result;
  };

  useEffect(() => {
    if (!!extensionsInfo?.version) {
      window.postMessage({
        type: 'ginkgo-page-background-case-query',
        caseId: caseInfo?.id,
      });
    }
  }, [extensionsInfo?.version, caseInfo?.id]);

  const handleBtnStartClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-case-start',
      caseId: caseInfo?.id,
      fill_data: caseInfo?.fillDataForFront,
    };

    window.postMessage(message, window.location.origin);
  };

  const handleBtnStopClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-case-stop',
      caseId: caseInfo?.id,
    };

    window.postMessage(message, window.location.origin);
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

  const handleBtnPilotStartClick = () => {
    console.log('handleBtnStartClick');
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

      //         {/* <Button
      //         variant="outline"
      //         disabled={
      //           !extensionsInfo?.version || !pilotInfo?.pdfUrl || !pilotInfo?.cookiesStr
      //         }
      //         onClick={handleBtnDownloadClick}
      //       >
      //         <Download />
      //       </Button> */}

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
      <div
        className={cn('flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0')}
      >
        {/* <div className="flex-[0_0_auto]">
          <div className="whitespace-nowrap font-bold">Steps:</div>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto box-border flex-1 h-0">
          <Steps direction="vertical" current={stepListCurrent} items={stepListItems} />
        </div> */}

        <PilotNotInstall onBtnClick={handleBtnInstallExtensionClick} />

        <PilotPreparing />

        <PilotReady onBtnClick={handleBtnPilotStartClick} />
      </div>
    </PanelContainer>
  );
}

export const PanelPilot = memo(PurePanelPilot);
