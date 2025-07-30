import { FileBlock } from '@/components/common/itemFile';
import { IconBroadcast, IconMarkCircle, IconQuestionCircle } from '@/components/ui/icon';
import {
  ICaseConversationItem,
  ICaseConversationType,
  ICaseDocumentIssue,
  ICaseDocumentIssueItem,
  ICaseDocumentIssueStatus,
  ICaseMessageType,
} from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { cn } from '@/utils';
import { isArray } from 'lodash';
import { ChevronRight, Loader, Mail } from 'lucide-react';
import { HTMLAttributes, memo, ReactNode, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PilotWorkflow } from '../pilotWorkflow';
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
      <div className="flex flex-col gap-2 justify-center">
        <div className="after:animate-point-loading">Analyzing documents</div>
      </div>
    </>
  );
};

const ServerCaseLogger = (props: {
  message: ICaseConversationItem;
  workflowOptions?: Record<string, any>;
  onActionEmit?: (params: {
    threadId: string;
    documentIssues?: ICaseDocumentIssueItem;
    message: ICaseConversationItem;
    [key: string]: any;
  }) => void;
}) => {
  const { message, workflowOptions } = props;
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const renderAction = (msg: ICaseConversationItem) => {
    const { conversationType, documentIssues, threadId, metadata } = msg;
    if (conversationType === ICaseConversationType.AUTO_FILLING) {
      const workflowId = metadata?.workflowId ?? '';
      const workflowInfo = ((workflowOptions?.workflowList as any[]) ?? []).find(
        item => item.workflow_instance_id === workflowId
      );
      return (
        <>
          {workflowOptions && workflowInfo && (
            <div className="mt-2">
              <PilotWorkflow
                pageTabInfo={workflowOptions.pageTabInfo}
                caseInfo={workflowOptions.caseInfo}
                workflowInfo={workflowInfo}
                indexKey={`panel-summary-workflow-${0}`}
                pilotInfoCurrent={workflowOptions.pilotInfoCurrent}
                onPilotInfoChange={params => {
                  const { pilotInfo: pilotInfoParams } = params || {};
                  setPilotInfo(pilotInfoParams);
                }}
              />
              <div className="h-[1px] w-full border-t my-4"></div>
              <CaseLoggerAutoFillingAction
                pilotInfo={pilotInfo}
                onClick={() =>
                  props.onActionEmit?.({
                    threadId,
                    message: {
                      ...message,
                      metadata: {
                        ...message.metadata,
                        pilotInfo: pilotInfo,
                      },
                    },
                    pilotInfo,
                  })
                }
              />
            </div>
          )}
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
                  const { issues, threadId, status } = item;
                  return issues.map(issue => (
                    <CaseLoggerAction
                      issue={issue}
                      documentIssues={item}
                      key={`${threadId}_${issue.id}_${status}`}
                      onClick={() =>
                        props.onActionEmit?.({
                          threadId: item.threadId,
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
    <div className="flex flex-col gap-4">
      {content && <div className="text-[#1B2559] break-all">{content}</div>}
      {list.length > 0 && (
        <div className="w-full overflow-y-auto">
          <div className="flex items-center gap-4">
            {list.map((attachment, index) => (
              <FileBlock key={index} file={attachment} />
            ))}
          </div>
        </div>
      )}
    </div>
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

const DocumentIssuesLabel = {
  [ICaseDocumentIssueStatus.VALID]: 'Resolved',
  [ICaseDocumentIssueStatus.HAS_CRITICAL_ISSUES]: 'Critical',
  [ICaseDocumentIssueStatus.HAS_WARNINGS]: 'Critical',
};

export const ActionLabel = (
  conversationType: ICaseConversationType,
  payload: {
    status?: ICaseDocumentIssueStatus;
    message?: ICaseConversationItem;
  }
) => {
  const { status, message } = payload;
  const autoFillingInfo = useMemo(() => {
    if (message?.metadata?.pilotInfo?.pilotStatus === PilotStatusEnum.HOLD) {
      return autoFillingInfoMaps['HOLD'];
    }
    return autoFillingInfoMaps['RUNNING'];
  }, [message?.metadata?.pilotInfo]);

  const config = useMemo(() => {
    const options: Record<
      string,
      { icon: () => ReactNode; label: () => string; styleClass: () => string }
    > = {
      [ICaseConversationType.EMAIL]: {
        icon: () => <Mail size={20} />,
        label: () => 'Drafting',
        styleClass: () => 'info',
      },
      [ICaseConversationType.SUMMARY]: {
        icon: () =>
          ActionIcons[status as ICaseDocumentIssueStatus] ?? <IconQuestionCircle />,
        label: () => DocumentIssuesLabel[status as ICaseDocumentIssueStatus],
        styleClass: () => DocumentIssuesStyles[status as ICaseDocumentIssueStatus],
      },
      [ICaseConversationType.AUTO_FILLING]: {
        icon: () => autoFillingInfo.icon,
        label: () => autoFillingInfo.label,
        styleClass: () => autoFillingInfo.className,
      },
    };
    return options[conversationType] ?? {};
  }, [conversationType, autoFillingInfo]);

  return (
    <div
      className={cn(
        'min-w-[113px] message-label w-fit px-2 rounded h-7 flex items-center justify-center gap-1 text-sm !font-normal',
        config.styleClass?.()
      )}
    >
      {config.icon?.()}
      {config.label?.()}
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
      {ActionLabel(ICaseConversationType.SUMMARY, {
        status: documentIssues.status,
      })}
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

const autoFillingInfoMaps = {
  HOLD: {
    className: 'warning',
    icon: <IconBroadcast size={20} />,
    label: 'Action Required',
    message: 'Autofill has paused and needs your input to continue.',
  },
  RUNNING: {
    className: 'info',
    icon: <Loader size={20} className="animate-spin" />,
    label: 'Running',
    message: 'Auto-filling Your Application',
  },
};

const CaseLoggerAutoFillingAction = (
  props: { pilotInfo: IPilotType | null } & HTMLAttributes<HTMLDivElement>
) => {
  const autoFillingInfo = useMemo(() => {
    if (props.pilotInfo?.pilotStatus === PilotStatusEnum.HOLD) {
      return autoFillingInfoMaps['HOLD'];
    }
    return autoFillingInfoMaps['RUNNING'];
  }, [props.pilotInfo]);
  return (
    <div
      className={cn(
        'w-full conversation-message rounded-[6px] h-11 p-2 hover:cursor-pointer transition-all flex items-center gap-4 warning',
        autoFillingInfo.className
      )}
      onClick={props.onClick}
    >
      <div
        className={cn(
          'min-w-[113px] message-label w-fit px-2 rounded h-7 flex items-center justify-center gap-1 text-sm !font-normal text-nowrap',
          autoFillingInfo.className
        )}
      >
        {autoFillingInfo.icon}
        {autoFillingInfo.label}
      </div>
      <div className="line-clamp-1">{autoFillingInfo.message}</div>
      <span className="flex-1"></span>
      <ChevronRight size={20} />
    </div>
  );
};

const PureCaseGrapher = ({
  data,
  className,
  onActionEmit,
  workflowOptions,
}: {
  data: ICaseConversationItem;
  active?: boolean;
  className?: string;
  workflowOptions?: Record<string, any>;
  onActionEmit: (params: {
    threadId: string;
    message: ICaseConversationItem;
    documentIssues?: ICaseDocumentIssueItem;
    [key: string]: any;
  }) => void;
}) => {
  const { messageType, id } = data;
  const grapherRender = (type: ICaseMessageType) => {
    switch (type) {
      case ICaseMessageType.ASSISTANT:
        return (
          <ServerCaseLogger
            message={data}
            workflowOptions={workflowOptions}
            onActionEmit={onActionEmit}
          />
        );
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
