'use client';

import { Button } from '@/components/ui/button';
import { IActionItemType } from '@/types/case';
import { IWorkflowStepDataFormDataType } from '@/types/casePilot';
import { Checkbox, Form, Input, Radio, Select } from 'antd';
import { memo, useRef } from 'react';
import './index.css';

interface PilotStepBodyNormalInterruptProps {
  formDataNormal: IWorkflowStepDataFormDataType[];
  stepKey: string;
  indexStep: number;
  onContinueFilling: (params: { actionlistPre: IActionItemType[] }) => void;
}

function PurePilotStepBodyNormalInterrupt(props: PilotStepBodyNormalInterruptProps) {
  const { formDataNormal, stepKey, indexStep, onContinueFilling } = props;
  const formRef = useRef<any>(null);

  const handleFormFinish = (values: any) => {
    // console.log("handleFormFinish", values);

    const actionlistPre: IActionItemType[] = formDataNormal
      .map((itemQuestion, indexQuestion) => {
        const { type: typeQuestion, selector: selectorQuestion } =
          itemQuestion?.question?.answer || {};

        switch (typeQuestion?.toLocaleLowerCase()) {
          case 'input': {
            return {
              selector: selectorQuestion,
              type: 'input',
              value: values[`question-${indexQuestion}-${indexStep}`] || '',
            };
          }
          case 'select': {
            return {
              selector: selectorQuestion,
              type: 'input',
              value: values[`question-${indexQuestion}-${indexStep}`] || '',
            };
          }
          case 'radio': {
            return {
              selector: values[`question-${indexQuestion}-${indexStep}`] || '',
              type: 'click',
            };
          }
          case 'checkbox': {
            return values[`question-${indexQuestion}-${indexStep}`]?.map(
              (itemCheckBoxValue: string) => {
                return {
                  selector: itemCheckBoxValue,
                  type: 'click',
                };
              }
            );
          }
          default: {
            return null;
          }
        }
      })
      .flat(Infinity)
      .filter(itemAction => {
        if (!itemAction?.selector) {
          return false;
        }
        if (itemAction?.type === 'input' && !itemAction?.value) {
          return false;
        }
        return true;
      });

    onContinueFilling?.({ actionlistPre });

    // form reset
    formRef.current?.resetFields();
  };

  return (
    <Form
      ref={formRef}
      className="pilot-step-body-form-wrap"
      name={stepKey}
      layout="vertical"
      size="small"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      requiredMark={false}
      onFinish={handleFormFinish}
      autoComplete="off"
    >
      {formDataNormal?.map((itemQuestion, indexQuestion) => {
        const typeQuestion =
          itemQuestion?.question?.answer?.type?.toLocaleLowerCase() || '';

        if (!(itemQuestion?.question?.answer?.data?.length > 0)) {
          return null;
        }

        return (
          <Form.Item
            key={`pilot-step-body-form-${indexQuestion}`}
            label={
              <div className="w-full truncate">{itemQuestion.question.data.name}</div>
            }
            name={`question-${indexQuestion}-${indexStep}`}
            // rules={[{ required: true, message: "This field is required." }]}
          >
            {
              {
                input: (
                  <div className="flex flex-col">
                    <Input />
                  </div>
                ),
                select: (
                  <Select
                    options={itemQuestion?.question?.answer?.data?.map(itemAnswer => {
                      return { value: itemAnswer.value, label: itemAnswer.name };
                    })}
                  />
                ),
                radio: (
                  <Radio.Group className="flex flex-col">
                    {itemQuestion?.question?.answer?.data?.map(
                      (itemAnswer, indexAnswer) => {
                        return (
                          <Radio
                            key={`pilot-step-body-form-${indexStep}-${indexQuestion}-${indexAnswer}`}
                            value={itemAnswer.selector}
                          >
                            {itemAnswer.name}
                            {/* {itemAnswer.value} */}
                          </Radio>
                        );
                      }
                    )}
                  </Radio.Group>
                ),
                checkbox: (
                  <Checkbox.Group className="flex flex-col">
                    {itemQuestion?.question?.answer?.data?.map(
                      (itemAnswer, indexAnswer) => {
                        return (
                          <Checkbox
                            key={`pilot-step-body-form-${indexStep}-${indexQuestion}-${indexAnswer}`}
                            value={itemAnswer.selector}
                          >
                            {itemAnswer.name}
                          </Checkbox>
                        );
                      }
                    )}
                  </Checkbox.Group>
                ),
              }[typeQuestion]
            }
          </Form.Item>
        );
      })}

      <Button
        variant="ghost"
        className="border-primary -mt-4 h-9 w-full border border-solid"
        type="submit"
      >
        <span className="text-primary truncate">Sync & Continue Filling</span>
      </Button>
    </Form>
  );
}

export const PilotStepBodyNormalInterrupt = memo(PurePilotStepBodyNormalInterrupt);
