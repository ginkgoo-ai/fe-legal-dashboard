'use client';

import { CardCase } from '@/components/case/cardCase';
import { ModalCreateCase } from '@/components/case/modalCreateCase';
import { Button } from '@/components/ui/button';
import { MESSAGE } from '@/config/message';
import UtilsManager from '@/customManager/UtilsManager';
import { parseCaseInfo } from '@/lib';
import { queryCaseList } from '@/service/api/case';
import { useUserStore } from '@/store/userStore';
import { ICaseItemType } from '@/types/case';
import { message as messageAntd } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CasePortalPage() {
  const router = useRouter();
  const { userInfo } = useUserStore();

  const [caseList, setCaseList] = useState<ICaseItemType[]>([]);
  const [isModalCreateCaseOpen, setModalCreateCaseOpen] = useState<boolean>(false);

  const init = async () => {
    const res = await queryCaseList();

    if (!res.content) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_REFRESH_CASE_LIST_FAILED,
      });
    }

    setCaseList(
      res.content.map(item => {
        return parseCaseInfo(item);
      })
    );
  };

  useEffect(() => {
    init();
  }, []);

  const handleCardClick = (itemCase: ICaseItemType) => {
    router.push(
      UtilsManager.router2url('/case-detail', {
        caseId: itemCase.id,
      })
    );
  };

  // const handleCardEditClick = (itemCase: ICaseItemType) => {
  //   console.log('handleCardEditClick', itemCase);
  // };

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
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-8 gap-y-6 mt-[64px] pb-8">
        {caseList.map((itemCase, indexCase) => (
          <CardCase
            key={`case-${indexCase}`}
            itemCase={itemCase}
            onCardClick={() => handleCardClick(itemCase)}
            // onCardEditClick={() => handleCardEditClick(itemCase)}
          />
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
