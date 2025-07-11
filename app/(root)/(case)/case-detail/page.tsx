'use client';

import { CaseGrapher } from '@/components/case/caseGrapher';
import { ModalNewWorkflow } from '@/components/case/modalNewWorkflow';
import { PanelPilot } from '@/components/case/panelPilot';
import { PanelProfileVault } from '@/components/case/panelProfileVault';
import { PanelProfileVaultDashboard } from '@/components/case/panelProfileVaultDashboard';
import { PanelReference } from '@/components/case/panelReference';
import { TagStatus } from '@/components/case/tagStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconBreadcrumbPilot,
  IconBreadcrumbPilotProfileVault,
  IconBreadcrumbReference,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import LockManager from '@/customManager/LockManager';
import UtilsManager from '@/customManager/UtilsManager';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { cn, parseCaseInfo } from '@/lib/utils';
import {
  caseStream,
  getProfileSchema,
  getWorkflowDefinitions,
  getWorkflowDetail,
  getWorkflowList,
  queryCaseDetail,
} from '@/service/api/case';
import { useCaseStore } from '@/store';
import { useProfileStore } from '@/store/profileStore';
import { useUserStore } from '@/store/userStore';
import { IPilotType, PilotStatusEnum, WorkflowTypeEnum } from '@/types/casePilot';
import { message as messageAntd, Splitter } from 'antd';
import Breadcrumb, { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { Dot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import './index.css';

export enum TypeRightPanelEnum {
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

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);
  const [pageTabInfo, setPageTabInfo] = useState<Record<string, unknown>>({});

  const [isTransition, setTransition] = useState<boolean>(false);
  const [sizeSummary, setSizeSummary] = useState<number>(0);
  const [sizeRightPanel, setSizeRightPanel] = useState<number>(0);
  const [typeRightPanel, setTypeRightPanel] = useState<TypeRightPanelEnum | null>(null);
  const [isShowRightPanel, setShowRightPanel] = useState<boolean>(false);

  const [workflowDefinitionId, setWorkflowDefinitionId] = useState<string>('');
  const [pilotInfoCurrent, setPilotInfoCurrent] = useState<IPilotType | null>(null);
  const [pilotList, setPilotList] = useStateCallback<IPilotType[]>([]);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);
  const [isLoadingQueryWorkflowList, setLoadingQueryWorkflowList] =
    useState<boolean>(true);

  const { setCaseInfo, caseInfo } = useCaseStore();
  const { userInfo } = useUserStore();
  const { setSchema } = useProfileStore();

  const lockId = 'pilot-workflow-list';

  useEventManager('ginkgoo-extensions', async message => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case 'ginkgoo-background-all-tab-query': {
        const { value: valueMsg } = message;

        setPageTabInfo(valueMsg);
        break;
      }
      case 'ginkgoo-background-all-pilot-update': {
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

        if (!!workflowIdMsg) {
          setModalNewWorkflowOpen(false);
          setPilotInfoCurrent(pilotInfoMsg);
        }

        if (pilotStatusMsg === PilotStatusEnum.START) {
          refreshWorkflowList({
            cb: () => {
              window.postMessage({
                type: 'ginkgoo-page-background-pilot-query',
                workflowId: workflowIdMsg,
              });
            },
          });
          break;
        }

        await LockManager.acquireLock(lockId);
        setPilotList(
          prev =>
            cloneDeep(
              produce(prev, draft => {
                const indexPilot = draft.findIndex(item => {
                  return item?.pilotWorkflowInfo?.workflow_instance_id === workflowIdMsg;
                });
                if (indexPilot >= 0) {
                  draft[indexPilot] = pilotInfoMsg;
                }
              })
            ),
          () => {
            LockManager.releaseLock(lockId);
          }
        );
        break;
      }
      case 'ginkgoo-background-all-pilot-done': {
        const { pilotInfo: pilotInfoMsg } = message;
        const { pilotWorkflowInfo: pilotWorkflowInfoMsg } = pilotInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        await LockManager.acquireLock(lockId);
        setPilotList(
          prev =>
            produce(prev, draft => {
              let indexPilot = -1;
              draft.forEach((itemDraft, indexDraft) => {
                if (
                  itemDraft?.pilotWorkflowInfo?.workflow_instance_id === workflowIdMsg
                ) {
                  indexPilot = indexDraft;
                }
                itemDraft.pilotStatus = PilotStatusEnum.HOLD;
              });

              console.log(
                'ginkgoo-background-all-pilot-done',
                workflowIdMsg,
                indexPilot,
                pilotInfoMsg
              );

              if (indexPilot >= 0) {
                // window.document
                //   .getElementById(`workflow-item-btn-download-${indexPilot}`)
                //   ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setPilotInfoCurrent(pilotInfoMsg);
                draft[indexPilot] = pilotInfoMsg;
              }
            }),
          () => {
            LockManager.releaseLock(lockId);
            setTimeout(() => {
              refreshWorkflowList();
            }, 200);
          }
        );

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
      await LockManager.acquireLock(lockId);
      setPilotList(
        prev => {
          return resWorkflowList?.map(itemNewWorkflow => {
            const oldPilot = prev.find(itemOld => {
              return (
                itemOld?.pilotWorkflowInfo?.workflow_instance_id ===
                itemNewWorkflow.workflow_instance_id
              );
            });

            return {
              pilotId: itemNewWorkflow.workflow_instance_id,
              pilotTimer: null,
              pilotTabInfo: {},
              pilotStatus: PilotStatusEnum.HOLD,
              pilotLastMessage: '',
              pilotRepeatHash: '',
              pilotRepeatCurrent: 0,
              pilotThirdPartUrl: '',
              pilotThirdPartMethod: '',
              pilotCookie: '',
              pilotCsrfToken: '',
              ...(oldPilot || {}),
              pilotCaseInfo: caseInfo,
              pilotWorkflowInfo: {
                ...oldPilot?.pilotWorkflowInfo,
                ...(itemNewWorkflow || {}),
              },
              // pilotRefreshTS: +dayjs(),
            };
          });
        },
        () => {
          LockManager.releaseLock(lockId);
          setLoadingQueryWorkflowList(false);
          cb?.();
        }
      );
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
            console.log('🚀 ~ res:', res);
            // originalMessageLogRef.current = res;

            if (res.indexOf('event:documentStatusUpdate') === 0) {
              refreshCaseDetail();

              const dataStr = res.replace('event:documentStatusUpdate', '').trim();
              try {
                const data = JSON.parse(dataStr);
                emitSSE({
                  type: 'event:documentStatusUpdate',
                  data,
                });
              } catch (error) {
                console.warn('[Debug] Error parse message', error);
              }
            } else if (res.indexOf('event:init') === 0) {
              const dataStr = res.replace('event:init', '').trim();
              try {
                const data = JSON.parse(dataStr);
                emitSSE({
                  type: 'event:init',
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

  // const handleBtnPanelLeftClick = () => {
  //   let sizeReferenceTmp = 0;
  //   if (sizeReference > SIZE_REFERENCE_MIN) {
  //     sizeReferenceTmp = SIZE_REFERENCE_MIN;
  //   } else {
  //     sizeReferenceTmp = SIZE_REFERENCE_DEFAULT.current;
  //   }

  //   setTransitionAll(true);
  //   setTimeout(() => {
  //     setSizeReference(sizeReferenceTmp);
  //     setSizeProfileVault(window.innerWidth - sizeReferenceTmp - sizePilotRef.current);

  //     setTimeout(() => {
  //       setTransitionAll(false);
  //     }, 200);
  //   }, 60);
  // };

  const handleWindowResize = () => {
    setSizeSummary(window.innerWidth - sizePilotRef.current);
  };

  const handleShowNewWorkflow = () => {
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
        workflowDefinitionId,
      });
    } catch (error) {
      console.error('[Ginkgoo] Sidepanel handleCardClick error', error);
    }
  };

  const handleBtnContinueClick = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};

    try {
      window.postMessage({
        type: 'ginkgoo-page-all-pilot-start',
        workflowId,
        caseId,
      });
    } catch (error) {
      console.error('[Ginkgoo] Sidepanel handleCardClick error', error);
    }
  };

  const handleQueryWorkflowDetail = async (params: { workflowId: string }) => {
    const { workflowId } = params || {};

    const resWorkflowDetail = await getWorkflowDetail({
      workflowId,
    });

    if (!resWorkflowDetail?.workflow_instance_id) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_REFRESH_WORKFLOW_DETAIL_FAILED,
      });
      return;
    }

    await LockManager.acquireLock(lockId);

    setPilotList(
      prev =>
        cloneDeep(
          produce(prev, draft => {
            const indexPilot = draft.findIndex(item => {
              return (
                item?.pilotWorkflowInfo?.workflow_instance_id ===
                resWorkflowDetail?.workflow_instance_id
              );
            });
            if (indexPilot >= 0) {
              draft[indexPilot].pilotWorkflowInfo = resWorkflowDetail;
            }
          })
        ),
      () => {
        LockManager.releaseLock(lockId);
      }
    );
  };

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
          'bg-transparent flex w-full items-center justify-between px-8 gap-4 py-4 '
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

            <Badge
              className="absolute top-0 right-0 flex justify-center items-center -translate-y-1/2 translate-x-1/2 bg-[#EF4444]"
              variant="small"
            >
              18
            </Badge>
          </div>
        </div>
      </div>
      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-8 pb-6">
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
            <div className="flex flex-col w-full gap-2">
              <PanelProfileVaultDashboard caseInfo={caseInfo!} />
              <CaseGrapher />
            </div>
          </Splitter.Panel>
          {/* RightPanel */}
          {!!typeRightPanel ? (
            <Splitter.Panel
              // resizable={false}
              size={sizeRightPanel}
              className={cn(
                'bg-panel-background relative rounded-2xl flex-col flex h-full',
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
                  caseId={caseId}
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
                  pilotList={pilotList}
                  onQueryWorkflowDetail={handleQueryWorkflowDetail}
                  onBtnContinueClick={handleBtnContinueClick}
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
