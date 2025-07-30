import { Button } from '@/components/ui/button';
import { MESSAGE } from '@/config/message';
import UtilsManager from '@/customManager/UtilsManager';
import { useEventManager } from '@/hooks/useEventManager';
import { conversationMessageStream, postFilesPDFHighlight } from '@/service/api';
import { ICaseConversationItem, ICaseConversationType } from '@/types/case';
import { message as messageAntd } from 'antd';
import dayjs from 'dayjs';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { InputMultimodal } from '../inputMultimodal';

type ThreadGrapherActionsProps = {
  message: ICaseConversationItem;
  caseId: string;
  workflowOptions?: Record<string, any>;
};

export const ThreadGrapherActions = ({
  message,
  caseId,
  workflowOptions,
}: ThreadGrapherActionsProps) => {
  const { conversationType } = message;
  const [isLoadingBtnSend, setLoadingBtnSend] = useState(false);
  const [isLoadingBtnDownload, setLoadingBtnDownload] = useState(false);
  const [description, setDescription] = useState('');
  const { emit: emitThread } = useEventManager('ginkgoo-thread', () => {});
  const { pilotInfoCurrent: pilotInfo, caseInfo } = workflowOptions ?? {};

  const handleReferenceBtnSendClick = async ($event: { description: string }) => {
    setDescription($event.description);
    setLoadingBtnSend(true);

    emitThread({
      type: 'event: send',
      data: {
        content: $event.description,
      },
      threadId: message.threadId,
    });

    await conversationMessageStream(
      {
        caseId,
        payload: {
          message: $event.description,
          threadId: message.threadId,
          type: 'email_draft',
        },
      },
      () => {
        // 可以立即获取到 controller
        // setRequestController({ cancel: () => controller.abort() });
      },
      async res => {
        const [resType, resData] = res?.split('\n') || [];

        console.log('🚀 ~ thread res:', res);

        const parseAndEmitEvent = (eventPrefix: string) => {
          const dataStr = resData.trim().replace('data:', '').trim();
          try {
            const data = JSON.parse(dataStr);
            emitThread({
              type: eventPrefix,
              data,
              threadId: message.threadId,
            });
          } catch (error) {
            console.warn('[Debug] Error parse message', error);
          }
        };

        parseAndEmitEvent(resType);
        setLoadingBtnSend(false);
        setDescription('');
      }
    );
  };

  const handleBtnPDFDownloadClick = async () => {
    setLoadingBtnDownload(true);

    // Step1: Get PDF blob
    const resFilesPDFHighlight = await postFilesPDFHighlight({
      fileId: pilotInfo?.pilotWorkflowInfo?.progress_file_id || '',
      highlightData: pilotInfo?.pilotWorkflowInfo?.dummy_data_usage || [],
    });
    // Step2: Download PDF file
    if (resFilesPDFHighlight) {
      UtilsManager.downloadBlob({
        blobPart: resFilesPDFHighlight,
        fileName: `${caseInfo?.clientName || ''}-${caseInfo?.visaType || ''}-${dayjs
          .utc(pilotInfo?.pilotWorkflowInfo?.updated_at)
          .local()
          .format('YYYYMMDDHHmmss')}.pdf`,
      });
    } else {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_DOWNLOAD_PDF_FILE_FAILED,
      });
    }

    setTimeout(() => {
      setLoadingBtnDownload(false);
    }, 200);
  };

  if (conversationType === ICaseConversationType.EMAIL) {
    return (
      <div className="border rounded-xl p-2 w-full mt-4">
        <InputMultimodal
          caseId={caseId}
          name="emailDraft"
          initDescription={description}
          placeholderDescription="Ask Ginkgoo."
          isShowBtnUpload={false}
          isLoadingBtnSend={isLoadingBtnSend}
          verifyList={['description']}
          onBtnSendClick={handleReferenceBtnSendClick}
          maxHeight="40px"
        />
      </div>
    );
  }
  if (conversationType === ICaseConversationType.AUTO_FILLING) {
    return (
      <div className="border-t px-2 pt-4 w-full flex items-center justify-end">
        <Button
          disabled={
            isLoadingBtnDownload || !pilotInfo?.pilotWorkflowInfo?.progress_file_id
          }
          variant="outline"
          onClick={handleBtnPDFDownloadClick}
        >
          {isLoadingBtnDownload ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          Download
        </Button>
      </div>
    );
  }
  return null;
};
