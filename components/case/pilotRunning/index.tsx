import { memo } from 'react';

interface PilotRunningProps {}

function PurePilotRunning(props: PilotRunningProps) {
  const {} = props;

  return (
    <div className="relative flex flex-col overflow-hidden">
      <div className="relative mb-3.5 w-full h-[5.5rem] flex justify-center items-center overflow-hidden">
        <div className="absolute top-1/2 lef-1/2 -translate-1/2 w-full pd-[100%] animate-spin bg-linear-[25deg,#F2E0ED_5%,#E2EDEC_10%,#C9FAED_30%,#8C83E6_45%,#F4CEE4_75%,#DCC1E0_90%,teal]"></div>
        {/* <div className="absolute flex flex-row top-0.5 left-0.5 right-0.5 bottom-0.5 bg-white">
          <div>
            <IconAutoFill size={40} />
          </div>
        </div> */}
      </div>
    </div>
  );
}

export const PilotRunning = memo(PurePilotRunning);
