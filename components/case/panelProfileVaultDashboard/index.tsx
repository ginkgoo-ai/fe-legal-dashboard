'use client';

import { IconDashboard, IconList } from '@/components/ui/icon';
import { ICaseDocumentChecklistType, ICaseProfileChecklistType } from '@/types/case';
import { memo } from 'react';

type PurePanelProfileVaultDashboardProps = {
  documentChecklist: ICaseDocumentChecklistType;
  profileChecklist: ICaseProfileChecklistType;
} & React.HTMLAttributes<HTMLDivElement>;

function PurePanelProfileVaultDashboard(props: PurePanelProfileVaultDashboardProps) {
  const { documentChecklist, profileChecklist } = props;
  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-2 items-center gap-4">
        <div className="rounded-lg border-dashed border p-4 flex justify-start items-center gap-5 overflow-hidden">
          <IconDashboard size={48} className="size-12 flex-none text-primary" />
          <div className="text-[#757072] dark:text-[#aaa5a7]  text-base">
            INFORMATION <br /> COMPLETENESS
          </div>
          <span className="flex-1"></span>
          <div className="text-[#79829D] text-lg text-nowrap">
            <span className="text-3xl font-bold text-black dark:text-white">
              {profileChecklist.completedFields ?? 0}
            </span>{' '}
            / {profileChecklist.totalFields ?? 0}
          </div>
          <div className="bg-green-200 rounded-lg w-fit py-2 text-green-500 px-4 font-semibold">
            {profileChecklist.completionPercentage ?? 0}%
          </div>
        </div>
        <div className="rounded-lg border-dashed border p-4 flex justify-between items-center gap-5 overflow-hidden">
          <IconList size={48} className="size-12 flex-none text-primary" />
          <div className="text-[#757072] dark:text-[#aaa5a7] text-base">
            REQUESTED <br /> DOCUMENTS
          </div>
          <span className="flex-1"></span>
          <div className="text-[#79829D] text-lg text-nowrap">
            <span className="text-3xl font-bold text-black dark:text-white">
              {documentChecklist.uploadedDocuments ?? 0}
            </span>{' '}
            / {documentChecklist.totalRequiredDocuments ?? 0}
          </div>
          <div>&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

export const PanelProfileVaultDashboard = memo(PurePanelProfileVaultDashboard);
