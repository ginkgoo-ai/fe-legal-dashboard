'use client';

import {
  IconInfo,
  IconLoading,
  IconStepDeclaration,
  IconStepDot,
} from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { IPilotType, IWorkflowStepType, PilotStatusEnum } from '@/types/casePilot';
import type { CollapseProps } from 'antd';
import { Alert, Button, Collapse, Spin, Tooltip } from 'antd';
import { Check } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { PilotStepBodyNormal } from '../pilotStepBodyNormal';
import './index.css';

interface PilotStepBodyProps {
  isCurrentPilot: boolean;
  pilotInfo: IPilotType | null;
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const {
    isCurrentPilot,
    pilotInfo,
    // onCollapseChange,
  } = props;

  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string>('');
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps['items']>([]);
  // const [percent, setPercent] = useState(0);

  // const handleContinueFilling = useCallback(
  //   (params: { actionlistPre: IActionItemType[] }) => {
  //     const { actionlistPre } = params || {};

  //     if (isShowLoginTip) {
  //       window.postMessage(
  //         {
  //           type: 'ginkgoo-page-background-sidepanel-open',
  //           options: {
  //             tabId: pageTabInfo?.id,
  //           },
  //         },
  //         window.location.origin
  //       );
  //       return;
  //     }

  //     window.postMessage({
  //       type: 'ginkgoo-page-all-pilot-start',
  //       workflowId: pilotInfo?.pilotWorkflowInfo?.workflow_instance_id,
  //       caseId,
  //       tabIdForPage: pageTabInfo?.id,
  //       actionlistPre,
  //     });
  //   },
  //   [
  //     isShowLoginTip,
  //     caseId,
  //     pageTabInfo?.id,
  //     pilotInfo?.pilotWorkflowInfo?.workflow_instance_id,
  //   ]
  // );

  const handleBtnProceedToFormClick = useCallback(() => {
    if (!!pilotInfo?.pilotTabInfo?.id) {
      const messageJump = {
        type: 'ginkgoo-page-background-tab-update',
        tabId: pilotInfo?.pilotTabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);

      const messageOpenSidepanel = {
        type: 'ginkgoo-page-background-sidepanel-open',
        options: {
          tabId: pilotInfo?.pilotTabInfo?.id,
        },
      };
      window.postMessage(messageOpenSidepanel, window.location.origin);
    }
  }, [pilotInfo?.pilotTabInfo?.id]);

