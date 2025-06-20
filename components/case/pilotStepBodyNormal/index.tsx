'use client';

import { PilotStepBodyNormalInterrupt } from '@/components/case/pilotStepBodyNormalInterrupt';
import { PilotStepBodyNormalStep } from '@/components/case/pilotStepBodyNormalStep';
import { IActionItemType } from '@/types/case';
import { IWorkflowStepDataFormDataType, IWorkflowStepType } from '@/types/casePilot';
import { memo, useEffect, useState } from 'react';

interface PilotStepBodyNormalProps {
  itemStep: IWorkflowStepType;
  indexStep: number;
  onContinueFilling: (params: { actionlistPre: IActionItemType[] }) => void;
}

function PurePilotStepBodyNormal(props: PilotStepBodyNormalProps) {
  const { itemStep, indexStep, onContinueFilling } = props;

  const [formDataNormalStep, setFormDataNormalStep] = useState<
    IWorkflowStepDataFormDataType[]
  >([]);
  const [formDataNormalInterrupt, setFormDataNormalInterrupt] = useState<
    IWorkflowStepDataFormDataType[]
  >([]);

  useEffect(() => {
    const formDataNormalStepTmp: IWorkflowStepDataFormDataType[] = [];
    const formDataNormalInterruptTmp: IWorkflowStepDataFormDataType[] = [];

    itemStep.data?.form_data?.forEach(item => {
      if (item.question.type === 'interrupt') {
        formDataNormalInterruptTmp.push();
      } else {
        formDataNormalStepTmp.push();
      }
    });
    setFormDataNormalStep(formDataNormalStepTmp);
    setFormDataNormalInterrupt(formDataNormalInterruptTmp);
  }, [itemStep]);

  return (
    <div className="flex flex-col">
      <PilotStepBodyNormalStep
        formDataNormal={formDataNormalStep}
        indexStep={indexStep}
      />
      {formDataNormalInterrupt.length > 0 ? (
        <PilotStepBodyNormalInterrupt
          formDataNormal={formDataNormalInterrupt}
          stepKey={itemStep.step_key}
          indexStep={indexStep}
          onContinueFilling={onContinueFilling}
        />
      ) : null}
    </div>
  );
}

export const PilotStepBodyNormal = memo(PurePilotStepBodyNormal);
