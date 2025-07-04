'use client';

import { ModalNewWorkflow } from '@/components/case/modalNewWorkflow';
import { PanelPilot } from '@/components/case/panelPilot';
import { PanelProfileVault } from '@/components/case/panelProfileVault';
import { PanelReference } from '@/components/case/panelReference';
import { TagStatus } from '@/components/case/tagStatus';
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
import { Breadcrumb, message as messageAntd, Splitter } from 'antd';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { Dot } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

const PANEL_SIZE_LIMIT = 200;
const SIZE_REFERENCE_MIN = 70;
// const SIZE_PROFILEVAULT_MIN = 200;
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

  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    breadcrumbItemsCasePortal,
  ]);
  const [pageTabInfo, setPageTabInfo] = useState<Record<string, unknown>>({});

  const [isTransitionAll, setTransitionAll] = useState<boolean>(false);
  const [sizeReference, setSizeReference] = useState<number>(0);
  const [sizeProfileVault, setSizeProfileVault] = useState<number>(0);
  const [sizePilot, setSizePilot] = useState<number>(0);
  const [isShowPilot, setShowPilot] = useState<boolean>(true);

  const [workflowDefinitionId, setWorkflowDefinitionId] = useState<string>('');
  const [pilotInfoCurrent, setPilotInfoCurrent] = useState<IPilotType | null>(null);
  const [pilotList, setPilotList] = useStateCallback<IPilotType[]>([]);
  const [isModalNewWorkflowOpen, setModalNewWorkflowOpen] = useState<boolean>(false);
  const [isLoadingQueryWorkflowList, setLoadingQueryWorkflowList] =
    useState<boolean>(true);

  const { setCaseInfo, caseInfo } = useCaseStore();
  const { userInfo } = useUserStore();
  const { setSchema } = useProfileStore();

  const isFoldReference = useMemo(() => {
    return sizeReference <= PANEL_SIZE_LIMIT;
  }, [sizeReference]);

  const lockId = 'pilot-workflow-list';

  const { emit } = useEventManager('ginkgoo-message', async message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

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
              const indexPilot = draft.findIndex(itemPilot => {
                return (
                  itemPilot?.pilotWorkflowInfo?.workflow_instance_id === workflowIdMsg
                );
              });

              console.log('ginkgoo-background-all-pilot-done', workflowIdMsg, indexPilot);

              if (indexPilot >= 0) {
                window.document
                  .getElementById(`workflow-item-btn-download-${indexPilot}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
      case 'update-case-detail': {
        refreshCaseDetail();
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

  const init = async () => {
    SIZE_REFERENCE_DEFAULT.current = SIZE_REFERENCE_MIN;
    SIZE_PROFILEVAULT_DEFAULT.current = window.innerWidth * 0.7;
    SIZE_PILOT_DEFAULT.current = window.innerWidth * 0.3 - SIZE_REFERENCE_MIN;

    setShowPilot(true);
    setSizeReference(SIZE_REFERENCE_DEFAULT.current);
    setSizeProfileVault(SIZE_PROFILEVAULT_DEFAULT.current);
    setSizePilot(SIZE_PILOT_DEFAULT.current);

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
                emit({
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
                emit({
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
    if (typeof right === 'number' && right >= 0) {
      setSizePilot(right);
    }
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

  const handleWindowResize = () => {
    setSizeProfileVault(
      window.innerWidth - sizeReferenceRef.current - sizePilotRef.current
    );
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
        caseInfo,
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

  const getProfileVaultSchema = async () => {
    try {
      const res = await getProfileSchema(caseId);
      setSchema(res);
    } catch (error) {
      console.error('Error fetching profile schema:', error);
    }
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col h-0 case-detail-wrap">
      {/* Breadcrumb */}
      <div
        className={cn('bg-background flex w-fit items-center justify-between px-8 gap-4')}
      >
        <div className="flex items-center gap-4">
          <Breadcrumb separator={<Dot />} items={breadcrumbItems} />
        </div>
        {!!caseInfo?.caseStatusForFront?.text && (
          <TagStatus
            colorBackground={caseInfo.caseStatusForFront?.colorBackground}
            colorText={caseInfo.caseStatusForFront?.colorText}
            text={caseInfo.caseStatusForFront?.text}
          />
        )}
      </div>
      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-4 py-6">
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
              className={cn('bg-[#F1F1F4] relative rounded-2xl flex-col flex h-full', {
                'transition-all': isTransitionAll,
              })}
            >
              <PanelReference
                caseId={caseId}
                isFold={isFoldReference}
                onBtnPanelLeftClick={handleBtnPanelLeftClick}
              />
            </Splitter.Panel>
            {/* Profile Vault */}
            <Splitter.Panel
              // min={SIZE_PROFILEVAULT_MIN}
              size={sizeProfileVault}
              className={cn(
                'bg-white relative rounded-2xl flex-col flex h-full', // min-w-[870px]
                {
                  'transition-all': isTransitionAll,
                }
              )}
            >
              <PanelProfileVault caseInfo={caseInfo} isFold={false} />
            </Splitter.Panel>
            {/* Pilot */}
            {isShowPilot ? (
              <Splitter.Panel
                min={SIZE_PILOT_MIN}
                size={sizePilot}
                className={cn('bg-white relative rounded-2xl flex-col flex h-full', {
                  'transition-all': isTransitionAll,
                })}
              >
                <PanelPilot
                  isLoadingQueryWorkflowList={isLoadingQueryWorkflowList}
                  pageTabInfo={pageTabInfo}
                  caseInfo={caseInfo}
                  pilotInfoCurrent={pilotInfoCurrent}
                  pilotList={pilotList}
                  onQueryWorkflowDetail={handleQueryWorkflowDetail}
                  onBtnContinueClick={handleBtnContinueClick}
                  onShowNewWorkflow={handleShowNewWorkflow}
                />
              </Splitter.Panel>
            ) : null}
          </Splitter>
        ) : null}
      </div>
      {/* isModalInstallExtension isModalNewWorkflow */}
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
