'use client';

import { Button } from '@/components/ui/button';
import { IPilotType } from '@/types/casePilot';
import Image from 'next/image';
import { memo, useCallback } from 'react';

interface PilotStepBodyDeclarationProps {
  pilotInfo: IPilotType | null;
}

function PurePilotStepBodyDeclaration(props: PilotStepBodyDeclarationProps) {
  const { pilotInfo } = props;

  const handleBtnJumpClick = useCallback(async () => {
    if (!!pilotInfo?.tabInfo?.id) {
      const messageJump = {
        type: 'ginkgoo-page-background-tab-update',
        tabId: pilotInfo?.tabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);

      const messageOpenSidepanel = {
        type: 'ginkgoo-page-background-sidepanel-open',
        options: {
          tabId: pilotInfo?.tabInfo?.id,
        },
      };
      window.postMessage(messageOpenSidepanel, window.location.origin);
    }
  }, [pilotInfo?.tabInfo?.id]);

  return (
    <div className="flex flex-row gap-1 bg-[#FF97DF1A] rounded-xl box-border pt-5 pl-6">
      <div className="flex flex-col pb-2.5 box-border">
        <div className="text-sm font-[600] text-[#FF55CB]">Manual Input Required</div>
        <div className="text-xs font-[400] text-[#FF97DF]">
          To ensure full compliance with legal standards, your personal attention is
          required for specific items in this form. The system will now direct you to the
          relevant section for your manual input and confirmation.
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
  );
}

export const PilotStepBodyDeclaration = memo(PurePilotStepBodyDeclaration);
