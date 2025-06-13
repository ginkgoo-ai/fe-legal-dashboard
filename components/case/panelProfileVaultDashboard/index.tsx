import { Button } from '@/components/ui/button';
import { IconDashboard, IconFileUpload, IconInfo, IconList } from '@/components/ui/icon';
import { memo } from 'react';

function PurePanelProfileVaultDashboard() {
  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-2 items-center gap-4">
        <div className="rounded-lg border-dashed border-[#D8DFF5] border p-4 flex justify-between items-center gap-4 overflow-hidden">
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
        <div className="rounded-lg border-dashed border-[#D8DFF5] border p-4 flex justify-between items-center gap-4 overflow-hidden">
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
        <div className="col-span-2">
          <div className="w-full rounded-lg bg-[#EEF4FF] p-4">
            <div className="flex items-start justify-start gap-2 mb-2">
              <div className="pt-1">
                <IconInfo size={16} />
              </div>
              <p className="text-primary">
                <span className="text-base">
                  Information Processed: A Few Details Needed
                </span>{' '}
                <br /> We've analyzed your files! A few details are still missing. We can
                make a quick form for these items – you can complete it or send it to
                someone else.
              </p>
            </div>
            <Button
              variant={'outline'}
              className="bg-white w-full text-primary font-semibold border-dashed"
              size={'lg'}
            >
              <IconFileUpload size={24} />
              Add Missing Information
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PanelProfileVaultDashboard = memo(PurePanelProfileVaultDashboard);
