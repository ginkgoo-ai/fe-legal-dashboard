'use client';

import { PilotStepBody } from '@/components/case/pilotStepBody';
import { IconCompleted, IconIncompleted, IconLoading } from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import UtilsManager from '@/customManager/UtilsManager';
import { cn } from '@/lib/utils';
import { postFilesPDFHighlight } from '@/service/api/case';
import { ICaseItemType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Button, message as messageAntd, Progress } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ChevronRight, Download, Play } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

interface PilotWorkflowProps {
  pageTabInfo: Record<string, unknown>;
  caseInfo: ICaseItemType | null;
  pilotInfo: IPilotType;
  indexPilot: number;
  pilotInfoCurrent: IPilotType | null;
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
  onBtnContinueClick: (params: { workflowId: string }) => void;
}

dayjs.extend(utc);

function PurePilotWorkflow(props: PilotWorkflowProps) {
  const {
    pageTabInfo,
    caseInfo,
    pilotInfo,
    indexPilot,
    pilotInfoCurrent,
    onQueryWorkflowDetail,
    onBtnContinueClick,
  } = props;

  const isFoldInit = useRef<boolean>(true);

  const [isFold, setFold] = useState<boolean>(true);
  const [isDisableBtnDownload, setDisableBtnDownload] = useState<boolean>(true);
  const [isLoadingDownload, setLoadingDownload] = useState<boolean>(false);

  const isCurrentPilot = useMemo(() => {
    return (
      pilotInfo?.pilotWorkflowInfo?.workflow_instance_id ===
      pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id
    );
  }, [
    pilotInfo?.pilotWorkflowInfo?.workflow_instance_id,
    pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id,
  ]);

  const isShowBtnContinue = useMemo(() => {
    return (
      indexPilot === 0 &&
      !!pilotInfo?.pilotTabInfo?.id &&
      pilotInfo?.pilotStatus === PilotStatusEnum.HOLD
    );
  }, [pilotInfo, indexPilot]);

  const workflowUpdateTime = useMemo(() => {
    return dayjs
      .utc(pilotInfo.pilotWorkflowInfo?.updated_at)
      .local()
      .format('MMM DD, YYYY HH: mm');
  }, [pilotInfo.pilotWorkflowInfo?.updated_at]);

  useEffect(() => {
    setDisableBtnDownload(!pilotInfo.pilotWorkflowInfo?.progress_file_id);
  }, [pilotInfo.pilotWorkflowInfo?.progress_file_id]);

  useEffect(() => {
    const getIsInterrupt = () => {
      const indexCurrentStep: number = Number(
        pilotInfo?.pilotWorkflowInfo?.steps?.findIndex(itemStep => {
          return itemStep.step_key === pilotInfo.pilotWorkflowInfo?.current_step_key;
        })
      );

      if (!(indexCurrentStep >= 0)) {
        return;
      }

      const currentStep = pilotInfo?.pilotWorkflowInfo?.steps?.[indexCurrentStep];
      const isInterrupt = currentStep?.data?.form_data?.some(itemFormData => {
        return itemFormData.question.type === 'interrupt';
      });
      return isInterrupt;
    };

    if (
      isCurrentPilot &&
      pilotInfo?.pilotStatus === PilotStatusEnum.HOLD &&
      getIsInterrupt()
    ) {
      if (isFoldInit.current) {
        isFoldInit.current = false;
        setFold(false);
        window.document
          .getElementById(`workflow-item-${indexPilot}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      isFoldInit.current = true;
    }
  }, [pilotInfo, isCurrentPilot, indexPilot]);

  const handleHeaderClick = () => {
    if (isFold) {
      onQueryWorkflowDetail?.({
        workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || '',
      });
    }
    setFold(prev => {
      return !prev;
    });
  };

  const handleBtnPDFDownloadClick = async () => {
    setLoadingDownload(true);

    // Step1: Query workflow Detail

    // Step2: Get PDF blob
    const resFilesPDFHighlight = await postFilesPDFHighlight({
      fileId: pilotInfo.pilotWorkflowInfo?.progress_file_id || '',
      highlightData: pilotInfo.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    // Step3: Download PDF file
    console.log('handleBtnDownloadPdfClick', resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
        fileName: `${caseInfo?.clientName || ''}-${caseInfo?.visaType || ''}-${dayjs.utc(pilotInfo.pilotWorkflowInfo?.updated_at).local().format('YYYYMMDDHHmmss')}.pdf`,
      });
    } else {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_DOWNLOAD_PDF_FILE_FAILED,
      });
    }

    setTimeout(() => {
      setLoadingDownload(false);
    }, 200);
  };

  const handleBtnContinueClick = () => {
    onBtnContinueClick?.({
      workflowId: pilotInfo.pilotWorkflowInfo?.workflow_instance_id || '',
    });
  };

  return (
    <div
      id={`workflow-item-${indexPilot}`}
      className="relative w-full flex justify-center items-center overflow-hidden rounded-lg flex-[0_0_auto]"
    >
      <div
        className={cn(
          'absolute left-0 top-0 w-full h-full overflow-hidden rounded-lg pr-[800%] bg-[#E2E4E8]'
          // {
          //   'animate-spin-workflow':
          //     isCurrentPilot && pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
          // }
        )}
      ></div>
      <div className="relative w-full box-border p-0.5 bg-[rgba(0,0,0,0)] flex flex-col">
        <div className="flex flex-col w-full h-full box-border bg-[#ffffff] rounded-lg overflow-hidden p-3 gap-3">
          <div
            className="flex flex-row justify-between items-start gap-3 cursor-pointer"
            onClick={handleHeaderClick}
          >
            <div className="flex flex-[0_0_auto]">
              {pilotInfo.pilotWorkflowInfo?.status === 'COMPLETED_SUCCESS' ? (
                <IconCompleted size={40} />
              ) : (
                <IconIncompleted size={40} />
              )}
            </div>
            <div className="flex flex-col w-0 flex-1">
              <div className="flex flex-row items-center gap-1">
                {pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD ? (
                  <IconLoading size={16} className="animate-spin" />
                ) : null}
                <span
                  className={cn('w-full truncate text-sm text-[#4E4E4E]', {
                    'font-bold': pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
                  })}
                >
                  {/* {`${caseInfo?.clientName || ""}` + ` - ${caseInfo?.visaType || ""}` + ` - ${pilotInfo?.pilotStatus || ""}`} */}
                  {pilotInfo?.pilotStatus || '--'}
                </span>
              </div>
              <div className="w-full truncate text-sm font-bold text-[#2665FF]">
                {workflowUpdateTime}
              </div>
            </div>
            <div className="flex-[0_0_auto]">
              <ChevronRight
                size={20}
                className={cn('transition-all', {
                  'rotate-90': !isFold,
                })}
              />
            </div>
          </div>

          {Number(pilotInfo.pilotWorkflowInfo?.progress_percentage) >= 0 ? (
            <Progress
              percent={pilotInfo.pilotWorkflowInfo?.progress_percentage}
              showInfo={false}
            />
          ) : null}

          {!isFold ? (
            <PilotStepBody pageTabInfo={pageTabInfo} pilotInfo={pilotInfo} />
          ) : null}

          <div className="flex flex-row justify-between items-center gap-2 w-full">
            <Button
              id={`pilot-item-btn-download-${indexPilot}`}
              type="default"
              className="flex-1 w-0"
              disabled={isDisableBtnDownload}
              loading={isLoadingDownload}
              onClick={handleBtnPDFDownloadClick}
            >
              <Download size={20} />
              <div className="truncate">
                <span className="font-bold">Download</span>
                {!isShowBtnContinue ? <span className="font-bold"> PDF</span> : null}
              </div>
            </Button>
            {isShowBtnContinue ? (
              <Button
                id={`pilot-item-btn-continue-${indexPilot}`}
                type="default"
                className="flex-1 w-0"
                onClick={handleBtnContinueClick}
              >
                <Play size={20} />
                <div className="truncate">
                  <span className="font-bold">Continue</span>
                </div>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export const PilotWorkflow = memo(PurePilotWorkflow);
