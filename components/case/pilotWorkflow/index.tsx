'use client';

import { PilotStepBody } from '@/components/case/pilotStepBody';
import { IconCompleted } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ICaseItemType } from '@/types/case';
import { IWorkflowType } from '@/types/casePilot';
import { Button } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ChevronRight, Download } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import './index.css';

interface PilotWorkflowProps {
  caseInfo: ICaseItemType;
  workflowInfo: IWorkflowType;
  isCurrentWorkflow: boolean;
}

dayjs.extend(utc);

function PurePilotWorkflow(props: PilotWorkflowProps) {
  const { caseInfo, workflowInfo, isCurrentWorkflow } = props;

  const [isFold, setFold] = useState<boolean>(true);
  const [isLoadingDownload, setLoadingDownload] = useState<boolean>(false);

  const workflowUpdateTime = useMemo(() => {
    return dayjs.utc(workflowInfo.updated_at).local().format('MMM DD, YYYY HH: mm');
  }, [workflowInfo]);

  const handleHeaderClick = () => {
    setFold(prev => {
      return !prev;
    });
  };

  const handleBtnPDFDownloadClick = async () => {
    setLoadingDownload(true);

    // Step1: Query Workflow Detail

    // Step2: Download PDF

    setLoadingDownload(false);
  };

  return (
    <div className="relative w-full flex justify-center items-center overflow-hidden rounded-lg flex-[0_0_auto]">
      <div
        className={cn(
          'workflow-wrap absolute left-[50%] top-[50%] min-h-full w-[200%] overflow-hidden rounded-lg pb-[100%]',
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
                <IconCompleted size={40} />
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

          {!isFold ? <PilotStepBody workflowInfo={workflowInfo} /> : null}

          <Button
            type="primary"
            className="!h-9 flex-1"
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
