'use client';

import { ActionBar } from '@/components/case/actionBar';
import { CaseGrapherGround } from '@/components/case/caseGrapherGround';
import { ModalNewWorkflow } from '@/components/case/modalNewWorkflow';
import { PanelPilot } from '@/components/case/panelPilot';
import { PanelProfileVault } from '@/components/case/panelProfileVault';
import { PanelReference } from '@/components/case/panelReference';
import { PilotWorkflow } from '@/components/case/pilotWorkflow';
import { TagStatus } from '@/components/case/tagStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconBreadcrumbPilot,
  IconBreadcrumbPilotProfileVault,
  IconBreadcrumbReference,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import GlobalManager from '@/customManager/GlobalManager';
import UtilsManager from '@/customManager/UtilsManager';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { cn, parseCaseInfo } from '@/lib/utils';
import {
  caseStream,
  getProfileSchema,
  getWorkflowDefinitions,
  getWorkflowList,
  queryCaseDetail,
} from '@/service/api/case';
import { useCaseStore } from '@/store';
import { useExtensionsStore } from '@/store/extensionsStore';
import { useProfileStore } from '@/store/profileStore';
import { useUserStore } from '@/store/userStore';
import {
  IPilotType,
  IWorkflowType,
  PilotStatusEnum,
  WorkflowTypeEnum,
} from '@/types/casePilot';
import { message as messageAntd, Splitter } from 'antd';
import Breadcrumb, { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { debounce } from 'lodash';
import { Dot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

enum TypeRightPanelEnum {
  REFERENCE = 'REFERENCE',
  PROFILEVAULT = 'PROFILEVAULT',
  PILOT = 'PILOT',
}

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

function CaseDetailContent() {
  const searchParams = useSearchParams();
  const caseId = decodeURIComponent(searchParams.get('caseId') || '');

  const SIZE_SUMMARY_DEFAULT = useRef(0);
  const SIZE_RIGHT_PANEL_DEFAULT = useRef(0);
  const sizePilotRef = useRef(0);

  const cancelRef = useRef<null | (() => void)>(null);
  const lastActionBarHeight = useRef<number | null>(null);

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);
  const [pageTabInfo, setPageTabInfo] = useState<Record<string, unknown>>({});

  const [isTransition, setTransition] = useState<boolean>(false);
  const [isShowRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [sizeSummary, setSizeSummary] = useState<number>(0);
  const [pbSummary, setPBSummary] = useState<number>(0);
  const [sizeRightPanel, setSizeRightPanel] = useState<number>(0);
  const [typeRightPanel, setTypeRightPanel] = useState<TypeRightPanelEnum | null>(null);

  const [workflowDefinitionId, setWorkflowDefinitionId] = useState<string>('');
  const [pilotInfoCurrent, setPilotInfoCurrent] = useState<IPilotType | null>(null);
  const [workflowList, setWorkflowList] = useStateCallback<IWorkflowType[]>([]);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);
  const [isLoadingQueryWorkflowList, setLoadingQueryWorkflowList] =
    useState<boolean>(true);

  const workflowInfoForTest = useMemo(() => {
    const workflowId = workflowList[0]?.workflow_instance_id; // replace real workflow id
    return workflowList.find(item => {
      return item.workflow_instance_id === workflowId;
    });
  }, [workflowList]);

  const { extensionsInfo } = useExtensionsStore();

  const { setCaseInfo, caseInfo } = useCaseStore();
  const { userInfo } = useUserStore();
  const { setSchema } = useProfileStore();

  useEventManager('ginkgoo-extensions', async message => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case 'ginkgoo-background-all-tab-query': {
        const { value: valueMsg } = message;

        setPageTabInfo(valueMsg);
        break;
      }
      case 'ginkgoo-background-all-pilot-update':
      case 'ginkgoo-background-all-pilot-done': {
        console.log('ginkgoo-background-all-pilot-update', message);
        const { pilotInfo: pilotInfoMsg } = message;
        const {
          pilotStatus: pilotStatusMsg,
          pilotCaseInfo: pilotCaseInfoMsg,
          pilotWorkflowInfo: pilotWorkflowInfoMsg,
        } = pilotInfoMsg || {};
        const { id: caseIdMsg } = pilotCaseInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        if (caseIdMsg !== caseId || !pilotCaseInfoMsg) {
          break;
        }

        if (pilotStatusMsg === PilotStatusEnum.START) {
          refreshWorkflowList({
            // cb: () => {
            //   window.postMessage({
            //     type: 'ginkgoo-page-background-pilot-query',
            //     workflowId: workflowIdMsg,
            //   });
            // },
          });
          break;
        }

        if (!!workflowIdMsg) {
          setModalNewWorkflowOpen(false);
          setPilotInfoCurrent(pilotInfoMsg);
        }
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
      case 'ginkgoo-background-all-sidepanel-mounted': {
        console.log('CaseDetailContent ginkgoo-background-all-sidepanel-mounted');
        break;
      }
      case 'ginkgoo-background-all-sidepanel-destory': {
        console.log('CaseDetailContent ginkgoo-background-all-sidepanel-destory');
        break;
      }
      default: {
        break;
      }
    }
  });

  useEventManager('ginkgoo-case', async message => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case 'update-case-detail': {
        refreshCaseDetail();
        break;
      }
      default: {
        break;
      }
    }
  });

  const { emit: emitSSE } = useEventManager('ginkgoo-sse', () => {});

  const refreshCaseDetail = async () => {
    const resCaseDetail = await queryCaseDetail({
      caseId,
    });

    if (resCaseDetail?.id) {
      setCaseInfo(parseCaseInfo(resCaseDetail));
      return;
    }

    messageAntd.open({
      type: 'error',
      content: MESSAGE.TOAST_REFRESH_CASE_DETAIL_FAILED,
    });
  };

  const refreshWorkflowDefinitions = async () => {
    const resWorkflowDefinitions = await getWorkflowDefinitions({
      page: 1,
      page_size: 1,
      workflow_type: WorkflowTypeEnum.VISA,
    });

    if (resWorkflowDefinitions?.items?.length > 0) {
      const item = resWorkflowDefinitions?.items[0];
      setWorkflowDefinitionId(item.workflow_definition_id);
      return;
    }

    messageAntd.open({
      type: 'error',
      content: MESSAGE.TOAST_REFRESH_WORKFLOW_DEFINITIONS_FAILED,
    });
  };

  const refreshWorkflowList = async (params?: { cb?: () => void }) => {
    const { cb } = params || {};
    const resWorkflowList = await getWorkflowList({
      userId: userInfo?.id || '',
      caseId: caseId || '',
    });

    if (resWorkflowList?.length >= 0) {
      setWorkflowList(resWorkflowList, () => {
        setLoadingQueryWorkflowList(false);
        cb?.();
      });

      return;
    }

    messageAntd.open({
      type: 'error',
      content: MESSAGE.TOAST_REFRESH_WORKFLOW_LIST_FAILED,
    });
  };

  const getProfileVaultSchema = async () => {
    try {
      const res = await getProfileSchema(caseId);
      setSchema(res);
    } catch (error) {
      console.error('Error fetching profile schema:', error);
    }
  };

  const init = async () => {
    SIZE_SUMMARY_DEFAULT.current = window.innerWidth * 0.7;
    SIZE_RIGHT_PANEL_DEFAULT.current = window.innerWidth * 0.3;

    setTypeRightPanel(null);
    setShowRightPanel(false);
    setSizeSummary(window.innerWidth);
    setSizeRightPanel(SIZE_RIGHT_PANEL_DEFAULT.current);

    await refreshCaseDetail();
    getProfileVaultSchema();
    refreshWorkflowDefinitions();
    refreshWorkflowList({
      cb: () => {
        window.postMessage({
          type: 'ginkgoo-page-background-pilot-query',
        });
      },
    });

    const regCaseStream = async () => {
      try {
        const { cancel } = await caseStream(
          { caseId },
          () => {
            // 可以立即获取到 controller
            // setRequestController({ cancel: () => controller.abort() });
          },
          async res => {
            const [resType, resData] = res?.split('\n') || [];

            console.log('🚀 ~ res:', res);
            // const eventTypes = [
            //   'event:connected',
            //   'event:init',
            //   'event:initialData',
            //   'event:conversationMessage',
            //   'event:documentUploadCompleted',
            // ];

            const parseAndEmitEvent = (eventPrefix: string) => {
              const dataStr = resData.trim();
              try {
                const data = JSON.parse(dataStr);
                emitSSE({
                  type: eventPrefix,
                  data,
                });
              } catch (error) {
                console.warn('[Debug] Error parse message', error);
              }
            };

            if (resType === 'event:documentStatusUpdate') {
              refreshCaseDetail();
              parseAndEmitEvent('event:documentStatusUpdate');
            } else {
              parseAndEmitEvent(resType);
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

    window.postMessage(
      {
        type: 'ginkgoo-page-background-tab-query',
      },
      window.location.origin
    );

    window.addEventListener('resize', handleWindowResize);
  };

  useEffectStrictMode(() => {
    init();

    return () => {
      if (cancelRef.current) {
        cancelRef.current?.();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    sizePilotRef.current = sizeRightPanel;
  }, [sizeRightPanel]);

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

  const selectTypeRightPanel = async (value: TypeRightPanelEnum | null) => {
    const isSelect = typeRightPanel !== value;
    setTransition(true);

    if (!!typeRightPanel) {
      setShowRightPanel(false);
      // await UtilsManager.sleep(200);
      setTimeout(() => {
        setTypeRightPanel(null);
      }, 200);
    }

    if (isSelect) {
      setTimeout(
        () => {
          setTypeRightPanel(value);
          setTimeout(() => {
            setShowRightPanel(true);
            setTimeout(() => {
              setTransition(false);
            }, 200);
          }, 200);
        },
        !!typeRightPanel ? 200 : 0
      );
    } else {
      setTimeout(
        () => {
          setTransition(false);
        },
        !!typeRightPanel ? 400 : 200
      );
    }
  };

  const handleSplitterResize = (sizes: number[]) => {
    // console.log('handleSplitterResize', sizes);
    const [left, right] = sizes || [];

    setSizeSummary(left);
    if (typeof right === 'number' && right >= 0) {
      setSizeRightPanel(right);
    }
  };

  const handleWindowResize = () => {
    setSizeSummary(window.innerWidth - sizePilotRef.current);
  };

  // 使用防抖，避免频繁 setState
  const handleActionBarSizeChange = debounce((size: DOMRectReadOnly) => {
    const { height } = size || {};
    // 只在高度变化时才 setPBSummary
    console.log('handleActionBarSizeChange', size, height);
    if (lastActionBarHeight.current !== height) {
      setPBSummary(height + 100);
      lastActionBarHeight.current = height;
    }
  }, 100);

  const handleShowNewWorkflow = () => {
    if (
      extensionsInfo?.version !== '999.998.997' &&
      extensionsInfo?.version !== GlobalManager.versionExtension
    ) {
      messageAntd.open({
        type: 'warning',
        content: MESSAGE.TOAST_VERSION_MISMATCH,
      });
      UtilsManager.clickTagA({
        url: GlobalManager.urlInstallExtension,
      });
      return;
    }

    if (workflowDefinitionId) {
      setModalNewWorkflowOpen(true);
    } else {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
      });
      refreshWorkflowDefinitions();
    }
  };

  const handleNewWorkflowFinish = async () => {
    if (!workflowDefinitionId) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_WORKFLOW_DEFINITIONS_MISSING,
      });
      refreshWorkflowDefinitions();
      return;
    }

    try {
      window.postMessage({
        type: 'ginkgoo-page-all-pilot-start',
        isNewWorkflow: true,
        caseId,
        tabIdForPage: pageTabInfo?.id,
        workflowDefinitionId,
      });
    } catch (error) {
      console.error('[Ginkgoo] Sidepanel handleCardClick error', error);
    }
  };

  // const handleBtnContinueClick = async (params: { workflowId: string }) => {
  //   const { workflowId } = params || {};

  //   try {
  //     window.postMessage({
  //       type: 'ginkgoo-page-all-pilot-start',
  //       workflowId,
  //       caseId,
  //       tabIdForPage: pageTabInfo?.id,
  //     });
  //   } catch (error) {
  //     console.error('[Ginkgoo] Sidepanel handleCardClick error', error);
  //   }
  // };

  // const handleQueryWorkflowDetail = async (params: { workflowId: string }) => {
  //   const { workflowId } = params || {};

  //   const resWorkflowDetail = await getWorkflowDetail({
  //     workflowId,
  //   });

  //   if (!resWorkflowDetail?.workflow_instance_id) {
  //     messageAntd.open({
  //       type: 'error',
  //       content: MESSAGE.TOAST_REFRESH_WORKFLOW_DETAIL_FAILED,
  //     });
  //     return;
  //   }

  //   await LockManager.acquireLock(lockId);

  //   setPilotList(
  //     prev =>
  //       cloneDeep(
  //         produce(prev, draft => {
  //           const indexPilot = draft.findIndex(item => {
  //             return (
  //               item?.pilotWorkflowInfo?.workflow_instance_id ===
  //               resWorkflowDetail?.workflow_instance_id
  //             );
  //           });
  //           if (indexPilot >= 0) {
  //             draft[indexPilot].pilotWorkflowInfo = resWorkflowDetail;
  //           }
  //         })
  //       ),
  //     () => {
  //       LockManager.releaseLock(lockId);
  //     }
  //   );
  // };

  const handleBtnReferenceClick = () => {
    selectTypeRightPanel(TypeRightPanelEnum.REFERENCE);
  };

  const handleBtnCaseDetailClick = () => {
    selectTypeRightPanel(TypeRightPanelEnum.PROFILEVAULT);
  };

  const handleBtnPilotClick = () => {
    selectTypeRightPanel(TypeRightPanelEnum.PILOT);
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col h-0 case-detail-wrap">
      {/* Breadcrumb */}
      <div
        className={cn(
          'bg-transparent flex w-full items-center justify-between px-8 gap-4 py-4 border-b border-solid'
        )}
      >
        <div className="flex flex-row items-center gap-4">
          <Breadcrumb separator={<Dot />} items={breadcrumbItems} />
          {!!caseInfo?.caseStatusForFront?.text && (
            <TagStatus
              colorBackground={caseInfo.caseStatusForFront?.colorBackground}
              colorText={caseInfo.caseStatusForFront?.colorText}
              text={caseInfo.caseStatusForFront?.text}
            />
          )}
        </div>
        <div className="flex flex-row items-center gap-4">
          {/* Reference */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className={cn('w-9 h-9 flex-shrink-0 cursor-pointer', {
                'border-[3px] border-solid border-[#61A6FA]':
                  typeRightPanel === TypeRightPanelEnum.REFERENCE,
              })}
              onClick={handleBtnReferenceClick}
            >
              <IconBreadcrumbReference size={24} />
            </Button>
          </div>
          {/* Pilot */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className={cn('w-9 h-9 flex-shrink-0 cursor-pointer', {
                'border-[3px] border-solid border-[#61A6FA]':
                  typeRightPanel === TypeRightPanelEnum.PILOT,
              })}
              onClick={handleBtnPilotClick}
            >
              <IconBreadcrumbPilot size={24} />
            </Button>
          </div>
          {/* Case Detail */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className={cn('w-9 h-9 flex-shrink-0 cursor-pointer', {
                'border-[3px] border-solid border-[#61A6FA]':
                  typeRightPanel === TypeRightPanelEnum.PROFILEVAULT,
              })}
              onClick={handleBtnCaseDetailClick}
            >
              <IconBreadcrumbPilotProfileVault size={24} />
            </Button>

            {Number(caseInfo?.profileChecklist.missingFieldsCount) > 0 ? (
              <Badge
                className="absolute top-0 right-0 flex justify-center items-center -translate-y-1/2 translate-x-1/2 bg-[#EF4444] leading-[14px]"
                variant="small"
              >
                {caseInfo?.profileChecklist.missingFieldsCount}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-8 pt-[24px] bg-[#F2F3F7] dark:bg-background">
        <Splitter
          lazy={false}
          style={{
            // borderRadius: '12px',
            gap: '12px',
          }}
          onResize={handleSplitterResize}
        >
          {/* Summary */}
          <Splitter.Panel
            // resizable={false}
            size={sizeSummary}
            className={cn('relative rounded-2xl flex-col flex h-full', {
              'transition-all duration-200': isTransition,
            })}
          >
            <CaseGrapherGround caseInfo={caseInfo!} bottomPadding={pbSummary}>
              {/* Test */}
              {workflowInfoForTest ? (
                <PilotWorkflow
                  pageTabInfo={pageTabInfo}
                  caseInfo={caseInfo}
                  workflowInfo={workflowInfoForTest}
                  indexKey={`panel-summary-workflow-${0}`}
                  pilotInfoCurrent={pilotInfoCurrent}
                />
              ) : null}

              <ActionBar
                caseInfo={caseInfo}
                pilotInfoCurrent={pilotInfoCurrent}
                onSizeChange={handleActionBarSizeChange}
                onShowNewWorkflow={handleShowNewWorkflow}
              />
            </CaseGrapherGround>
          </Splitter.Panel>
          {/* RightPanel */}
          {!!typeRightPanel ? (
            <Splitter.Panel
              // resizable={false}
              size={sizeRightPanel}
              className={cn(
                'bg-panel-background relative rounded-2xl flex-col flex h-[calc(100%-24px)]',
                {
                  'transition-all duration-200': isTransition,
                  'opacity-0': !isShowRightPanel,
                  'opacity-100': isShowRightPanel,
                  'translate-x-2': !isShowRightPanel,
                  'translate-x-0': isShowRightPanel,
                }
              )}
            >
              {typeRightPanel === TypeRightPanelEnum.REFERENCE ? (
                <PanelReference
                  caseInfo={caseInfo}
                  isFold={false}
                  oBtnCloseClick={() => {
                    selectTypeRightPanel(null);
                  }}
                />
              ) : null}

              {typeRightPanel === TypeRightPanelEnum.PILOT ? (
                <PanelPilot
                  isLoadingQueryWorkflowList={isLoadingQueryWorkflowList}
                  pageTabInfo={pageTabInfo}
                  caseInfo={caseInfo}
                  pilotInfoCurrent={pilotInfoCurrent}
                  workflowList={workflowList}
                  onShowNewWorkflow={handleShowNewWorkflow}
                  oBtnCloseClick={() => {
                    selectTypeRightPanel(null);
                  }}
                />
              ) : null}

              {typeRightPanel === TypeRightPanelEnum.PROFILEVAULT ? (
                <PanelProfileVault
                  caseInfo={caseInfo}
                  isFold={false}
                  oBtnCloseClick={() => {
                    selectTypeRightPanel(null);
                  }}
                />
              ) : null}
            </Splitter.Panel>
          ) : null}
        </Splitter>
      </div>

      {/* isModalNewWorkflowOpen */}
      <ModalNewWorkflow
        isOpen={isModalNewWorkflowOpen}
        pageTabInfo={pageTabInfo}
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
