'use client';

import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { ItemFile } from '@/components/common/itemFile';
import {
  IconFormItemClientName,
  IconFormItemLayer,
  IconFormItemVisaType,
} from '@/components/ui/icon';
import UtilsManager from '@/customManager/UtilsManager';
import { createCase, uploadDocument } from '@/service/api/case';
import { useUserStore } from '@/store/userStore';
import { FileStatus, IFileItemType } from '@/types/file';
import { Button, Form, Input, message as messageAntd, Modal, Select } from 'antd';
import { produce } from 'immer';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

interface ModalCreateCaseProps {
  isOpen: boolean;
  onOpenUpdate: (value: boolean) => void;
}

function PureModalCreateCase(props: ModalCreateCaseProps) {
  const { isOpen = false, onOpenUpdate } = props;

  const router = useRouter();

  const [arrVisaTypeOptions, setArrVisaTypeOptions] = useState<any[]>([]);
  const [arrLayerTypeOptions, setArrLayerTypeOptions] = useState<any[]>([]);

  const [isLoadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  const { userInfo } = useUserStore();

  useEffect(() => {
    if (isOpen) {
      setFileList([]);
      setArrVisaTypeOptions([
        {
          value: 'SKILLED_WORKER',
          label: 'Skilled Worker Visa',
        },
      ]);
      setArrLayerTypeOptions([
        {
          value: 'self',
          label: userInfo?.name,
        },
      ]);
    }
  }, [isOpen, userInfo?.name]);

  const handleCreateCaseCancel = () => {
    onOpenUpdate?.(false);
  };

  const handleFormFinish = async (values: any) => {
    // console.log('handleFormFinish', values);
    const { clientName, visaType, document } = values || {};

    setLoadingSubmit(true);
    const resCreateCase = await createCase({
      clientName: clientName.trim(),
      visaType,
    });

    setTimeout(() => {
      setLoadingSubmit(false);
    }, 500);

    if (!resCreateCase?.id) {
      messageAntd.open({
        type: 'error',
        content: 'Create case failed.',
      });
      return;
    }

    // console.log('handleFormFinish', resCreateCase, document);

    const newFiles = document.map((file: File) => ({
      localId: uuid(),
      status: FileStatus.UPLOADING,
      localFile: file,
    }));
    uploadDocument({
      caseId: resCreateCase.id,
      files: newFiles.map((file: IFileItemType) => file.localFile!),
    });

    // console.log('actionUploadFile', newFiles, resUploadDocument);

    router.push(
      UtilsManager.router2url('/case-detail', {
        caseId: resCreateCase.id,
      })
    );
  };

  const handleFileChange = (files: File[]) => {
    const newFiles = files.map(file => ({
      localId: uuid(),
      status: FileStatus.DONE,
      localFile: file,
    }));

    setFileList(prev =>
      produce(prev, draft => {
        draft.push(...newFiles);
      })
    );
  };

  const handleFileError = (e: any) => {
    console.log('handleFileError', e);
  };

  const handleBtnFileDeleteClick = (index: number) => {
    setFileList(prev =>
      produce(prev, draft => {
        draft.splice(index, 1);
      })
    );
  };

  return (
    <Modal
      title={<div className="text-2xl font-bold pb-6 box-border">Create New Case</div>}
      closable={{ 'aria-label': 'Custom Close Button' }}
      width={700}
      footer={null}
      open={isOpen}
      keyboard={false}
      destroyOnHidden
      forceRender
      // onOk={handleCreateCaseOk}
      onCancel={handleCreateCaseCancel}
    >
      {isOpen && (
        <Form
          name="basic"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{
            visaType: 'SKILLED_WORKER',
            layer: 'self',
          }}
          requiredMark={false}
          onFinish={handleFormFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Client Name"
            name="clientName"
            rules={[{ required: true, message: 'Please input client name' }]}
          >
            <Input
              className="!px-3"
              prefix={<IconFormItemClientName className="mr-1" size={20} />}
              placeholder="Type your client name"
            />
          </Form.Item>

          <Form.Item
            label="Visa Type"
            name="visaType"
            rules={[{ required: true, message: 'Please select visa type' }]}
          >
            <Select
              prefix={<IconFormItemVisaType className="ml-0 mr-1 box-border" size={20} />}
              suffixIcon={
                <ChevronDown className="mr-0 box-border" size={20} color="#52525B" />
              }
              placeholder="Select visa type"
              options={arrVisaTypeOptions}
            />
          </Form.Item>

          <Form.Item
            label="Layer"
            name="layer"
            rules={[{ required: true, message: 'Please select layer' }]}
          >
            <Select
              prefix={<IconFormItemLayer className="ml-0 mr-1 box-border" size={20} />}
              suffixIcon={
                <ChevronDown className="mr-0 box-border" size={20} color="#52525B" />
              }
              placeholder="Select layer type"
              options={arrLayerTypeOptions}
            />
          </Form.Item>

          {/* <div className="flex flex-row justify-between items-center gap-5">
          <Form.Item
            className="flex-1"
            label="Application detail"
            name="email"
            rules={[{ required: true, message: 'Please input email' }]}
          >
            <Input
              className="!px-3"
              prefix={<IconFormItemEmail className="mr-1" size={20} />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            className="flex-1"
            label=" "
            name="password"
            rules={[{ required: true, message: 'Please input password' }]}
          >
            <Input.Password
              className="!px-3"
              prefix={<IconFormItemPassword className="mr-1" size={20} />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>
        </div> */}

          <Form.Item
            className="flex-1 !mt-3"
            label=""
            name="document"
            rules={[{ required: true, message: 'Please upload document' }]}
          >
            <FileUpload
              accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
              multiple
              maxSize={50}
              onChange={handleFileChange}
              onError={handleFileError}
              label="Click or drag a file to upload"
              subLabel=""
              triggerText=""
              hideUploadIcon
            />
          </Form.Item>

          {fileList.length > 0 ? (
            <div className="flex flex-col gap-4">
              {fileList.map((itemFile, indexFile) => {
                return (
                  <ItemFile
                    key={`create-case-item-${indexFile}`}
                    mode="CreateCase"
                    file={itemFile}
                    isFold={false}
                    onBtnDeleteClick={() => handleBtnFileDeleteClick(indexFile)}
                  />
                );
              })}
            </div>
          ) : null}

          <Button
            type="primary"
            className="w-full !h-[44px] mt-4"
            htmlType="submit"
            loading={isLoadingSubmit}
          >
            Create Case
          </Button>
        </Form>
      )}
    </Modal>
  );
}

export const ModalCreateCase = memo(PureModalCreateCase);
