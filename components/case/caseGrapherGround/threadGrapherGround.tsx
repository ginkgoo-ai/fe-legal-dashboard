import { Button } from '@/components/ui/button';
import { UseConversationScroll } from '@/hooks/useConversationScroll';
import { useEventManager } from '@/hooks/useEventManager';
import { getHistoryConversation } from '@/service/api';
import {
  ICaseConversationItem,
  ICaseConversationType,
  ICaseDocumentIssueItem,
  ICaseMessageType,
  ICasePagination,
} from '@/types/case';
import { cn } from '@/utils';
import { Loader2, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ActionLabel } from '../caseGrapher';
import { ThreadGrapher } from '../caseGrapher/threadGrapher';
import { ThreadGrapherActions } from './threadGrapherActions';

type ThreadGrapherGroundProps = {
  data: {
    message: ICaseConversationItem;
    threadId: string;
    documentIssues: ICaseDocumentIssueItem;
    [key: string]: any;
  };
  caseId: string;
  workflowOptions?: Record<string, any>;
  onCloseEmit: () => void;
};

export const ThreadGrapherGround = ({
  data: { message, threadId, documentIssues, ...restData },
  caseId,
  workflowOptions,
  onCloseEmit,
}: ThreadGrapherGroundProps) => {
  const fetchMessages = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      if (!caseId) {
        throw new Error('Case ID is required');
      }

      if (message.conversationType === ICaseConversationType.AUTO_FILLING) {
        return Promise.resolve({
          messages: [
            {
              id: uuidv4(),
              content:
                'The automated data population process for the visa application has been paused. A data field was encountered that requires human review and input to ensure complete accuracy. Please access the case file to complete the flagged sections.',
              conversationType: ICaseConversationType.AUTO_FILLING,
              messageType: ICaseMessageType.ASSISTANT,
              metadata: {
                pilotInfo: restData.pilotInfo,
              } as Record<string, any>,
            } as ICaseConversationItem,
          ],
          pagination: {
            hasNext: false,
          } as ICasePagination,
        });
      }

      const response = await getHistoryConversation(caseId, {
        page,
        size,
        threadId,
      });
      return response;
    },
    [caseId, threadId]
  );

  const {
    messages,
    setMessages,
    scrollContainerRef,
    bottomLineRef,
    sentinelRef,
    fetching,
    pageInfo,
    setPageInfo,
    setFetching,
    scrollToBottom,
    resetScrollState,
  } = UseConversationScroll<ICaseConversationItem>(fetchMessages);

  const genClientMessage = useCallback((content: string) => {
    const msg = {
      id: uuidv4(),
      messageType: ICaseMessageType.USER,
      content,
      createdAt: new Date().toISOString(),
    } as ICaseConversationItem;
    setMessages(prev => [...prev, msg]);
  }, []);

  const updateChunkMessage = useCallback(
    (content: string) => {
      const msg = messages.find(item => item.id === 'CHUNKING');
      if (msg) {
        msg.content = msg.content + content;
        setMessages(prev => [...prev.filter(m => m.id !== 'CHUNKING'), msg]);
      }
    },
    [messages]
  );

  const completeChunkMessage = () => {
    setMessages(prev =>
      prev.map(item => {
        if (item.id === 'CHUNKING') {
          item.id = uuidv4();
          item.conversationType = ICaseConversationType.EMAIL;
        }
        return item;
      })
    );
  };

  useEventManager(
    'ginkgoo-thread',
    $event => {
      const { type, data, threadId: tThreadId } = $event;
      if (threadId !== tThreadId) {
        return;
      }
      switch (type) {
        case 'event: send':
          genClientMessage(data.content);
          break;
        case 'event: ai_response_chunk':
          updateChunkMessage(data.content);
          break;
        case 'event: analysis_start':
          genTempMessage('');
          break;
        case 'event: email_draft_completed':
          completeChunkMessage();
          break;
        default:
          return;
      }
      scrollToBottom({ behavior: 'smooth' });
    },
    [messages]
  );

  const genTempMessage = (content: string) => {
    const message = {
      id: 'CHUNKING',
      content,
      messageType: ICaseMessageType.ASSISTANT,
      conversationType: ICaseConversationType.GENERAL,
    } as ICaseConversationItem;
    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    setMessages([]);
    setFetching(false);
    setPageInfo(null);
    resetScrollState();
  }, [threadId]);

  return (
    <div className="rounded-2xl w-full h-full">
      <div className="border-b p-4 relative">
        <div className="min-h-9 flex items-center">
          <div className="flex items-center font-semibold text-base gap-2 w-[calc(100%_-_40px)] truncate">
            {ActionLabel(message.conversationType, {
              status: documentIssues?.status,
              message,
            })}
            <h2 className="truncate">{message.content}</h2>
          </div>
        </div>
        <Button
          onClick={onCloseEmit}
          variant={'ghost'}
          size={'icon'}
          className="absolute top-4 right-4"
        >
          <X />
        </Button>
      </div>
      <div className="p-4 h-[calc(100%_-_73px)] overflow-auto relative">
        <div
          className={cn('overflow-auto overscroll-contain', {
            'h-[calc(100%_-_135px)]':
              message.conversationType === ICaseConversationType.EMAIL,
            'h-full': ![
              ICaseConversationType.EMAIL,
              ICaseConversationType.AUTO_FILLING,
            ].includes(message.conversationType),
            'h-[calc(100%_-_54px)]':
              message.conversationType === ICaseConversationType.AUTO_FILLING,
          })}
          ref={scrollContainerRef}
        >
          <div
            className="w-full items-center flex justify-center mb-4 text-primary-gray text-xs"
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
          <div className="flex flex-col gap-4">
            {messages.map(con => (
              <ThreadGrapher
                key={con.id}
                caseId={caseId}
                data={con}
                onActionEmit={() => {}}
              />
            ))}
          </div>
          <div ref={bottomLineRef}></div>
        </div>
        <ThreadGrapherActions
          message={message}
          caseId={caseId}
          workflowOptions={workflowOptions}
        />
      </div>
    </div>
  );
};
