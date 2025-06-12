import { Button } from '@/components/ui/button';
import {
  IconLoading,
  IconStepDeclaration,
  IconStepDot,
  IconStepDown,
} from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  IActionItemType,
  ICaseItemType,
  IPilotType,
  IStepItemType,
  StepModeEnum,
} from '@/types/case';
import type { CollapseProps } from 'antd';
import { Collapse, Steps, Tooltip } from 'antd';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useState } from 'react';
import './index.css';
import { mockStepListItems } from './mock';

interface PilotStepBodyProps {
  caseInfo: ICaseItemType | null;
  pilotInfo: IPilotType | null;
  stepListCurrent: number;
  stepListItems: IStepItemType[];
}

function PurePilotStepBody(props: PilotStepBodyProps) {
  const { caseInfo, pilotInfo, stepListCurrent, stepListItems } = props;

  const [stepListActiveKeyBody, setStepListActiveKeyBody] = useState<string[]>([]);
  const [stepListCurrentBody, setStepListCurrentBody] = useState<number>(3);
  const [stepListItemsBody, setStepListItemsBody] = useState<CollapseProps['items']>([]);

  const calcStepLabel = (itemStep: IStepItemType, indexStep: number) => {
    const isSelect = stepListActiveKeyBody.includes(String(indexStep));
    return (
      <div
        id={`step-item-${indexStep}`}
        className={cn('flex flex-row justify-between items-center gap-3', {
          'border-bottom': !isSelect,
        })}
      >
        <div className="flex flex-row gap-3.5 flex-1 w-0">
          <div className="flex flex-row w-4 h-6 flex-[0_0_auto] justify-center items-center">
            {itemStep.mode === StepModeEnum.DECLARATION ? (
              <IconStepDeclaration size={16} />
            ) : (
              <>
                {indexStep < stepListCurrentBody ? (
                  <Check size={16} color="#00ff00" />
                ) : null}
                {indexStep === stepListCurrentBody ? (
                  <IconLoading size={16} className="animate-spin" />
                ) : null}
                {indexStep > stepListCurrentBody ? <IconStepDot size={16} /> : null}
              </>
            )}
          </div>
          <div className="flex-1 w-0 truncate flex justify-start items-center gap-3">
            <span>{itemStep.title}</span>
            {itemStep.mode === StepModeEnum.DECLARATION ? (
              <span className="flex-[0_0_auto] h-full text-xs mt-0.5 text-[#FF55CB] flex justify-center items-center">
                Confirm Declaration
              </span>
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
          <Tooltip placement="top" title={selector} mouseEnterDelay={1}>
            <div className="flex-1 text-sm truncate text-[#B4B3B3]">{selector}</div>
          </Tooltip>
        </div>
      ),
      description: (
        <div className="flex w-full flex-col">
          <div className="flex flex-row text-sm gap-1 text-[#464E5F]">{type}</div>
        </div>
      ),
    };
  };

  const calcStepChildren = (itemStep: IStepItemType, indexStep: number) => {
    return (
      {
        [StepModeEnum.ACTION]: (
          <Steps
            className="border-bottom"
            progressDot
            direction="vertical"
            current={itemStep.actioncurrent}
            items={itemStep.actionlist.map((itemAction, indexAction) =>
              calcActionItem(itemAction, indexStep, indexAction)
            )}
          />
        ),
        [StepModeEnum.MANUAL]: null,
        [StepModeEnum.FORM]: null,
        [StepModeEnum.DECLARATION]: (
          <div className="flex flex-row gap-1 bg-[#FF97DF1A] rounded-xl box-border pt-5 pl-6">
            <div className="flex flex-col pb-2.5 box-border">
              <div className="text-sm font-[600] text-[#FF55CB]">
                Manual Input Required
              </div>
              <div className="text-xs font-[400] text-[#FF97DF]">
                To ensure full compliance with legal standards, your personal attention is
                required for specific items in this form. The system will now direct you
                to the relevant section for your manual input and confirmation.
              </div>
              <Button
                variant="ghost"
                className="self-end border-dashed border border-[#FF55CB] bg-[#FFFFFF] w-[160px] h-[44px] mt-4"
                onClick={handleBtnJumpClick}
              >
                <span className="text-[#FF55CB]">Proceed to Form</span>
              </Button>
            </div>
            <Image
              src="/imgDeclaration.webp"
              className="flex-[0_0_auto] !w-[111px] !h-[107px] justify-self-end self-end"
              alt="Declaration"
              width={111}
              height={107}
            />
          </div>
        ),
      }[itemStep.mode] || null
    );
  };

  const handleCollapseChange = (key: string[]) => {
    setStepListActiveKeyBody(key);
  };

  useEffect(() => {
    setStepListItemsBody(
      mockStepListItems.map((item, index) => {
        return {
          key: index,
          label: calcStepLabel(item, index),
          showArrow: false,
          children: calcStepChildren(item, index),
        };
      })
    );
  }, [caseInfo?.timestamp, stepListActiveKeyBody, stepListItems]);

  useEffect(() => {
    setStepListActiveKeyBody(prev => {
      const prevArray = Array.isArray(prev) ? prev : [prev];
      const strStepListCurrent = String(stepListCurrent);

      return prevArray.includes(strStepListCurrent)
        ? prevArray
        : [...prevArray, strStepListCurrent];
    });

    setStepListCurrentBody(stepListCurrent);
  }, [stepListCurrent]);

  const handleBtnJumpClick = async () => {
    if (!!pilotInfo?.tabInfo?.url) {
      const messageJump = {
        type: 'ginkgo-page-background-tab-update',
        tabId: pilotInfo?.tabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);

      const messageOpenSidepanel = {
        type: 'ginkgo-page-background-sidepanel-open',
        options: {
          tabId: pilotInfo?.tabInfo?.id,
        },
      };
      window.postMessage(messageOpenSidepanel, window.location.origin);
    }
  };

  return (
    <div className="relative w-full flex justify-start items-center rounded-lg border border-[#D8DFF5] box-border p-2">
      <Collapse
        className="w-full"
        activeKey={stepListActiveKeyBody}
        ghost
        items={stepListItemsBody}
        onChange={handleCollapseChange}
      />
    </div>
  );
}

export const PilotStepBody = memo(PurePilotStepBody);
