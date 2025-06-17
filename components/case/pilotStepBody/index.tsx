'use client';

import { PilotStepBodyDeclaration } from '@/components/case/pilotStepBodyDeclaration';
import { PilotStepBodyForm } from '@/components/case/pilotStepBodyForm';
import { PilotStepBodyStep } from '@/components/case/pilotStepBodyStep';
import {
  IconLoading,
  IconStepDeclaration,
  IconStepDot,
  IconStepDown,
} from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { IPilotType, StepModeEnum } from '@/types/case';
import { IWorkflowStepType } from '@/types/casePilot';
import type { CollapseProps } from 'antd';
import { Collapse } from 'antd';
import { Check } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import './index.css';

interface PilotStepBodyProps {
  pilotInfo: IPilotType | null;
  stepListItems: IWorkflowStepType[];
  onCollapseChange: (key: string) => void;
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const { pilotInfo, stepListItems, onCollapseChange } = props;

  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string[]>([]);
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps['items']>([]);

  const handleCollapseChange = (key: string[]) => {
    // 找出 key 中比 stepListActiveKeyBody 多的元素
    const newKeys = key.filter(k => !stepListActiveKeyBody.includes(k));
    if (newKeys.length > 0) {
      // 如果有新增的 key，则调用 onCollapseChange
      onCollapseChange?.(newKeys[0]);
    }
    console.log('handleCollapseChange', key);
    setStepListActiveKeyBody(key);
  };

  // update collapse
  useEffect(() => {
    console.log('PurePilotStepBody', stepListItems);
    if (!stepListItems) {
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
                  ) : null}
                  {itemStep.status === 'ACTIVE' ? (
                    <IconLoading size={16} className="animate-spin" />
                  ) : null}
                  {itemStep.status === 'PENDING' ? <IconStepDot size={16} /> : null}
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
          <div className="flex-[0_0_auto]">
            <IconStepDown
              size={10}
              color={isSelect ? '#0061FD' : '#98A1B7'}
              className={cn('transition-all', {
                'rotate-180': isSelect,
              })}
            />
          </div>
        </div>
      );
    };

    const renderStepChildren = (itemStep: IWorkflowStepType, indexStep: number) => {
      if (itemStep.step_key !== 'Declaration' && !itemStep?.data) {
        return null;
      }

      let itemStepMode = StepModeEnum.ACTION;
      if (itemStep.step_key === 'Declaration') {
        itemStepMode = StepModeEnum.DECLARATION;
      } else {
        itemStepMode = StepModeEnum.FORM;
      }

      return (
        <div className="border-bottom">
          {{
            [StepModeEnum.ACTION]: (
              <PilotStepBodyStep itemStep={itemStep} indexStep={indexStep} />
            ),
            [StepModeEnum.FORM]: (
              <PilotStepBodyForm itemStep={itemStep} indexStep={indexStep} />
            ),
            [StepModeEnum.DECLARATION]: (
              <PilotStepBodyDeclaration pilotInfo={pilotInfo} />
            ),
          }[itemStepMode] || null}
        </div>
      );
    };

    setStepListItemsBody(
      stepListItems.map((item, index) => {
        return {
          key: item.step_key,
          label: renderStepLabel(item, index),
          showArrow: false,
          children: renderStepChildren(item, index),
        };
      })
    );
  }, [stepListItems]);

  return stepListItemsBody && stepListItemsBody.length > 0 ? (
    <div className="relative w-full flex justify-start items-center rounded-lg border border-[#D8DFF5] box-border p-2">
      <Collapse
        className="w-full"
        activeKey={stepListActiveKeyBody}
        ghost
        items={stepListItemsBody}
        onChange={handleCollapseChange}
      />
    </div>
  ) : null;
}

export const PilotStepBody = memo(PurePilotStepBody);
