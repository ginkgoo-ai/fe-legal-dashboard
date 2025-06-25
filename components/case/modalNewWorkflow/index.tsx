'use client';

import { IconFormItemLink } from '@/components/ui/icon';
import { useEventManager } from '@/hooks/useEventManager';
import { Button, Form, Input, Modal, message as messageAntd } from 'antd';
import { memo, useEffect, useState } from 'react';

interface ModalNewWorkflowProps {
  isOpen: boolean;
  pageTabInfo: Record<string, unknown>;
  onOpenUpdate: (value: boolean) => void;
  onFinish: (values: Record<string, string>) => void;
}

function PureModalNewWorkflow(props: ModalNewWorkflowProps) {
  const { isOpen = false, pageTabInfo, onOpenUpdate, onFinish } = props;

  const [loadingContinue, setLoadingContinue] = useState<boolean>(false);
  const [isShowLoginTip, setShowLoginTip] = useState<boolean>(false);

  useEventManager('ginkgoo-message', message => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case 'ginkgoo-background-all-auth-check': {
        const { value: valueMsg } = message;

        setShowLoginTip(!valueMsg);
        setLoadingContinue(false);
        break;
      }
      case 'ginkgoo-background-all-pilot-no-match-page': {
        const { typeToast, contentToast } = message || {};
        messageAntd.open({
          type: typeToast,
          content: contentToast,
        });
        setLoadingContinue(false);

        break;
      }
      default: {
        break;
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingContinue(false);

      window.postMessage(
        {
          type: 'ginkgoo-page-background-auth-check',
        },
        window.location.origin
      );
    }
  }, [isOpen]);

  const handleNewWorkflowCancel = () => {
    onOpenUpdate?.(false);
  };

  const handleFormFinish = (values: any) => {
    if (isShowLoginTip) {
      handleBtnLoginClick();
      return;
    }
    setLoadingContinue(true);
    onFinish?.(values);
  };

  const handleBtnLoginClick = () => {
    window.postMessage(
      {
        type: 'ginkgoo-page-background-sidepanel-open',
        options: {
          tabId: pageTabInfo?.id,
        },
      },
      window.location.origin
    );
  };

  return (
    <Modal
      title={<div className="box-border pb-6 text-xl font-bold">URL</div>}
      closable={false}
      width={500}
      footer={null}
      open={isOpen}
      keyboard={false}
      destroyOnHidden
      forceRender
      // onOk={handleCreateCaseOk}
      onCancel={handleNewWorkflowCancel}
    >
      {isOpen && (
        <Form
          name="new-workflow"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{}}
          requiredMark={false}
          onFinish={handleFormFinish}
          autoComplete="off"
        >
          <div className="mb-4 text-sm text-[#1A1A1AB2]">
            Enter the URL below. Please keep the target page open for the auto-fill to
            work.
          </div>

          <Form.Item
            label="URL"
            name="url"
            className="mb-4"
            validateTrigger="onSubmit"
            validateFirst={true}
            rules={[
              { required: true, message: 'Please input URL' },
              { type: 'url', message: 'Please input a valid URL' },
              // {
              //   validator: (_, value) => {
              //     if (!value) return Promise.resolve();
              //     try {
              //       // 使用URL构造函数校验
              //       new URL(value);
              //       return Promise.resolve();
              //     } catch (e) {
              //       return Promise.reject(new Error("Please enter a valid URL"));
              //     }
              //   },
              // },
            ]}
          >
            <Input
              className="!px-3"
              autoFocus
              prefix={<IconFormItemLink className="mr-1" size={20} />}
              placeholder="URL"
            />
          </Form.Item>

          {isShowLoginTip ? (
            <div className="mb-4 text-sm text-[#1A1A1AB2]">
              <span>Please </span>
              <span
                className="cursor-pointer text-blue-700 underline"
                onClick={handleBtnLoginClick}
              >
                log in
              </span>
              <span> to the extension to activate the auto-fill feature.</span>
            </div>
          ) : null}

          <div className="flex flex-row items-center justify-between gap-6">
            <Button
              type="default"
              className="!h-[44px] flex-1"
              onClick={handleNewWorkflowCancel}
            >
              <span className="font-bold">Cancel</span>
            </Button>
            <Button
              type="primary"
              className="!h-[44px] flex-1"
              loading={loadingContinue}
              htmlType="submit"
            >
              <span className="font-bold">Continue</span>
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}

export const ModalNewWorkflow = memo(PureModalNewWorkflow);
