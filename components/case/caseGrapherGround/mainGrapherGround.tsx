import { UseConversationScroll } from '@/hooks/useConversationScroll';
import { useEventManager } from '@/hooks/useEventManager';
import { getHistoryConversation } from '@/service/api';
import { ICaseConversationItem, ICaseMessageType } from '@/types/case';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CaseGrapher } from '../caseGrapher';

type MainGrapherGroundProps = {
  caseId: string;
  paddingBottom?: number;
  activeMessage: ICaseConversationItem | null;
  workflowOptions?: Record<string, any>;
  emitMessageAction: (message: any) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const MainGrapherGround = ({
  caseId,
  paddingBottom = 0,
  emitMessageAction,
  activeMessage,
  workflowOptions,
}: MainGrapherGroundProps) => {
  const fetchMessages = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      if (!caseId) {
        throw new Error('Case ID is required');
      }

      const response = await getHistoryConversation(caseId, {
        page,
        size,
      });
      return response;
    },
    [caseId]
  );

  const {
    messages,
    setMessages,
    scrollContainerRef,
    bottomLineRef,
    sentinelRef,
    fetching,
    pageInfo,
    scrollToBottom,
    refreshMessages,
  } = UseConversationScroll<ICaseConversationItem>(fetchMessages, {
    pageOptions: { size: 50 },
  });

  // 监听实时消息
  useEventManager('ginkgoo-sse', message => {
    const { type, data } = message;

    switch (type) {
      case 'event:conversationMessage':
        if (data) {
          addMessage(data);
          scrollToBottom({ behavior: 'smooth' });
        }
        break;
      case 'event:ocrProcessingStarted':
        addLoadingMessage();
        scrollToBottom({ behavior: 'smooth' });
        break;
    }
  });

  useEventManager('ginkgoo-thread', message => {
    const { type } = message;

    switch (type) {
      case 'event: ignoreIssues':
        refreshMessages();
        scrollToBottom();
        break;
    }
  });

  const addMessage = (message: ICaseConversationItem) => {
    setMessages(prev =>
      [...prev, { ...message, id: message.id ?? uuidv4() }].filter(
        item => item.messageType !== ICaseMessageType.CLIENT_WAITING_SERVER
      )
    );
  };

  const addLoadingMessage = () => {
    const loadingMessage = {
      id: 'waitingMessage',
      messageType: 'CLIENT_WAITING_SERVER',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ICaseConversationItem;
    setMessages(prev => [
      ...prev.filter(msg => msg.messageType !== ICaseMessageType.CLIENT_WAITING_SERVER),
      loadingMessage,
    ]);
  };

  return (
    <div className="h-full">
      <div className="h-full overflow-auto overscroll-contain" ref={scrollContainerRef}>
        <div
          style={{
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          <div
            className="w-full items-center flex justify-center mb-4 text-primary-gray text-sm"
            ref={sentinelRef}
          >
            {fetching ? (
              <div className="flex items-center justify-center animate-spin">
                <Loader2 size={24} />
              </div>
            ) : pageInfo?.hasNext ? (
              'Load more messages'
            ) : null}
          </div>
          <div className="flex flex-col gap-4 px-1">
            {messages.map(con => (
              <CaseGrapher
                key={con.id}
                data={con}
                className={cn({
                  'border-primary/30 outline-primary/30': activeMessage?.id === con.id,
                })}
                workflowOptions={workflowOptions}
                onActionEmit={$event => {
                  emitMessageAction($event);
                }}
              />
            ))}
          </div>
          <div ref={bottomLineRef}></div>
        </div>
      </div>
    </div>
  );
};
