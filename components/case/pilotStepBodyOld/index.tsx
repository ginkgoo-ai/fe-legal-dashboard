'use client';

import { IActionItemType, ICaseItemType, IStepItemType } from '@/types/case';
import { StepProps, Steps, Tag, Tooltip } from 'antd';
import { memo, useEffect, useState } from 'react';

interface PurePilotStepBodyOldProps {
  caseInfo: ICaseItemType | null;
  stepListCurrent: number;
  stepListItems: IStepItemType[];
}

function PurePilotStepBodyOld(props: PurePilotStepBodyOldProps) {
  const { caseInfo, stepListCurrent, stepListItems } = props;

  const [stepListCurrentBody, setStepListCurrentBody] = useState<number>(0);
  const [stepListItemsBody, setStepListItemsBody] = useState<StepProps[]>([]);

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

  useEffect(() => {
    const calcStepList = (source: IStepItemType[] = []) => {
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
                items={itemStep.actionlist?.map((itemAction, indexAction) =>
                  calcActionItem(itemAction, indexStep, indexAction)
                )}
              />
            </div>
          ),
        };
      });

      return result;
    };

    setStepListCurrentBody(stepListCurrent);
    setStepListItemsBody(calcStepList(stepListItems));
  }, [caseInfo?.timestamp, stepListCurrent, stepListItems]);

  return (
    <div className="relative w-full flex justify-start items-center rounded-lg border border-[#D8DFF5] box-border p-2">
      <Steps
        direction="vertical"
        current={stepListCurrentBody}
        items={stepListItemsBody}
      />
    </div>
  );
}

export const PilotStepBodyOld = memo(PurePilotStepBodyOld);
