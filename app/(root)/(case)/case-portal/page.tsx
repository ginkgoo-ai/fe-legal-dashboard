'use client';

import { TagStatus } from '@/components/case/tag-status';
import { Button } from '@/components/ui/button';
import UtilsManager from '@/customManager/UtilsManager';
import { parseCaseInfo } from '@/lib';
import { useUserStore } from '@/store/userStore';
import { ICaseItemType } from '@/types';
import { Card, Form, Input, Modal, Progress, Select } from 'antd';
import dayjs from 'dayjs';
import { ChevronDown, FilePenLine, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockCaseList, mockLayerTypeOptions, mockVisaTypeOptions } from './mock';

export default function CasePortalPage() {
  const router = useRouter();
  const { userInfo } = useUserStore();

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalCreateCaseOpen, setModalCreateCaseOpen] = useState<boolean>(false);

  const [arrVisaTypeOptions, setArrVisaTypeOptions] =
    useState<any[]>(mockLayerTypeOptions);
  const [arrLayerTypeOptions, setArrLayerTypeOptions] =
    useState<any[]>(mockVisaTypeOptions);

  useEffect(() => {
    setCaseList(
      mockCaseList.map(item => {
        return parseCaseInfo(item);
      })
    );

    setArrVisaTypeOptions(mockVisaTypeOptions);
    setArrLayerTypeOptions(mockLayerTypeOptions);
  }, []);

  const handleBtnCreateCaseClick = () => {
    setModalCreateCaseOpen(true);
  };

  const handleCardClick = (itemCase: ICaseItemType) => {
    router.push(
      UtilsManager.router2url('/case-detail', {
        caseId: itemCase.id,
      })
    );
  };

  const handleCreateCaseOk = () => {
    setModalCreateCaseOpen(false);
  };

  const handleCreateCaseCancel = () => {
    setModalCreateCaseOpen(false);
  };

  const handleFormFinish = (values: any) => {
    console.log('handleFormFinish', values);
  };

  return (
    <div className="flex h-0 w-full max-w-[var(--width-max)] flex-1 flex-col px-[var(--width-padding)]">
      <div className="flex flex-row justify-between items-center mt-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {userInfo?.name}! Let's streamline your visa applications
        </h1>

        <Button
          variant="default"
          className="!w-[106px] !h-[42px]"
          onClick={handleBtnCreateCaseClick}
        >
          New Case
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6 mt-[64px]">
        {caseList.map((itemCase, indexCase) => (
          <Card
            key={`case-${indexCase}`}
            hoverable
            style={{
              borderRadius: '12px',
            }}
            onClick={() => handleCardClick(itemCase)}
          >
            <div className="flex flex-col w-full h-[170px]">
              <div className="flex flex-row justify-between items-center w-full">
                <span className="text-base font-bold">{itemCase.caseName}</span>
                <TagStatus
                  colorBackground={itemCase.caseStatusForFront?.colorBackground}
                  colorText={itemCase.caseStatusForFront?.colorText}
                  text={itemCase.caseStatusForFront?.text}
                />
              </div>
              <div className="flex flex-row justify-start items-center w-full">
                <span className="text-base text-[#B5B5C3]">{itemCase.caseType}</span>
              </div>
              <div className="flex flex-col w-full mt-6">
                <span className="text-sm text-[#212121]">Progress</span>
                <Progress
                  className="mt-3.5"
                  percent={30}
                  strokeColor={itemCase.caseStatusForFront?.colorText}
                  trailColor={itemCase.caseStatusForFront?.colorBackground}
                />
              </div>
              <div className="flex-1 w-full"></div>
              <div className="flex flex-row justify-end items-center w-full">
                <span className="text-sm text-[#B5B5C3]">
                  Created at {dayjs(itemCase.createdAt).format('DD MMM YYYY')}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        title={<div className="text-2xl font-bold pb-6 box-border">Create New Case</div>}
        closable={{ 'aria-label': 'Custom Close Button' }}
        width={700}
        footer={null}
        open={isModalCreateCaseOpen}
        onOk={handleCreateCaseOk}
        onCancel={handleCreateCaseCancel}
      >
        <Form
          name="basic"
          layout="vertical"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{}}
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
              className="!px-5 mt-1"
              prefix={<User className="mr-3" size={24} />}
              placeholder="Type your client name"
            />
          </Form.Item>

          <Form.Item
            label="Visa Type"
            name="visaType"
            rules={[{ required: true, message: 'Please select visa type' }]}
          >
            <Select
              className="mt-1"
              prefix={<FilePenLine className="ml-2 mr-3 box-border" size={24} />}
              suffixIcon={
                <ChevronDown className="mr-2 box-border" size={24} color="#52525B" />
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
              className="mt-1"
              prefix={<FilePenLine className="ml-2 mr-3 box-border" size={24} />}
              suffixIcon={
                <ChevronDown className="mr-2 box-border" size={24} color="#52525B" />
              }
              placeholder="Select layer type"
              options={arrLayerTypeOptions}
            />
          </Form.Item>

          <Button variant="default" className="w-full h-[44px]" type="submit">
            Create Case
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
