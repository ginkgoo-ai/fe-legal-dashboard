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
import { stepListItemsDeclaration } from './config';
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
          className={cn('flex flex-row justify-between items-center gap-3 w-full', {
            'border-bottom': !isSelect,
          })}
        >
          <div className="flex flex-row gap-3.5 flex-1 w-0">
            <div className="flex flex-row w-4 h-6 flex-[0_0_auto] justify-center items-center">
              {itemStep.step_key === 'Declaration' ? (
                <IconStepDeclaration size={16} />
              ) : (
                <>
                  {itemStep.status === 'DONE' ? (
                    <Check size={16} color="#00ff00" />
                  ) : null}
                  {itemStep.status === 'ACTIVE' ? (
                    <IconLoading size={16} className="animate-spin" />
                  ) : null}
                  {itemStep.status === 'PENDING' ? <IconStepDot size={16} /> : null}
                </>
              )}
            </div>
            <div className="flex-1 w-0 flex justify-start items-center gap-3">
              <div className="truncate">{itemStep.name}</div>
              {itemStep.step_key === 'Declaration' ? (
                <div className="flex-[0_0_auto] h-full text-xs mt-0.5 text-[#FF55CB] flex justify-center items-center">
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
      stepListItems.concat(stepListItemsDeclaration).map((item, index) => {
        return {
          key: item.step_key,
          label: renderStepLabel(item, index),
          showArrow: false,
          children: renderStepChildren(item, index),
        };
      })
    );
  }, [stepListItems]);

  // useEffect(() => {
  //   setStepListActiveKeyBody(prev => {
  //     const prevArray = Array.isArray(prev) ? prev : [prev];
  //     const strStepListCurrent = String(stepListCurrent);

  //     return prevArray.includes(strStepListCurrent)
  //       ? prevArray
  //       : [...prevArray, strStepListCurrent];
  //   });

  //   // setStepListCurrentBody(stepListCurrent);
  // }, [stepListCurrent]);

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
