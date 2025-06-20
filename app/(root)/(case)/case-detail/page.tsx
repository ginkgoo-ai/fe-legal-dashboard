'use client';

import { ModalInstallExtension } from '@/components/case/modalInstallExtension';
import { ModalNewWorkflow } from '@/components/case/modalNewWorkflow';
import { PanelPilot } from '@/components/case/panelPilot';
import { PanelProfileVault } from '@/components/case/panelProfileVault';
import { PanelReference } from '@/components/case/panelReference';
import { TagStatus } from '@/components/case/tagStatus';
import UtilsManager from '@/customManager/UtilsManager';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { cn, parseCaseInfo } from '@/lib/utils';
import { caseStream, getWorkflowDefinitions, queryCaseDetail } from '@/service/api/case';
import { useUserStore } from '@/store/userStore';
import { ICaseItemType } from '@/types/case';
import {
  IPilotType,
  IWorkflowStepType,
  PilotStatusEnum,
  WorkflowTypeEnum,
} from '@/types/casePilot';
import { Breadcrumb, message as messageAntd, Splitter } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { stepListItemsDeclaration } from './config';
import './index.css';

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

const PANEL_SIZE_LIMIT = 200;
const SIZE_REFERENCE_MIN = 70;
const SIZE_PROFILEVAULT_MIN = 200;
const SIZE_PILOT_MIN = 70;

