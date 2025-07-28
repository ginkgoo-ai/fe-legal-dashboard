import { useEventManager } from '@/hooks/useEventManager';
import { getHistoryConversation } from '@/service/api';
import { ICaseConversationItem, ICaseMessageType, ICasePagination } from '@/types/case';
import { ICaseDocumentType } from '@/types/file';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CaseGrapher } from '../caseGrapher';

type MainGrapherGroundProps = {
  caseId: string;
  paddingBottom?: number;
  activeMessage: ICaseConversationItem | null;
  emitMessageAction: (message: any) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const MainGrapherGround = ({
  caseId,
  paddingBottom = 0,
  emitMessageAction,
  activeMessage,
  ...props
}: MainGrapherGroundProps) => {
  const [messages, setMessages] = useState<ICaseConversationItem[]>([]);
  const [pageInfo, setPageInfo] = useState<ICasePagination | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const scrollState = useRef({
    prevScrollHeight: 0,
    prevScrollTop: 0,
    shouldAdjust: false,
  });

  // 监听实时消息
  useEventManager('ginkgoo-sse', message => {
    const { type, data } = message;

    switch (type) {
      case 'event:conversationMessage':
        if (data) {
          addMessage(data);
          // 新消息到达时滚动到底部
          setTimeout(() => {
            bottomLineRef.current?.scrollIntoView();
          }, 200);
        }
        break;
    }
  });

  useEventManager('ginkgoo-case', async message => {
    const { type: typeMsg } = message || {};

    switch (typeMsg) {
      case 'update-case-reference-change':
        addClientMessage(message);
        setTimeout(() => {
          bottomLineRef.current?.scrollIntoView();
        }, 200);
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

  const addClientMessage = (message: {
    acceptedDocuments: ICaseDocumentType[];
    description: string;
    type: string;
  }) => {
    const { acceptedDocuments, description, type } = message;
    if (type !== 'update-case-reference-change') {
      return;
    }
    const newMessage = {
      id: uuidv4(),
      messageType: 'USER',
      content: description,
      metadata: {
        attachments: acceptedDocuments,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ICaseConversationItem;
    setMessages(prev => [...prev, newMessage]);
    addLoadingMessage();
  };

  const addLoadingMessage = () => {
    const loadingMessage = {
      id: 'waitingMessage',
      messageType: 'CLIENT_WAITING_SERVER',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ICaseConversationItem;
    setMessages(prev => [...prev, loadingMessage]);
  };

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

  const loadMoreMessages = async () => {
    if (fetching) {
      return;
    }
    const list = scrollContainerRef.current;
    if (!list) return;
    scrollState.current = {
      prevScrollHeight: list.scrollHeight,
      prevScrollTop: list.scrollTop,
      shouldAdjust: true,
    };
    setFetching(true);
    try {
      const { messages: newMessages, pagination } = await fetchMessages({
        page: (pageInfo?.page ?? -1) + 1,
        size: pageInfo?.size ?? 50,
      });
      setMessages(prev => [...newMessages, ...prev]);
      setPageInfo(pagination);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setFetching(false);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        if (!pageInfo) {
          loadMoreMessages();
        }
        if (!fetching && pageInfo?.hasNext) {
          loadMoreMessages();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 1.0,
      }
    );

    if (sentinelRef?.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetching, pageInfo, sentinelRef]);

  useEffect(() => {
    const list = scrollContainerRef.current;
    if (!list || !scrollState.current.shouldAdjust) return;

    // 3. 计算并补偿滚动位置
    const { prevScrollHeight, prevScrollTop } = scrollState.current;
    const scrollHeightDiff = list.scrollHeight - prevScrollHeight;

    // 应用滚动位置补偿
    list.scrollTop = prevScrollTop + scrollHeightDiff;

    // 重置状态
    scrollState.current.shouldAdjust = false;
  }, [messages]);

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
            ) : (
              '--- There are no more messages ---'
            )}
          </div>
          <div className="flex flex-col gap-4 px-1">
            {messages.map(con => (
              <CaseGrapher
                key={con.id}
                data={con}
                className={cn({
                  'border-primary/30 outline-primary/30': activeMessage?.id === con.id,
                })}
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
