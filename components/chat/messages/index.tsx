import { Greeting } from '@/components/chat/greeting';
import { PreviewMessage } from '@/components/chat/message-preview';
import { ThinkingMessage } from '@/components/chat/message-thinking';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { ChatMessage, ChatStatus } from '@/types/chat';
import equal from 'fast-deep-equal';
import { memo } from 'react';

interface MessagesProps {
  status: ChatStatus;
  messages: ChatMessage[];
}

function PureMessages(props: MessagesProps) {
  const { status, messages } = props;
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex h-0 flex-1 flex-col gap-[1.5rem] pt-[1.5rem]"
    >
      {messages.length === 0 && <Greeting />}

      {messages.map((message, index) => (
        <PreviewMessage key={`preview-${index}`} message={message} />
      ))}

      {status === ChatStatus.SUBMITTED &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div ref={messagesEndRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
