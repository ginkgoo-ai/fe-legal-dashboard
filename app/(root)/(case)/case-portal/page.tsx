'use client';

import { ModalCreateCase } from '@/components/case/modalCreateCase';
import { TagStatus } from '@/components/case/tagStatus';
import { Button } from '@/components/ui/button';
import UtilsManager from '@/customManager/UtilsManager';
import { parseCaseInfo } from '@/lib';
import { useUserStore } from '@/store/userStore';
import { ICaseItemType } from '@/types';
import { Card, Progress } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { mockCaseList } from './mock';

export default function CasePortalPage() {
  const router = useRouter();
  const { userInfo } = useUserStore();

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalCreateCaseOpen, setModalCreateCaseOpen] = useState<boolean>(false);

  useEffect(() => {
    setCaseList(
      mockCaseList.map(item => {
        return parseCaseInfo(item);
      })
    );
  }, []);

  const handleCardClick = (itemCase: ICaseItemType) => {
    router.push(
      UtilsManager.router2url('/case-detail', {
        caseId: itemCase.id,
      })
    );
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
          onClick={() => setModalCreateCaseOpen(true)}
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
                <span className="text-base font-bold">{itemCase.title}</span>
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

      {/* Modal Create */}
      <ModalCreateCase
        isOpen={isModalCreateCaseOpen}
        onOpenUpdate={setModalCreateCaseOpen}
      />
    </div>
  );
}
