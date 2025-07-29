import { FileBlock } from '@/components/common/itemFile';
import { IconMarkCircle, IconQuestionCircle } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ICaseConversationItem,
  ICaseConversationType,
  ICaseDocumentIssue,
  ICaseDocumentIssueItem,
  ICaseDocumentIssueStatus,
  ICaseMessageType,
} from '@/types/case';
import { cn } from '@/utils';
import { isArray } from 'lodash';
import { ChevronRight, Mail } from 'lucide-react';
import { HTMLAttributes, memo, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SiteLogo } from '../siteLogo';
import './index.css';

export const CaseActionLogWrapper = ({
  children,
  type,
  className,
  ...props
}: {
  children: React.ReactNode;
  type: ICaseMessageType;
} & HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isServerType = [
    ICaseMessageType.ASSISTANT,
    ICaseMessageType.CLIENT_WAITING_SERVER,
  ].includes(type);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-lg py-4 px-4 transition-[min-height] flex-none',
        isServerType
          ? ' border bg-panel-background outline outline-transparent'
          : 'bg-[#EFEFEF] dark:bg-primary-gray self-end max-w-[95%]',
        className
      )}
      {...props}
    >
      <div className={cn('w-full gap-2 flex-col')}>{children}</div>
    </div>
  );
};

const ServerLoadingLogger = () => {
  return (
    <>
      <div className="mb-2">
        <SiteLogo size={24} className="text-primary-dark" />
      </div>
      <div className="flex flex-col gap-2 items-center justify-center">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>
    </>
  );
};

const ServerCaseLogger = (props: {
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
      return (
        <>
          <div className="h-[1px] w-full border-t my-4"></div>
          <CaseLoggerEmailAction
            onClick={() =>
              props.onActionEmit?.({
                threadId,
                message,
              })
            }
          />
        </>
      );
    }
    if (conversationType === ICaseConversationType.SUMMARY) {
      return (
        <>
          {(documentIssues ?? []).length > 0 && (
            <>
              <div className="h-[1px] w-full border-t my-4"></div>
              <div className="w-full flex flex-col gap-2">
                {documentIssues.map(item => {
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
                })}
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
      {renderAction(message)}
    </>
  );
};

export const ClientCaseLogger = (props: { message: ICaseConversationItem }) => {
  const { metadata, content } = props.message;
  const list: any[] = isArray(metadata?.attachments)
    ? metadata?.attachments
    : isArray(metadata?.attachments?.files)
      ? metadata?.attachments?.files
      : [];
  return (
    <>
      {content && <div className="mb-4 text-[#1B2559] break-all">{content}</div>}
      <div className="w-full overflow-y-auto">
        <div className="flex items-center gap-4">
          {list.map((attachment, index) => (
            <FileBlock key={index} file={attachment} />
          ))}
        </div>
      </div>
    </>
  );
};

const DocumentIssuesStyles = {
  [ICaseDocumentIssueStatus.VALID]: 'success',
  [ICaseDocumentIssueStatus.HAS_CRITICAL_ISSUES]: 'error',
  [ICaseDocumentIssueStatus.HAS_WARNINGS]: 'warning',
};

const ActionIcons = {
  [ICaseDocumentIssueStatus.VALID]: <IconMarkCircle />,
  [ICaseDocumentIssueStatus.HAS_CRITICAL_ISSUES]: <IconQuestionCircle />,
  [ICaseDocumentIssueStatus.HAS_WARNINGS]: <IconQuestionCircle />,
};

export const ActionLabel = (
  conversationType: ICaseConversationType,
  status?: ICaseDocumentIssueStatus
) => {
  const styleClass = () => {
    if (conversationType === ICaseConversationType.EMAIL) {
      return 'info';
    }
    return DocumentIssuesStyles[status as ICaseDocumentIssueStatus];
  };
  const icon = () => {
    if (conversationType === ICaseConversationType.EMAIL) {
      return <Mail size={20} />;
    }
    return ActionIcons[status as ICaseDocumentIssueStatus] ?? <IconQuestionCircle />;
  };
  return (
    <div
      className={cn(
        'min-w-[113px] message-label w-fit px-2 rounded h-7 flex items-center justify-center gap-1 text-sm !font-normal',
        styleClass()
      )}
    >
      {icon()}
      Critical
    </div>
  );
};

const CaseLoggerAction = (
  props: {
    issue: ICaseDocumentIssue;
    documentIssues: ICaseDocumentIssueItem;
  } & HTMLAttributes<HTMLDivElement>
) => {
  const { onClick, documentIssues } = props;
  const style = DocumentIssuesStyles[documentIssues.status];
  return (
    <div
      className={cn(
        'w-full conversation-message rounded-[6px] h-11 p-2 hover:cursor-pointer transition-all flex items-center gap-4',
        style
      )}
      onClick={onClick}
    >
      {ActionLabel(ICaseConversationType.SUMMARY, documentIssues.status)}
      <div className="line-clamp-1">
        {documentIssues.documentName}: {documentIssues.description}
      </div>
      <span className="flex-1"></span>
      <ChevronRight size={20} />
    </div>
  );
};

const CaseLoggerEmailAction = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'w-full conversation-message rounded-[6px] h-11 p-2 hover:cursor-pointer transition-all flex items-center gap-4 info'
      )}
      {...props}
    >
      <div
        className={cn(
          'min-w-[113px] message-label w-fit px-2 rounded h-7 flex items-center justify-center gap-1 text-sm !font-normal',
          'info'
        )}
      >
        <Mail size={20} />
        Drafting
      </div>
      <div className="line-clamp-1">
        Finalize the message with your professional judgment.
      </div>
      <span className="flex-1"></span>
      <ChevronRight size={20} />
    </div>
  );
};

const PureCaseGrapher = ({
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
        return <ServerCaseLogger message={data} onActionEmit={onActionEmit} />;
      case ICaseMessageType.CLIENT_WAITING_SERVER:
        return <ServerLoadingLogger />;
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

export const CaseGrapher = memo(PureCaseGrapher);
