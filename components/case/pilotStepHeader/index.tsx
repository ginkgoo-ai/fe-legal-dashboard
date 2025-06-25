'use client';

import { Button } from '@/components/ui/button';
import {
  IconAutoFill,
  IconCompleted,
  IconInfo,
  IconPause,
  IconView,
} from '@/components/ui/icon';
import UtilsManager from '@/customManager/UtilsManager';
import { postFilesPDFHighlight } from '@/service/api/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { memo, MouseEventHandler } from 'react';
import './index.css';

interface PilotStepHeaderProps {
  pilotInfo: IPilotType | null;
  onBtnPauseClick: MouseEventHandler<HTMLButtonElement> | undefined;
}

function PurePilotStepHeader(props: PilotStepHeaderProps) {
  const { pilotInfo, onBtnPauseClick } = props;

  // const isRunning =
  //   !!pilotInfo &&
  //   [PilotStatusEnum.PAUSE, PilotStatusEnum.COMPLETED].includes(pilotInfo.pilotStatus);

  const handleBtnDownloadPdfClick = async () => {
    console.log('handleBtnDownloadPdfClick');
    if (!pilotInfo?.pilotWorkflowInfo?.progress_file_id) {
      return;
    }
    const resFilesPDFHighlight = await postFilesPDFHighlight({
      fileId: pilotInfo?.pilotWorkflowInfo?.progress_file_id || '',
      highlightData: pilotInfo?.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    console.log('handleBtnDownloadPdfClick', resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
      });
    }
  };

  // const handleBtnGotoOfficialClick = () => {
  //   console.log('handleBtnGotoOfficialClick');
  // };

  const handleBtnViewClick = () => {
    console.log('handleBtnViewClick');
    if (!!pilotInfo?.pilotTabInfo?.id) {
      const messageJump = {
        type: 'ginkgoo-page-background-tab-update',
        tabId: pilotInfo?.pilotTabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);
    }
  };

  const renderPilotStepHeaderCompleted = () => {
    return (
      <>
        <div className="absolute top-[50%] left-[50%] -translate-1/2 w-[200%] min-h-full pb-[100%] rounded-lg overflow-hidden bg-[#CAF4D0]"></div>
        <div className="relative w-full box-border p-0.5 bg-[rgba(0,0,0,0)]">
          <div className="flex flex-col bg-white rounded-lg overflow-hidden box-border p-3 gap-1.5 w-full">
            <div className="flex flex-row justify-between items-start gap-3">
              <div className="flex flex-[0_0_auto]">
                <IconCompleted size={40} />
              </div>
              <div className="flex flex-1 flex-col justify-start items-start w-0">
                <div className="flex flex-row items-center w-full">
                  <div className="text-[#1F2937] text-lg truncate flex-1">
                    Auto Form Fill Completed
                  </div>
                  <div className="flex flex-[0_0_auto] flex-row gap-3">
                    <div className="text-xs">
                      <span className="text-[#000000] font-bold">32</span>
                      <span className="text-[#4B5563]"> of 45 fields</span>
                    </div>
                    <div className="text-xs text-[#1AC654]">33%</div>
                  </div>
                </div>
                <div className="text-[#98A1B7] text-sm truncate w-full">
                  Ahmed Hassan - Skilled Worker Visa
                </div>
              </div>
            </div>
            <div className="flex flex-col bg-[#EEF4FF] box-border p-2.5 rounded-lg w-full">
              <div className="flex flex-row mt-2.5 mb-3.5">
                <div className="flex-[0_0_2.25rem] flex flex-row justify-center">
                  <IconInfo size={18} />
                </div>
                <div className="text-primary flex-1 flex flex-col text-sm">
                  <span>Ready for Your Final Check 🧐</span>
                  <span>
                    For the final steps, including review and official submission, please
                    visit the government website.
                  </span>
                </div>
              </div>
              <div className="border border-[#D8DFF5] border-dashed h-11 bg-white w-full flex flex-row justify-between items-center gap-1 px-1 rounded-xl">
                <Button
                  variant="ghost"
                  className="flex-[1_1_auto] w-0"
                  onClick={handleBtnDownloadPdfClick}
                >
                  <IconPause size={20} />
                  <span className="text-primary truncate">Download Complete PDF</span>
                </Button>

                <div className="w-0.5 h-3.5 flex-[0_0_auto] bg-[#CDA4F7]"></div>

                <Button
                  variant="ghost"
                  className="flex-[1_1_auto] w-0"
                  onClick={handleBtnViewClick}
                >
                  <IconView size={20} />
                  <span className="text-primary truncate">Inspect Current Step</span>
                  {/* <span className="text-primary truncate">Go to Official Submission Portal</span> */}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPilotStepHeaderRunning = () => {
    return (
      <>
        <div className="animate-spin-header absolute left-[50%] top-[50%] min-h-full w-[200%] overflow-hidden rounded-lg pb-[100%]"></div>
        <div className="relative w-full box-border p-0.5 bg-[rgba(0,0,0,0)]">
          <div className="flex flex-col bg-white rounded-lg overflow-hidden box-border p-3 gap-1.5 w-full">
            <div className="flex flex-row justify-between items-start gap-3">
              <div className="flex flex-[0_0_auto]">
                <IconAutoFill size={40} isSpin={false} />
              </div>
              <div className="flex flex-1 flex-col justify-start items-start w-0">
                <div className="flex flex-row items-center w-full">
                  <div className="text-[#1F2937] text-lg truncate flex-1">
                    Auto Form Filling...
                  </div>
                  <div className="flex flex-[0_0_auto] flex-row gap-3">
                    <div className="text-xs">
                      <span className="text-[#000000] font-bold">32</span>
                      <span className="text-[#4B5563]"> of 45 fields</span>
                    </div>
                    <div className="text-xs text-[#1AC654]">33%</div>
                  </div>
                </div>
                <div className="text-[#98A1B7] text-sm truncate w-full">
                  Ahmed Hassan - Skilled Worker Visa
                </div>
                <div className="flex flex-row justify-start items-center -ml-4 overflow-hidden w-full">
                  <Button
                    variant="ghost"
                    className="flex-[1_1_auto] w-0 max-w-fit"
                    onClick={onBtnPauseClick}
                  >
                    <IconPause size={20} />
                    <span className="text-primary truncate">Pause Automation</span>
                  </Button>

                  <div className="w-0.5 h-3.5 flex-[0_0_auto] bg-[#CDA4F7]"></div>

                  <Button
                    variant="ghost"
                    className="flex-[1_1_auto] w-0 max-w-fit"
                    onClick={handleBtnViewClick}
                  >
                    <IconView size={20} />
                    <span className="text-primary truncate">Inspect Current Step</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full flex justify-center items-center overflow-hidden rounded-lg flex-[0_0_auto]">
      {pilotInfo?.pilotStatus === PilotStatusEnum.COMPLETED
        ? renderPilotStepHeaderCompleted()
        : renderPilotStepHeaderRunning()}
    </div>
  );
}

export const PilotStepHeader = memo(PurePilotStepHeader);
