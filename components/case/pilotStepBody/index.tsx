'use client';

import {
  IconInfo,
  IconLoading,
  IconStepDeclaration,
  IconStepDot,
} from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { IActionItemType } from '@/types/case';
import { IPilotType, IWorkflowStepType, PilotStatusEnum } from '@/types/casePilot';
import type { CollapseProps } from 'antd';
import { Alert, Button, Collapse, Spin } from 'antd';
import { Check } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { PilotStepBodyNormal } from '../pilotStepBodyNormal';
import './index.css';

interface PilotStepBodyProps {
  pageTabInfo: Record<string, unknown>;
  pilotInfo: IPilotType;
  onCollapseChange?: (key: string) => void;
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const {
    pageTabInfo,
    pilotInfo,
    // onCollapseChange,
  } = props;

  const [isShowLoginTip, setShowLoginTip] = useState<boolean>(false);
  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string>('');
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps['items']>([]);

  useEventManager('ginkgoo-message', message => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case 'ginkgoo-background-all-auth-check': {
        const { value: valueMsg } = message;

        setShowLoginTip(!valueMsg);
        break;
      }
      default: {
        break;
      }
    }
  });

  const handleContinueFilling = useCallback(
    (params: { actionlistPre: IActionItemType[] }) => {
      const { actionlistPre } = params || {};

      if (isShowLoginTip) {
        window.postMessage(
          {
            type: 'ginkgoo-page-background-sidepanel-open',
            options: {
              tabId: pageTabInfo?.id,
            },
          },
          window.location.origin
        );
        return;
      }

      window.postMessage({
        type: 'ginkgoo-page-all-pilot-start',
        pilotId: pilotInfo?.pilotId,
        actionlistPre,
      });
    },
    [isShowLoginTip, pageTabInfo?.id, pilotInfo?.pilotId]
  );

  const handleBtnProceedToFormClick = () => {
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
  };

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
            <div className="flex w-0 flex-1 items-center justify-start gap-3">
              <div className="truncate">{itemStep.name}</div>
              {itemStep.step_key === 'Declaration' ? (
                <div className="mt-0.5 flex h-full flex-[0_0_auto] items-center justify-center text-xs text-[#FF55CB]">
                  Confirm Declaration
                </div>
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

    const renderStepChildren = (itemStep: IWorkflowStepType, indexStep: number) => {
      return (
        <div className="border-bottom">
          <PilotStepBodyNormal
            itemStep={itemStep}
            indexStep={indexStep}
            onContinueFilling={handleContinueFilling}
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
          children: renderStepChildren(itemStep, indexStep),
        };
      })
    );
  }, [pilotInfo, handleContinueFilling]);

  useEffect(() => {
    if (pilotInfo?.pilotStatus === PilotStatusEnum.HOLD) {
      const currentStep = pilotInfo?.pilotWorkflowInfo?.steps?.find(itemStep => {
        return itemStep.step_key === pilotInfo.pilotWorkflowInfo?.current_step_key;
      });
      const isInterrupt = currentStep?.data?.form_data?.some(itemFormData => {
        return itemFormData.question.type === 'interrupt';
      });

      console.log('xxx-0', pilotInfo.pilotWorkflowInfo);
      if (isInterrupt && pilotInfo.pilotWorkflowInfo?.current_step_key) {
        setStepListActiveKeyBody(pilotInfo.pilotWorkflowInfo?.current_step_key || '');
        setTimeout(() => {
          window.document
            .getElementById(`step-item-${pilotInfo?.pilotWorkflowInfo?.current_step_key}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        return;
      }
      console.log(
        'xxx-1',
        pilotInfo?.pilotStatus,
        isInterrupt,
        currentStep?.data?.form_data,
        pilotInfo.pilotWorkflowInfo?.current_step_key
      );
    }
    console.log('xxx-2', pilotInfo?.pilotStatus);
    setStepListActiveKeyBody('');
  }, [pilotInfo]);

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