  // update collapse
  useEffect(() => {
    // console.log('PilotStepBodyProps', pilotInfo?.pilotWorkflowInfo?.steps);
    if (!pilotInfo?.pilotWorkflowInfo?.steps) {
      return;
    }

    const renderStepLabel = (itemStep: IWorkflowStepType, indexStep: number) => {
      // const isSelect = stepListActiveKeyBody.includes(itemStep.step_key);
      return (
        <div
          id={`step-item-${itemStep.step_key}`}
          className={cn('flex w-full flex-row items-center justify-between gap-3', {
            'border-bottom':
              indexStep < Number(pilotInfo?.pilotWorkflowInfo?.steps?.length) - 1,
          })}
        >
          <div className="flex w-0 flex-1 flex-row gap-3.5">
            <div className="flex h-6 w-4 flex-[0_0_auto] flex-row items-center justify-center">
              {itemStep.step_key === 'Declaration' ? (
                <IconStepDeclaration size={16} />
              ) : (
                <>
                  {itemStep.status === 'COMPLETED_SUCCESS' ? (
                    <Check size={16} color="#00ff00" />
                  ) : pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD &&
                    itemStep.step_key ===
                      pilotInfo.pilotWorkflowInfo?.current_step_key ? (
                    <IconLoading size={16} className="animate-spin" />
                  ) : (
                    <IconStepDot size={16} />
                  )}
                </>
              )}
            </div>
            <div className="flex flex-row flex-1 items-center justify-between gap-3">
              <div className="truncate">{itemStep.name}</div>
              {Number(itemStep.data?.current_interrupt_questions?.length) > 0 &&
              pilotInfo?.pilotStatus === PilotStatusEnum.HOLD &&
              itemStep.step_key === pilotInfo.pilotWorkflowInfo?.current_step_key ? (
                <Tooltip
                  mouseEnterDelay={1}
                  title={() => {
                    return (
                      <div className="flex flex-col gap-1">
                        {itemStep.data?.current_interrupt_questions?.map(
                          (itemInterruptQuestions, indexInterruptQuestions) => {
                            return (
                              <div
                                key={`current-interrupt-questions-${itemStep.step_key}-${indexInterruptQuestions}`}
                              >
                                <div className="break-all text-xs">
                                  <span className="mr-1 font-bold">question:</span>
                                  <span className="">
                                    {itemInterruptQuestions.question_text}
                                  </span>
                                </div>
                                <div className="break-all text-xs">
                                  <span className="mr-1 font-bold">confidence:</span>
                                  <span className="">
                                    {itemInterruptQuestions.confidence}
                                  </span>
                                </div>
                                <div className="break-all text-xs">
                                  <span className="mr-1 font-bold">reasoning:</span>
                                  <span className="">
                                    {itemInterruptQuestions.reasoning}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    );
                  }}
                >
                  <div>
                    <IconInfo size={18} />
                  </div>
                </Tooltip>
              ) : null}
            </div>
          </div>
          {/* <div className="flex-[0_0_auto]">
            <IconStepDown
              size={10}
              color={isSelect ? '#0061FD' : '#98A1B7'}
              className={cn('transition-all', {
                'rotate-180': isSelect,
              })}
            />
          </div> */}
        </div>
      );
    };

    const renderStepChildren = (itemStep: IWorkflowStepType) => {
      return (
        <div className="border-bottom">
          <PilotStepBodyNormal
            itemStep={itemStep}
            onBtnProceedToFormClick={handleBtnProceedToFormClick}
          />
        </div>
      );
    };

    setStepListItemsBody(
      pilotInfo?.pilotWorkflowInfo?.steps?.map((itemStep, indexStep) => {
        return {
          key: itemStep.step_key,
          label: renderStepLabel(itemStep, indexStep),
          showArrow: false,
          children: renderStepChildren(itemStep),
        };
      })
    );
  }, [pilotInfo, handleBtnProceedToFormClick]);

  useEffect(() => {
    if (isCurrentPilot && Number(pilotInfo?.pilotWorkflowInfo?.steps?.length) > 0) {
      const indexCurrentStep: number = Number(
        pilotInfo?.pilotWorkflowInfo?.steps?.findIndex(itemStep => {
          return itemStep.step_key === pilotInfo.pilotWorkflowInfo?.current_step_key;
        })
      );

      if (!(indexCurrentStep >= 0)) {
        return;
      }

      const currentStep = pilotInfo?.pilotWorkflowInfo?.steps?.[indexCurrentStep];
      // const percentTmp =
      //   ((indexCurrentStep + 1) / Number(pilotInfo?.pilotWorkflowInfo?.steps?.length)) *
      //   100;
      // setPercent(percentTmp);

      if (pilotInfo?.pilotStatus === PilotStatusEnum.HOLD) {
        const isInterrupt = currentStep?.data?.form_data?.some(itemFormData => {
          return itemFormData.question.type === 'interrupt';
        });
        if (isInterrupt && pilotInfo.pilotWorkflowInfo?.current_step_key) {
          setStepListActiveKeyBody(pilotInfo.pilotWorkflowInfo?.current_step_key || '');
          setTimeout(() => {
            window.document
              .getElementById(
                `step-item-${pilotInfo?.pilotWorkflowInfo?.current_step_key}`
              )
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
          return;
        }
      }
    }

    setStepListActiveKeyBody('');
  }, [pilotInfo, isCurrentPilot]);

  return stepListItemsBody && stepListItemsBody.length > 0 ? (
    <div className="relative box-border flex flex-col w-full items-center justify-start rounded-lg border border-[#D8DFF5] p-2">
      <Collapse
        className="w-full"
        activeKey={stepListActiveKeyBody}
        ghost
        items={stepListItemsBody}
        // onChange={handleCollapseChange}
      />
      {pilotInfo?.pilotTabInfo?.id ? (
        <Alert
          style={{ width: '100%' }}
          message={<div className="text-[#075985] text-base">Manual Input Required</div>}
          icon={<IconInfo size={16} className="mt-1 mr-2" />}
          description={
            <div className="flex flex-col -ml-8 gap-2 items-start">
              <div className="text-[#0369A1] text-sm">
                To ensure full compliance with legal standards, your personal attention is
                required for specific items in this form. The system will now direct you
                to the relevant section for your manual input and confirmation.
              </div>
              <Button
                color="primary"
                variant="outlined"
                onClick={handleBtnProceedToFormClick}
              >
                Proceed to Form
              </Button>
            </div>
          }
          type="info"
          showIcon
          closable
        />
      ) : null}
    </div>
  ) : (
    <Spin tip="Loading" size="small">
      <div className="w-full h-20"></div>
    </Spin>
  );
}

export const PilotStepBody = memo(PurePilotStepBody);
