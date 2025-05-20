'use client';

import { TagCaseStatus } from '@/components/case/tag-case-status';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import UtilsManager from '@/customManager/UtilsManager';
import { useUserStore } from '@/store/userStore';
import { CaseStatusEnum } from '@/types/case';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ICaseItemType {
  id: string;
  title: string;
  caseName: string;
  caseType: string;
  status: CaseStatusEnum;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | null;
}

export default function CasePortalPage() {
  const router = useRouter();
  const { userInfo } = useUserStore();

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalCreateCaseOpen, setModalCreateCaseOpen] = useState<boolean>(false);

  useEffect(() => {
    setCaseList([
      {
        id: '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0',
        title: '知识产权案例（已更新）',
        caseName: 'Ahmed Hassan',
        caseType: 'Skilled Worker Visa',
        description: '这是一个更新后的知识产权侵权案例描述',
        profileId: 'profile-123',
        clientId: null,
        status: CaseStatusEnum.ANALYZING,
        startDate: null,
        endDate: null,
        clientName: null,
        profileName: null,
        createdAt: '2025-05-19T09:34:05',
        updatedAt: '2025-05-19T09:34:49',
        documentsCount: 2,
        eventsCount: 0,
      },
      {
        id: '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0',
        title: '知识产权案例（已更新）',
        caseName: 'Ahmed Hassan',
        caseType: 'Skilled Worker Visa',
        description: '这是一个更新后的知识产权侵权案例描述',
        profileId: 'profile-123',
        clientId: null,
        status: CaseStatusEnum.ANALYZING,
        startDate: null,
        endDate: null,
        clientName: null,
        profileName: null,
        createdAt: '2025-05-19T09:34:05',
        updatedAt: '2025-05-19T09:34:49',
        documentsCount: 2,
        eventsCount: 0,
      },
      {
        id: '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0',
        title: '知识产权案例（已更新）',
        caseName: 'Ahmed Hassan',
        caseType: 'Skilled Worker Visa',
        description: '这是一个更新后的知识产权侵权案例描述',
        profileId: 'profile-123',
        clientId: null,
        status: CaseStatusEnum.ANALYZING,
        startDate: null,
        endDate: null,
        clientName: null,
        profileName: null,
        createdAt: '2025-05-19T09:34:05',
        updatedAt: '2025-05-19T09:34:49',
        documentsCount: 2,
        eventsCount: 0,
      },
      {
        id: '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0',
        title: '知识产权案例（已更新）',
        caseName: 'Ahmed Hassan',
        caseType: 'Skilled Worker Visa',
        description: '这是一个更新后的知识产权侵权案例描述',
        profileId: 'profile-123',
        clientId: null,
        status: CaseStatusEnum.ANALYZING,
        startDate: null,
        endDate: null,
        clientName: null,
        profileName: null,
        createdAt: '2025-05-19T09:34:05',
        updatedAt: '2025-05-19T09:34:49',
        documentsCount: 2,
        eventsCount: 0,
      },
    ]);
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

  return (
    <Dialog>
      <div className="flex h-0 w-full max-w-[var(--width-max)] flex-1 flex-col px-[var(--width-padding)]">
        <div className="flex flex-row justify-between items-center mt-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {userInfo?.name}! Let's streamline your visa applications
          </h1>

          {/* <ButtonAntd
            type="primary"
            className="!w-[106px] !h-[42px]"
            onClick={handleBtnCreateCaseClick}
          >
            New Case
          </ButtonAntd> */}
          <DialogTrigger asChild>
            <Button variant="outline">New Case</Button>
          </DialogTrigger>
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
                  <TagCaseStatus status={itemCase.status} />
                </div>
                <div className="flex flex-row justify-start items-center w-full">
                  <span className="text-base text-[#B5B5C3]">{itemCase.caseType}</span>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>111</div>
            <div>222</div>
            <div>333</div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
}