function CaseDetailContent() {
  const searchParams = useSearchParams();
  const caseId = decodeURIComponent(searchParams.get('caseId') || '');

  const SIZE_REFERENCE_DEFAULT = useRef(0);
  const SIZE_PROFILEVAULT_DEFAULT = useRef(0);
  const SIZE_PILOT_DEFAULT = useRef(0);

  const sizeReferenceRef = useRef(0);
  const sizePilotRef = useRef(0);

  const cancelRef = useRef<null | (() => void)>(null);
  const workflowDefinitionIdRef = useRef<string>('');

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);

  const [isTransitionAll, setTransitionAll] = useState<boolean>(false);
  const [sizeReference, setSizeReference] = useState<number>(0);
  const [sizeProfileVault, setSizeProfileVault] = useState<number>(0);
  const [sizePilot, setSizePilot] = useState<number>(0);

  const [caseInfo, setCaseInfo] = useState<ICaseItemType | null>(null);
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListItems, setStepListItems] = useState<IWorkflowStepType[]>([]);

  const [isModalInstallExtensionOpen, setModalInstallExtensionOpen] =
    useState<boolean>(false);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);

  const { userInfo } = useUserStore();

  const isFoldReference = useMemo(() => {
    return sizeReference <= PANEL_SIZE_LIMIT;
  }, [sizeReference]);

  const isFoldProfileVault = useMemo(() => {
    return sizeProfileVault <= PANEL_SIZE_LIMIT;
  }, [sizeProfileVault]);

  const isFoldPilot = useMemo(() => {
    return sizePilot <= PANEL_SIZE_LIMIT;
  }, [sizePilot]);

  const { emit } = useEventManager('ginkgoo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;

    switch (typeMsg) {
      case 'ginkgoo-background-all-case-update': {
        const { steps: stepsMsg, pilotStatus: pilotStatusMsg } = pilotInfoMsg || {};

        setPilotInfo(pilotInfoMsg);
        if (stepsMsg?.length > 0) {
          setStepListItems(stepsMsg.concat(stepListItemsDeclaration));
        }
        if (pilotStatusMsg === PilotStatusEnum.START) {
          setModalNewWorkflowOpen(false);
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
      case 'ginkgoo-background-all-toast': {
        const { typeToast, contentToast } = message || {};
        messageAntd.open({
          type: typeToast,
          content: contentToast,
        });
        console.log('ginkgoo-background-all-toast', typeToast, contentToast);

        break;
      }
      case 'ginkgoo-background-all-case-error': {
        const { content } = message || {};
        if (content) {
          messageAntd.open({
            content,
            type: 'error',
          });
        }
        // setPilotMode(PilotModeEnum.READY);
        break;
      }
      default: {
        break;
      }
    }
  });

  const refreshCaseDetail = async () => {
    const resCaseDetail = await queryCaseDetail({
      caseId,
    });
    setCaseInfo(parseCaseInfo(resCaseDetail));
  };

  const refreshWorkflowDefinitions = async () => {
    const resWorkflowDefinitions = await getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      workflowDefinitionIdRef.current = item.workflow_definition_id;
    }
  };

  useEffectStrictMode(() => {
    SIZE_REFERENCE_DEFAULT.current = window.innerWidth * 0.2;
    SIZE_PROFILEVAULT_DEFAULT.current = window.innerWidth * 0.6;
    SIZE_PILOT_DEFAULT.current = window.innerWidth * 0.2;

    setSizeReference(SIZE_REFERENCE_DEFAULT.current);
    setSizeProfileVault(SIZE_PROFILEVAULT_DEFAULT.current);
    setSizePilot(SIZE_PILOT_DEFAULT.current);

    refreshCaseDetail();
    refreshWorkflowDefinitions();

    const regCaseStream = async () => {
      try {
        const { cancel, request } = await caseStream(
          { caseId },
          () => {
            // 可以立即获取到 controller
            // setRequestController({ cancel: () => controller.abort() });
          },
          async res => {
            refreshCaseDetail();
            console.log('🚀 ~ res:', res);
            // originalMessageLogRef.current = res;

            if (res.indexOf('event:documentStatusUpdate') === 0) {
              const dataStr = res.replace('event:documentStatusUpdate', '').trim();
              try {
                const data = JSON.parse(dataStr);
                emit({
                  type: 'event:documentStatusUpdate',
                  data,
                });
              } catch (error) {
                console.warn('[Debug] Error parse message', error);
              }
            }
          }
        );

        cancelRef.current = cancel;
        // await request;
      } catch (err: any) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          // Common Error
        } else {
          // Cancel Error
        }
      } finally {
        //
      }
    };

    regCaseStream();

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (cancelRef.current) {
        cancelRef.current?.();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    sizeReferenceRef.current = sizeReference;
  }, [sizeReference]);

  useEffect(() => {
    sizePilotRef.current = sizePilot;
  }, [sizePilot]);

  useEffect(() => {
    if (!caseInfo?.title) {
      return;
    }

    setBreadcrumbItems([
      breadcrumbItemsCasePortal,
      {
        title: caseInfo?.title, // `${title} - ${caseType}`
      },
    ]);
  }, [caseInfo]);

  if (!caseId) {
    UtilsManager.navigateBack();
    return null;
  }

  const handleSplitterResize = (sizes: number[]) => {
    // console.log('handleSplitterResize', sizes);
    const [left, mid, right] = sizes || [];

    setSizeReference(left);
    setSizeProfileVault(mid);
    setSizePilot(right);
  };

  const handleBtnPanelLeftClick = () => {
    let sizeReferenceTmp = 0;
    if (sizeReference > SIZE_REFERENCE_MIN) {
      sizeReferenceTmp = SIZE_REFERENCE_MIN;
    } else {
      sizeReferenceTmp = SIZE_REFERENCE_DEFAULT.current;
    }

    setTransitionAll(true);
    setTimeout(() => {
      setSizeReference(sizeReferenceTmp);
      setSizeProfileVault(window.innerWidth - sizeReferenceTmp - sizePilotRef.current);

      setTimeout(() => {
        setTransitionAll(false);
      }, 200);
    }, 60);
  };

  const handleBtnPanelRightClick = () => {
    let sizePilotTmp = 0;
    if (sizePilot > SIZE_PILOT_MIN) {
      sizePilotTmp = SIZE_PILOT_MIN;
    } else {
      sizePilotTmp = SIZE_PILOT_DEFAULT.current;
    }

    setTransitionAll(true);
    setTimeout(() => {
      setSizePilot(sizePilotTmp);
      setSizeProfileVault(window.innerWidth - sizeReferenceRef.current - sizePilotTmp);

      setTimeout(() => {
        setTransitionAll(false);
      }, 200);
    }, 60);
  };

  const handleWindowResize = () => {
    setSizeProfileVault(
      window.innerWidth - sizeReferenceRef.current - sizePilotRef.current
    );
  };

  const handleShowInstallExtension = () => {
    setModalInstallExtensionOpen(true);
  };

  const handleShowNewWorkflow = () => {
    setModalNewWorkflowOpen(true);
  };

  const handleNewWorkflowFinish = async (values: Record<string, string>) => {
    const { url } = values;

    if (!workflowDefinitionIdRef.current) {
      messageAntd.open({
        type: 'error',
        content: 'Missing required workflow definition ID.',
      });
      refreshWorkflowDefinitions();
      return;
    }

    // const url = "https://visas-immigration.service.gov.uk/next"; // test
    // const url = "https://www.gov.uk/skilled-worker-visa/apply-from-outside-the-uk"; // start
    // const url = "https://visas-immigration.service.gov.uk/resume/3a0bec84-a910-4f74-b4de-763b458e770e"; // return
    // const url = "https://apply-to-visit-or-stay-in-the-uk.homeoffice.gov.uk/SKILLED_WORK/3434-4632-5724-0670/"; // uk

    try {
      window.postMessage({
        type: 'ginkgoo-page-all-case-start',
        url,
        userId: userInfo?.id,
        caseId,
        workflowDefinitionId: workflowDefinitionIdRef.current,
      });
    } catch (error) {
      console.error('[Ginkgoo] Sidepanel handleCardClick error', error);
    }
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col h-0 case-detail-wrap">
      {/* Breadcrumb */}
      <div
        className={cn(
          'bg-background flex h-[50px] w-full items-center justify-between border-b px-4'
        )}
      >
        <div className="flex items-center gap-4">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>
        <div className="flex items-center gap-4">
          {!!caseInfo?.caseStatusForFront?.text && (
            <TagStatus
              colorBackground={caseInfo.caseStatusForFront?.colorBackground}
              colorText={caseInfo.caseStatusForFront?.colorText}
              text={caseInfo.caseStatusForFront?.text}
            />
          )}
        </div>
      </div>
      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-6 py-6">
        {sizeReference && sizeProfileVault && sizePilot ? (
          <Splitter
            lazy={false}
            style={{
              // borderRadius: '12px',
              gap: '12px',
            }}
            onResize={handleSplitterResize}
          >
            {/* Reference */}
            <Splitter.Panel
              min={SIZE_REFERENCE_MIN}
              size={sizeReference}
              className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                'transition-all': isTransitionAll,
              })}
            >
              <PanelReference
                caseId={caseId}
                caseInfo={caseInfo}
                isFold={isFoldReference}
                onBtnPanelLeftClick={handleBtnPanelLeftClick}
              />
            </Splitter.Panel>
            {/* Profile Vault */}
            <Splitter.Panel
              min={SIZE_PROFILEVAULT_MIN}
              size={sizeProfileVault}
              className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                'transition-all': isTransitionAll,
              })}
            >
              <PanelProfileVault
                caseInfo={caseInfo}
                pilotInfo={pilotInfo}
                isFold={isFoldProfileVault}
                onShowInstallExtension={handleShowInstallExtension}
                onShowNewWorkflow={handleShowNewWorkflow}
              />
            </Splitter.Panel>
            {/* Pilot */}
            {!!pilotInfo ? (
              <Splitter.Panel
                min={SIZE_PILOT_MIN}
                size={sizePilot}
                className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                  'transition-all': isTransitionAll,
                })}
              >
                <PanelPilot
                  caseInfo={caseInfo}
                  pilotInfo={pilotInfo}
                  stepListItems={stepListItems}
                  isFold={isFoldPilot}
                  onBtnPanelRightClick={handleBtnPanelRightClick}
                />
              </Splitter.Panel>
            ) : null}
          </Splitter>
        ) : null}
      </div>
      {/* isModalInstallExtension isModalNewWorkflow */}
      {/* Modal */}
      <ModalInstallExtension
        isOpen={isModalInstallExtensionOpen}
        onOpenUpdate={setModalInstallExtensionOpen}
      />
      <ModalNewWorkflow
        isOpen={isModalNewWorkflowOpen}
        onOpenUpdate={setModalNewWorkflowOpen}
        onFinish={handleNewWorkflowFinish}
      />
    </div>
  );
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CaseDetailContent />
    </Suspense>
  );
}
