'use client';

import { IconDashboard, IconList } from '@/components/ui/icon';
import { memo } from 'react';

function PurePanelProfileVaultDashboard() {
  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-2 items-center gap-4">
        <div className="rounded-lg border-dashed border-[#D8DFF5] border p-4 flex justify-between items-center gap-3 overflow-hidden">
          <IconDashboard size={48} className="size-12 flex-none text-primary" />
          <div className="text-[#757072] text-base">
            INFORMATION
            <br />
            COMPLETENESS
          </div>
          <div className="text-[#79829D] text-lg text-nowrap">
            <span className="text-3xl font-bold text-black">100</span> / 160
          </div>
          <div className="bg-green-200 rounded-lg w-fit py-2 text-green-500 px-4 font-semibold">
            {Math.ceil((100 / 160) * 100)}%
          </div>
        </div>
        <div className="rounded-lg border-dashed border-[#D8DFF5] border p-4 flex justify-between items-center gap-3 overflow-hidden">
          <IconList size={48} className="size-12 flex-none text-primary" />
          <div className="text-[#757072] text-base">
            REQUESTED
            <br />
            DOCUMENTS
          </div>
          <div className="text-[#79829D] text-lg text-nowrap">
            <span className="text-3xl font-bold text-black">100</span> / 160
          </div>
          <div>&nbsp;</div>
        </div>
      </div>
    </div>
  );
}

export const PanelProfileVaultDashboard = memo(PurePanelProfileVaultDashboard);
