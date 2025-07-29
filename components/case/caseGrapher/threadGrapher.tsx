import { CopyButton } from '@/components/common/copyButton';
import {
  ICaseConversationItem,
  ICaseConversationType,
  ICaseDocumentIssueItem,
  ICaseMessageType,
} from '@/types/case';
import { cn } from '@/utils';
import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CaseActionLogWrapper, ClientCaseLogger } from '.';
import { SiteLogo } from '../siteLogo';

const ThreadServerCaseLogger = (props: {
  message: ICaseConversationItem;
  onActionEmit?: (params: {
    threadId: string;
    documentIssues?: ICaseDocumentIssueItem;
    message: ICaseConversationItem;
  }) => void;
}) => {
  const { message } = props;

  const renderAction = (msg: ICaseConversationItem) => {
    const { conversationType, documentIssues, threadId } = msg;
    if (conversationType === ICaseConversationType.AUTO_FILLING) {
      return (
        <>
          <div className="h-[1px] w-full border-t my-4"></div>
          TODO: AUTO_FILLING
        </>
      );
    }
    if (conversationType === ICaseConversationType.EMAIL) {
      return CopyButton({ message: message.content });
    }
    if (conversationType === ICaseConversationType.SUMMARY) {
      return (
        <>
          {(documentIssues ?? []).length > 0 && (
            <>
              <div className="h-[1px] w-full border-t my-4"></div>
              <div className="w-full flex flex-col gap-2">
                {/* {documentIssues.map(item => {
                  const { issues, threadId } = item;
                  return issues.map(issue => (
                    <CaseLoggerAction
                      issue={issue}
                      documentIssues={item}
                      key={`${threadId}_${issue.id}`}
                      onClick={() =>
                        props.onActionEmit?.({
                          threadId: threadId,
                          documentIssues: item,
                          message,
                        })
                      }
                    />
                  ));
                })} */}
              </div>
            </>
          )}
        </>
      );
    }
  };

  return (
    <>
      <div className="mb-2">
        <SiteLogo size={24} className="text-primary-dark" />
      </div>
      <div className="dark:text-foreground text-[#1B2559]">
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      </div>
      <div className="mt-2">{renderAction(message)}</div>
    </>
  );
};

const PureThreadGrapher = ({
  data,
  className,
  onActionEmit,
}: {
  data: ICaseConversationItem;
  active?: boolean;
  className?: string;
  onActionEmit: (params: {
    threadId: string;
    message: ICaseConversationItem;
    documentIssues?: ICaseDocumentIssueItem;
  }) => void;
}) => {
  const { messageType, id } = data;
  const grapherRender = (type: ICaseMessageType) => {
    switch (type) {
      case ICaseMessageType.ASSISTANT:
        return <ThreadServerCaseLogger message={data} onActionEmit={onActionEmit} />;
      case ICaseMessageType.USER:
        return <ClientCaseLogger message={data} />;
      default:
        return null;
    }
  };

  return (
    <CaseActionLogWrapper
      type={messageType}
      data-message-id={id}
      className={cn(
        {
          'w-fit': messageType === ICaseMessageType.USER,
        },
        className
      )}
    >
      {grapherRender(messageType)}
    </CaseActionLogWrapper>
  );
};

export const ThreadGrapher = memo(PureThreadGrapher);
