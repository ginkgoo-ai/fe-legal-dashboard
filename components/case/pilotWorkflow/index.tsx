'use client';

import { PilotStepBody } from '@/components/case/pilotStepBody';
import { IconCompleted, IconIncompleted } from '@/components/ui/icon';
import UtilsManager from '@/customManager/UtilsManager';
import { cn } from '@/lib/utils';
import { postFilesPDFHighlight } from '@/service/api/case';
import { ICaseItemType } from '@/types/case';
import { IWorkflowType } from '@/types/casePilot';
import { Button, message as messageAntd } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ChevronRight, Download } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import './index.css';

interface PilotWorkflowProps {
  caseInfo: ICaseItemType | null;
  workflowInfo: IWorkflowType;
  indexWorkflow: number;
  isCurrentWorkflow: boolean;
  onQueryWorkflowDetail: (params: { workflowId: string }) => void;
}

dayjs.extend(utc);

function PurePilotWorkflow(props: PilotWorkflowProps) {
  const {
    caseInfo,
    workflowInfo,
    indexWorkflow,
    isCurrentWorkflow,
    onQueryWorkflowDetail,
  } = props;

  const [isFold, setFold] = useState<boolean>(true);
  const [isLoadingDownload, setLoadingDownload] = useState<boolean>(false);

  const workflowUpdateTime = useMemo(() => {
    return dayjs.utc(workflowInfo.updated_at).local().format('MMM DD, YYYY HH: mm');
  }, [workflowInfo]);

  useEffect(() => {
    if (isCurrentWorkflow) {
      setFold(false);
      window.document
        .getElementById(`workflow-item-${indexWorkflow}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isCurrentWorkflow, indexWorkflow]);

  const handleHeaderClick = () => {
    if (isFold) {
      // window.postMessage(
      //   {
      //     type: 'ginkgoo-page-background-workflow-detail-query',
      //     workflowId: workflowInfo.workflow_instance_id,
      //   },
      //   window.location.origin
      // );
      onQueryWorkflowDetail?.({
        workflowId: workflowInfo.workflow_instance_id,
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
      fileId: workflowInfo.progress_file_id || '',
      highlightData: workflowInfo.dummy_data_usage || [],
    });
    // Step3: Download PDF file
    console.log('handleBtnDownloadPdfClick', resFilesPDFHighlight);
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
        fileName: `${caseInfo?.clientName || ''}-${caseInfo?.visaType || ''}-${dayjs.utc(workflowInfo.updated_at).local().format('YYYYMMDDHHmmss')}.pdf`,
      });
    } else {
      messageAntd.open({
        content: 'Failed to download PDF file. Please try again later.',
        type: 'error',
      });
    }

    setTimeout(() => {
      setLoadingDownload(false);
    }, 200);
  };

  return (
    <div
      id={`workflow-item-${indexWorkflow}`}
      className="relative w-full flex justify-center items-center overflow-hidden rounded-lg flex-[0_0_auto]"
    >
      <div
        className={cn(
          'workflow-wrap absolute left-[50%] top-[50%] min-h-full w-[300%] overflow-hidden rounded-lg pb-[300%]',
          {
            'animate-spin-workflow': isCurrentWorkflow,
          }
        )}
      ></div>
      <div className="relative w-full box-border p-0.5 bg-[rgba(0,0,0,0)] flex flex-col">
        <div className="flex flex-col w-full h-full box-border bg-[#ffffff] rounded-lg overflow-hidden p-3 gap-3">
          <div
            className="flex flex-row justify-between items-start gap-3 cursor-pointer"
            onClick={handleHeaderClick}
          >
            <div className="flex flex-[0_0_auto]">
              {workflowInfo.status === 'COMPLETED_SUCCESS' ? (
                <IconCompleted size={40} />
              ) : (
                <IconIncompleted size={40} />
              )}
            </div>
            <div className="flex flex-col w-0 flex-1">
              <span className="text-[#4E4E4E] text-sm truncate w-full">
                {caseInfo?.clientName || ''} - {caseInfo?.visaType || ''}
              </span>
              <div className="text-[#98A1B7] text-sm truncate w-full">
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

          {!isFold ? (
            <PilotStepBody
              workflowInfo={workflowInfo}
              isCurrentWorkflow={isCurrentWorkflow}
            />
          ) : null}

          <Button
            id={`workflow-item-btn-download-${indexWorkflow}`}
            type="primary"
            className=""
            disabled={!workflowInfo.progress_file_id}
            loading={isLoadingDownload}
            onClick={handleBtnPDFDownloadClick}
          >
            <Download size={20} />
            <span className="font-bold">Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PilotWorkflow = memo(PurePilotWorkflow);
