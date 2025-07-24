import { FileBlock } from '@/components/common/itemFile';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ICaseConversationAction,
  ICaseConversationItem,
  ICaseMessageType,
} from '@/types/case';
import { cn } from '@/utils';
import { isArray } from 'lodash';
import { ChevronRight } from 'lucide-react';
import { HTMLAttributes, memo, useRef } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SiteLogo } from '../siteLogo';

const CaseActionLogWrapper = ({
  children,
  type,
  className,
  ...props
}: {
  children: React.ReactNode;
  type: 'server' | 'client';
} & HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isServerType = type === 'server';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-lg py-4 px-4 transition-[min-height] flex-none',
        isServerType
          ? ' border bg-panel-background'
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
    <CaseActionLogWrapper type="server">
      <div className="mb-2">
        <SiteLogo size={24} className="text-primary-dark" />
      </div>
      <div className="flex flex-col gap-2 items-center justify-center">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6 " />
        <Skeleton className="w-full h-6 " />
      </div>
    </CaseActionLogWrapper>
  );
};

const ServerCaseLogger = (
  props: ICaseConversationItem & {
    onActionEmit?: (params: {
      message: ICaseConversationItem;
      action: ICaseConversationAction;
    }) => void;
  }
) => {
  const onActionClick = (
    message: ICaseConversationItem,
    action: ICaseConversationAction
  ) => {
    props.onActionEmit?.({ message, action });
  };

  return (
    <CaseActionLogWrapper type="server" data-message-id={props.id}>
      <div className="mb-2">
        <SiteLogo size={24} className="text-primary-dark" />
      </div>
      <div className="dark:text-foreground text-[#1B2559]">
        <Markdown remarkPlugins={[remarkGfm]}>{props.title}</Markdown>
        <Markdown remarkPlugins={[remarkGfm]}>{props.content}</Markdown>
      </div>
      {props.documentIssues?.length > 0 && (
        <>
          <div className="h-[1px] w-full border-t my-4"></div>
          <div className="w-full flex flex-col gap-2">
            {props.documentIssues.map(({ issues, threadId }) => {
              return issues.map(issue => {
                return issue.actions.map((action, index) => {
                  return (
                    <CaseLoggerAction
                      {...action}
                      key={`${threadId}_${issue.id}_${index}`}
                      onClick={() => onActionClick(props, action)}
                    />
                  );
                });
              });
            })}
          </div>
        </>
      )}
    </CaseActionLogWrapper>
  );
};

const ClientCaseLogger = (props: ICaseConversationItem) => {
  const { metadata } = props;
  const list: any[] = isArray(metadata?.attachments)
    ? metadata?.attachments
    : isArray(metadata?.attachments?.files)
      ? metadata?.attachments?.files
      : [];
  return (
    <CaseActionLogWrapper type="client" className="w-fit" data-message-id={props.id}>
      {props.content && (
        <div className="mb-4 text-[#1B2559]">
          <Markdown remarkPlugins={[remarkGfm]}>{props.content}</Markdown>
        </div>
      )}
      <div className="w-full overflow-y-auto">
        <div className="flex items-center gap-4">
          {list.map((attachment, index) => (
            <FileBlock key={index} file={attachment} />
          ))}
        </div>
      </div>
    </CaseActionLogWrapper>
  );
};

const CaseLoggerAction = (
  props: ICaseConversationAction & HTMLAttributes<HTMLDivElement>
) => {
  const { action, label, parameters, onClick } = props;
  return (
    <div
      className="w-full bg-orange-100 rounded-[6px] h-11 p-2 hover:bg-orange-200 hover:cursor-pointer hover:inset-shadow-2xs transition-all flex items-center gap-4"
      onClick={onClick}
    >
      <div className="min-w-[113px] bg-orange-500 w-fit px-2 rounded h-full flex items-center justify-center text-white">
        {'default'}
      </div>
      <div className="text-orange-500 line-clamp-1">{label}</div>
      <span className="flex-1"></span>
      <ChevronRight className="text-orange-500" size={20} />
    </div>
  );
};

const PureCaseGrapher = ({
  data,
  onActionEmit,
}: {
  data: ICaseConversationItem;
  onActionEmit: (params: {
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  }) => void;
}) => {
  const { messageType } = data;
  if (messageType === ICaseMessageType.ASSISTANT) {
    return <ServerCaseLogger {...data} onActionEmit={onActionEmit} />;
  }
  if (messageType === ICaseMessageType.CLIENT_WAITING_SERVER) {
    return <ServerLoadingLogger />;
  }
  return <ClientCaseLogger {...data} />;
};

export const CaseGrapher = memo(PureCaseGrapher);
