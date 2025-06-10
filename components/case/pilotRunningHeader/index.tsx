import { Button } from '@/components/ui/button';
import { IconAutoFill, IconPause, IconView } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { memo, useState } from 'react';

interface PilotRunningHeaderProps {}

function PurePilotRunningHeader(props: PilotRunningHeaderProps) {
  const {} = props;

  const [isRunning, setRunning] = useState<boolean>(true);

  const handleBtnPauseClick = () => {
    setRunning(prev => {
      return !prev;
    });
  };

  return (
    <div className="relative w-full h-[5.5rem] flex justify-center items-center overflow-hidden rounded-lg flex-[0_0_auto]">
      <div
        className={cn(
          'absolute top-[50%] left-[50%] -translate-1/2 w-[200%] animate-spin pb-[100%] bg-linear-[125deg,#F2E0ED_5%,#E2EDEC_10%,#C9FAED_30%,#8C83E6_45%,#F4CEE4_75%,#DCC1E0_90%,teal] rounded-lg overflow-hidden',
          {
            'animate-spin': isRunning,
          }
        )}
      ></div>
      <div className="absolute flex flex-row top-0.5 left-0.5 right-0.5 bottom-0.5 bg-white rounded-lg overflow-hidden box-border p-3 gap-1.5">
        <div className="flex flex-[0_0_auto]">
          <IconAutoFill size={40} isSpin={false} />
        </div>
        <div className="flex flex-col flex-auto w-0">
          <div className="flex flex-row justify-between items-center gap-3">
            <div className="flex flex-1 flex-row gap-3 justify-start items-center w-0">
              <div className="text-[#1F2937] text-lg truncate">Auto Form Filling...</div>
              <div className="text-[#98A1B7] text-sm truncate">
                Ahmed Hassan - Skilled Worker Visa
              </div>
            </div>

            <div className="flex flex-[0_0_auto] flex-row gap-3">
              <div className="text-xs">
                <span className="text-[#000000] font-bold">32</span>
                <span className="text-[#4B5563]"> of 45 fields</span>
              </div>
              <div className="text-xs text-[#1AC654]">33%</div>
            </div>
          </div>
          <div className="flex flex-row justify-start items-center -ml-4 overflow-hidden">
            <Button
              variant="ghost"
              className="flex-[1_1_auto] w-0 max-w-fit"
              onClick={handleBtnPauseClick}
            >
              <IconPause size={20} />
              <span className="text-primary truncate">Pause Automation</span>
            </Button>

            <div className="w-0.5 h-3.5 flex-[0_0_auto] bg-[#CDA4F7]"></div>

            <Button variant="ghost" className="flex-[1_1_auto] w-0 max-w-fit">
              <IconView size={20} />
              <span className="text-primary truncate">Inspect Current Step</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PilotRunningHeader = memo(PurePilotRunningHeader);
