'use client';

// import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { ItemFile } from '@/components/common/itemFile';
import {
  IconFormItemClientName,
  IconFormItemLawyer,
  IconFormItemVisaType,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import UtilsManager from '@/customManager/UtilsManager';
import { createCase } from '@/service/api/case';
import { useUserStore } from '@/store/userStore';
import { IFileItemType } from '@/types/file';
import { Button, Form, Input, message as messageAntd, Modal, Select } from 'antd';
import { produce } from 'immer';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useState } from 'react';

interface ModalCreateCaseProps {
  isOpen: boolean;
  onOpenUpdate: (value: boolean) => void;
}

function PureModalCreateCase(props: ModalCreateCaseProps) {
  const { isOpen = false, onOpenUpdate } = props;

  const router = useRouter();

  const [arrVisaTypeOptions, setArrVisaTypeOptions] = useState<any[]>([]);
  const [arrLawyerTypeOptions, setArrLawyerTypeOptions] = useState<any[]>([]);

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
      setArrLawyerTypeOptions([
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
    const { clientName, visaType } = values || {};

    setLoadingSubmit(true);
    const resCreateCase = await createCase({
      clientName: clientName.trim(),
      visaType,
    });

    if (!resCreateCase?.id) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_CREATE_CASE_FAILED,
      });
      setLoadingSubmit(false);
      return;
    }

    // console.log('handleFormFinish', resCreateCase, document);

    // const newFiles = fileList.map((file: IFileItemType) => ({
    //   localId: uuid(),
    //   status: FileStatus.UPLOADING,
    //   localFile: file.localFile,
    // }));
    // const resUploadDocument = await uploadDocument({
    //   caseId: resCreateCase.id,
    //   files: newFiles.map((file: IFileItemType) => file.localFile!),
    // });

    setLoadingSubmit(false);

    // if (resUploadDocument?.acceptedDocuments) {
    router.push(
      UtilsManager.router2url('/case-detail', {
        caseId: resCreateCase.id,
      })
    );
    // } else {
    //   messageAntd.open({
    //     type: 'error',
    //     content: MESSAGE.TOAST_UPLOAD_FILE_FAILED,
    //   });
    // }

    // console.log('actionUploadFile', newFiles, resUploadDocument);
  };

  // const handleFileChange = (files: File[]) => {
  //   if (fileList.length + files?.length > 10) {
  //     messageAntd.open({
  //       type: 'error',
  //       content: MESSAGE.TOAST_UPLOAD_FILE_MAX,
  //     });
  //     return;
  //   }

  //   const newFiles = files.map(file => ({
  //     localId: uuid(),
  //     status: FileStatus.COMPLETED,
  //     localFile: file,
  //   }));

  //   setFileList(prev =>
  //     produce(prev, draft => {
  //       draft.push(...newFiles);
  //     })
  //   );
  // };

  // const handleFileError = (e: any) => {
  //   console.log('handleFileError', e);
  // };

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
            lawyer: 'self',
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
            label="Lawyer"
            name="lawyer"
            rules={[{ required: true, message: 'Please select lawyer' }]}
          >
            <Select
              prefix={<IconFormItemLawyer className="ml-0 mr-1 box-border" size={20} />}
              suffixIcon={
                <ChevronDown className="mr-0 box-border" size={20} color="#52525B" />
              }
              placeholder="Select lawyer type"
              options={arrLawyerTypeOptions}
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

          {/* <Form.Item
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
          </Form.Item> */}

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
