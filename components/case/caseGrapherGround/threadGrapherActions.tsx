import { useEventManager } from '@/hooks/useEventManager';
import { conversationMessageStream } from '@/service/api';
import { ICaseConversationItem, ICaseConversationType } from '@/types/case';
import { useState } from 'react';
import { InputMultimodal } from '../inputMultimodal';

type ThreadGrapherActionsProps = {
  message: ICaseConversationItem;
  caseId: string;
};

export const ThreadGrapherActions = ({ message, caseId }: ThreadGrapherActionsProps) => {
  const { conversationType } = message;
  const [isLoadingBtnSend, setLoadingBtnSend] = useState(false);
  const [description, setDescription] = useState('');
  const { emit: emitThread } = useEventManager('ginkgoo-thread', () => {});

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

    const { cancel } = await conversationMessageStream(
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
  return null;
};
