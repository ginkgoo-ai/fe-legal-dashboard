'use client';

import { PilotStepBodyDeclaration } from '@/components/case/pilotStepBodyDeclaration';
import { IconLoading, IconStepDeclaration, IconStepDot } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { IActionItemType } from '@/types/case';
import { IWorkflowStepType, IWorkflowType } from '@/types/casePilot';
import type { CollapseProps } from 'antd';
import { Collapse, Spin } from 'antd';
import { Check } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import './index.css';

interface PilotStepBodyProps {
  workflowInfo: IWorkflowType;
  isCurrentWorkflow: boolean;
  onCollapseChange?: (key: string) => void;
  onContinueFilling?: (params: { actionlistPre: IActionItemType[] }) => void;
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const { workflowInfo, isCurrentWorkflow, onCollapseChange, onContinueFilling } = props;

  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string[]>([]);
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps['items']>([]);

  const workflowSteps = useMemo(() => {
    let result: IWorkflowStepType[] | undefined = void 0;
    if (Number(workflowInfo?.pilotInfo?.steps?.length) > 0) {
      result = workflowInfo?.pilotInfo?.steps;
    } else if (Number(workflowInfo.steps?.length) > 0) {
      result = workflowInfo.steps;
    }

    return result;
  }, [workflowInfo]);

  const handleCollapseChange = (key: string[]) => {
    // 找出 key 中比 stepListActiveKeyBody 多的元素
    // const newKeys = key.filter(k => !stepListActiveKeyBody.includes(k));
    // if (newKeys.length > 0) {
    //   // 展开操作：如果有新增的 key, 且是可展开的项，则调用 onCollapseChange，并展开
    //   const newKey = newKeys[0];
    //   const newStep = workflowInfo?.steps?.find(item => {
    //     return (
    //       item.step_key === newKey &&
    //       ['ACTIVE', 'COMPLETED_SUCCESS'].includes(item.status)
    //     );
    //   });
    //   if (newStep) {
    //     onCollapseChange?.(newKey);
    //     setStepListActiveKeyBody(key);
    //   }
    // } else {
    //   // 收起操作
    //   setStepListActiveKeyBody(key);
    // }
    // setRefreshRenderTS(+dayjs());
  };

  const handleContinueFilling = (params: { actionlistPre: IActionItemType[] }) => {
    onContinueFilling?.(params);
  };

  // update collapse
  useEffect(() => {
    console.log('PilotStepBodyProps', workflowSteps);

    // console.log("PurePilotStepBody", stepListItems);
    if (!workflowSteps) {
      return;
    }

    const renderStepLabel = (itemStep: IWorkflowStepType, indexStep: number) => {
      const isSelect = stepListActiveKeyBody.includes(itemStep.step_key);
      return (
        <div
          id={`step-item-${indexStep}`}
          className={cn('flex w-full flex-row items-center justify-between gap-3', {
            'border-bottom': !isSelect,
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
                  ) : isCurrentWorkflow && itemStep.status === 'ACTIVE' ? (
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
      if (itemStep.step_key === 'Declaration') {
        return <PilotStepBodyDeclaration pilotInfo={workflowInfo.pilotInfo || null} />;
      }
      return null;

      // if (itemStep.step_key !== 'Declaration' && !itemStep?.data) {
      //   return null;
      // }

      // return (
      //   <div className="border-bottom">
      //     {itemStep.step_key === 'Declaration' ? (
      //       <PilotStepBodyDeclaration pilotInfo={workflowInfo.pilotInfo || null} />
      //     ) : (
      //       <PilotStepBodyNormal
      //         itemStep={itemStep}
      //         indexStep={indexStep}
      //         onContinueFilling={handleContinueFilling}
      //       />
      //     )}
      //   </div>
      // );
    };

    setStepListItemsBody(
      workflowSteps.map((item, index) => {
        return {
          key: item.step_key,
          label: renderStepLabel(item, index),
          showArrow: false,
          children: renderStepChildren(item, index),
        };
      })
    );
  }, [isCurrentWorkflow, workflowSteps?.length, onContinueFilling]);

  return stepListItemsBody && stepListItemsBody.length > 0 ? (
    <div className="relative box-border flex w-full items-center justify-start rounded-lg border border-[#D8DFF5] p-2">
      <Collapse
        className="w-full"
        activeKey={stepListActiveKeyBody}
        ghost
        items={stepListItemsBody}
        onChange={handleCollapseChange}
      />
    </div>
  ) : (
    <Spin tip="Loading" size="small">
      <div className="w-full h-20"></div>
    </Spin>
  );
}

export const PilotStepBody = memo(PurePilotStepBody);
