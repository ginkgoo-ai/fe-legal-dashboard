import { ICasePagination } from '@/types/case';
import { useEffect, useRef, useState } from 'react';

export function UseConversationScroll<T>(
  fetchCallback: ({ page, size }: { page: number; size: number }) => Promise<{
    messages: T[];
    pagination: ICasePagination;
  }>,
  options?: { pageOptions?: { size: number } }
) {
  const [messages, setMessages] = useState<T[]>([]);
  const [pageInfo, setPageInfo] = useState<ICasePagination | null>(null);

  const scrollState = useRef({
    prevScrollHeight: 0,
    prevScrollTop: 0,
    shouldAdjust: false,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [fetching, setFetching] = useState<boolean>(false);

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
      const { messages: newMessages, pagination } = await fetchCallback({
        page: (pageInfo?.page ?? -1) + 1,
        size: pageInfo?.size ?? options?.pageOptions?.size ?? 50,
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

  const refreshMessages = async () => {
    if (fetching) {
      return;
    }
    setFetching(true);
    try {
      const { messages: newMessages, pagination } = await fetchCallback({
        page: 0,
        size: pageInfo?.size ?? options?.pageOptions?.size ?? 50,
      });
      setMessages(newMessages);
      setPageInfo(pagination);
    } catch (error) {
      console.error('Error refreshing messages:', error);
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

  const scrollToBottom = (
    props?: Partial<{
      delay?: number;
      behavior?: ScrollBehavior;
    }>
  ) => {
    const { delay, behavior } = props ?? {};
    setTimeout(() => {
      bottomLineRef.current?.scrollIntoView({ behavior: behavior ?? 'auto' });
    }, delay ?? 200);
  };

  return {
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
    refreshMessages,
    resetScrollState: () => {
      scrollState.current = {
        prevScrollHeight: 0,
        prevScrollTop: 0,
        shouldAdjust: true,
      };
    },
  };
}
