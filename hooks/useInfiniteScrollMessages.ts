import { ICasePagination } from '@/types/case';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Message {
  id: number | string;
  [key: string]: any;
}

interface UseInfiniteScrollMessagesProps<T extends Message> {
  fetchMessages: (params: {
    page: number;
    size: number;
  }) => Promise<{ messages: T[]; pagination: ICasePagination }>;
  initialPage?: number;
  pageSize?: number;
  scrollContainer?: HTMLElement | null;
  loaderMargin?: string;
  threshold?: number;
  disabled?: boolean;
}

export function useInfiniteScrollMessages<T extends Message>({
  fetchMessages,
  initialPage = 0,
  pageSize = 10,
  scrollContainer = null,
  loaderMargin = '100px',
  threshold = 0.01,
  disabled = false,
}: UseInfiniteScrollMessagesProps<T>) {
  // 基础状态
  const [messages, setMessages] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);

  // 初始化状态
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsInitialScroll, setNeedsInitialScroll] = useState(false);

  // 请求状态跟踪
  const loadingRef = useRef(false);
  const lastRequestPageRef = useRef<number | null>(null);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchMessagesRef = useRef(fetchMessages);

  // 保持 fetchMessages 引用最新
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);

  // 加载消息的核心函数
  const loadMessages = useCallback(
    async (pageNum: number, isInitial = false) => {
      console.log('🚀 loadMessages called:', {
        pageNum,
        isInitial,
        disabled,
        isLoading,
        loadingRef: loadingRef.current,
        lastRequestPage: lastRequestPageRef.current,
      });

      if (disabled || isLoading || loadingRef.current) {
        console.log('❌ loadMessages blocked:', {
          disabled,
          isLoading,
          loadingRef: loadingRef.current,
        });
        return;
      }

      // 防止重复请求同一页
      if (lastRequestPageRef.current === pageNum && !isInitial) {
        console.log('❌ duplicate request blocked for page:', pageNum);
        return;
      }

      console.log('✅ loadMessages proceeding with page:', pageNum);
      setIsLoading(true);
      setError(null);
      loadingRef.current = true;
      lastRequestPageRef.current = pageNum;

      try {
        // 记录滚动锚点（仅用于历史消息加载）
        let scrollAnchor: { messageId: string; offsetTop: number } | null = null;

        if (!isInitial) {
          const container =
            scrollContainer || messagesContainerRef.current?.parentElement;
          if (container && messagesContainerRef.current) {
            const containerRect = container.getBoundingClientRect();
            const messageElements =
              messagesContainerRef.current.querySelectorAll('[data-message-id]');

            // 找到当前视窗中第一个可见的消息作为锚点
            for (const messageEl of Array.from(messageElements)) {
              const messageRect = messageEl.getBoundingClientRect();
              if (messageRect.bottom > containerRect.top + 10) {
                const messageId = messageEl.getAttribute('data-message-id');
                if (messageId) {
                  scrollAnchor = {
                    messageId,
                    offsetTop: messageRect.top - containerRect.top,
                  };
                  break;
                }
              }
            }
          }
        }

        // 获取消息数据
        const { messages: newMessages, pagination } = await fetchMessagesRef.current({
          page: pageNum,
          size: pageSize,
        });

        // 更新消息列表
        setMessages(prev => {
          if (isInitial) {
            return newMessages;
          } else {
            // 历史消息加载到前面
            return [...newMessages, ...prev];
          }
        });

        setHasMore(pagination.hasNext);
        setCurrentPage(pageNum);

        if (isInitial) {
          setIsInitialized(true);
          setNeedsInitialScroll(true);
        } else if (scrollAnchor) {
          // 恢复滚动位置
          requestAnimationFrame(() => {
            const container =
              scrollContainer || messagesContainerRef.current?.parentElement;
            if (!container || !messagesContainerRef.current) return;

            const anchorElement = messagesContainerRef.current.querySelector(
              `[data-message-id="${scrollAnchor.messageId}"]`
            );

            if (anchorElement) {
              const containerRect = container.getBoundingClientRect();
              const anchorRect = anchorElement.getBoundingClientRect();
              const currentOffset = anchorRect.top - containerRect.top;
              const adjustment = currentOffset - scrollAnchor.offsetTop;

              if (Math.abs(adjustment) > 2) {
                container.scrollTop += adjustment;
              }
            }
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    },
    [disabled, scrollContainer]
  );

  // 初始化加载
  useEffect(() => {
    console.log('🔄 Initial load effect triggered:', {
      disabled,
      isInitialized,
      isLoading,
      loadingRef: loadingRef.current,
    });

    if (!disabled && !isInitialized && !isLoading && !loadingRef.current) {
      console.log('✅ Triggering initial load');
      loadMessages(initialPage, true);
    }
  }, [disabled, isInitialized]);

  // 初始加载完成后滚动到底部
  useEffect(() => {
    if (needsInitialScroll && isInitialized && messages.length > 0 && !isLoading) {
      setNeedsInitialScroll(false);

      const container = scrollContainer || messagesContainerRef.current?.parentElement;
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'auto',
          });
        });
      }
    }
  }, [needsInitialScroll, isInitialized, messages.length, isLoading, scrollContainer]);

  // 滚动到底部函数
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = scrollContainer || messagesContainerRef.current?.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      }
    },
    [scrollContainer]
  );

  // 加载更多消息
  const loadMoreRef = useRef<() => void>();
  loadMoreRef.current = () => {
    console.log('📄 loadMore called:', {
      disabled,
      isLoading,
      hasMore,
      currentPage,
      loadingRef: loadingRef.current,
    });

    if (disabled || isLoading || !hasMore || loadingRef.current) {
      console.log('❌ loadMore blocked');
      return;
    }

    const nextPage = currentPage + 1;
    console.log('✅ loadMore proceeding to page:', nextPage);
    loadMessages(nextPage, false);
  };

  const loadMore = useCallback(() => {
    loadMoreRef.current?.();
  }, []);

  // IntersectionObserver 设置
  useEffect(() => {
    if (disabled) return;

    const container = scrollContainer || messagesContainerRef.current?.parentElement;
    const loaderElement = loaderRef.current;

    if (!container || !loaderElement) return;

    // 清理之前的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        console.log('👁️ IntersectionObserver triggered:', {
          isIntersecting: entry.isIntersecting,
          hasMore,
          isLoading,
          disabled,
          currentPage,
        });

        if (entry.isIntersecting) {
          console.log('✅ Triggering loadMore from intersection');
          loadMore();
        }
      },
      {
        root: container,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(loaderElement);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [disabled, scrollContainer, loadMore]);

  // 重置状态
  const reset = useCallback(() => {
    setMessages([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
    setIsInitialized(false);
    setNeedsInitialScroll(false);
    loadingRef.current = false;
    lastRequestPageRef.current = null;

    // 清理 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, [initialPage]);

  // 手动添加新消息（用于实时消息）
  const addMessage = useCallback((message: T) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    addMessage,
    messagesContainerRef,
    loaderRef,
    scrollToBottom,
  };
}
