import { Button } from '@/components/ui/button';
import { getHistoryConversation } from '@/service/api';
import {
  ICaseConversationItem,
  ICaseDocumentIssueItem,
  ICaseMessageType,
  ICasePagination,
} from '@/types/case';
import { Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CaseGrapher, DocumentIssusLabel } from '../caseGrapher';
import { InputMultimodal } from '../inputMultimodal';

type SecondaryGrapherGroundProps = {
  message: ICaseConversationItem;
  threadId: string;
  documentIssues: ICaseDocumentIssueItem;
  caseId: string;
  onCloseEmit: () => void;
};

export const SecondaryGrapherGround = ({
  message,
  threadId,
  documentIssues,
  caseId,
  onCloseEmit,
}: SecondaryGrapherGroundProps) => {
  const [messages, setMessages] = useState<ICaseConversationItem[]>([]);
  const [pageInfo, setPageInfo] = useState<ICasePagination | null>(null);
  const [isLoadingBtnSend, setIsLoadingBtnSend] = useState<boolean>(false);
  const [
    initFileListForActionUploadForReferenceFile,
    setInitFileListForActionUploadForReferenceFile,
  ] = useState<File[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const scrollState = useRef({
    prevScrollHeight: 0,
    prevScrollTop: 0,
    shouldAdjust: false,
  });
  const addMessage = (message: ICaseConversationItem) => {
    setMessages(prev =>
      [...prev, { ...message, id: message.id ?? uuidv4() }].filter(
        item => item.messageType !== ICaseMessageType.CLIENT_WAITING_SERVER
      )
    );
  };

  const handleReferenceBtnSendClick = () => {};

  const fetchMessages = useCallback(
    async ({ page, size }: { page: number; size: number }) => {
      if (!caseId) {
        throw new Error('Case ID is required');
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
    setMessages([]);
    setFetching(false);
    setPageInfo(null);
    scrollState.current = {
      prevScrollHeight: 0,
      prevScrollTop: 0,
      shouldAdjust: true,
    };
  }, [threadId]);

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
    <div className="rounded-2xl w-full h-full">
      <div className="border-b p-4 relative">
        <div className="min-h-9 flex flex-col">
          <div className="flex items-center flex-1 font-semibold text-base gap-2">
            {DocumentIssusLabel(documentIssues.status)}
            {message.title}
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
      <div className="p-4 h-[calc(100%-73px)] overflow-auto relative">
        <div
          className="h-[calc(100%_-_135px)] overflow-auto overscroll-contain"
          ref={scrollContainerRef}
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
          <div className="flex flex-col gap-4">
            {messages.map(con => (
              <CaseGrapher key={con.id} data={con} onActionEmit={() => {}} />
            ))}
          </div>
          <div ref={bottomLineRef}></div>
        </div>
        <div className="border rounded-xl p-2 w-full">
          <InputMultimodal
            caseId={caseId}
            name="add-reference"
            placeholderDescription="Give your files a brief description."
            isShowBtnUpload
            isLoadingBtnSend={isLoadingBtnSend}
            verifyList={['fileList']}
            initFileListForActionUpload={initFileListForActionUploadForReferenceFile}
            onBtnSendClick={handleReferenceBtnSendClick}
          />
        </div>
      </div>
    </div>
  );
};
