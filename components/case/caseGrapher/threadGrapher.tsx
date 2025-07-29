import { CopyButton } from '@/components/common/copyButton';
import { Button } from '@/components/ui/button';
import { useEventManager } from '@/hooks/useEventManager';
import { IgnoreIssues } from '@/service/api';
import {
  ICaseConversationAction,
  ICaseConversationItem,
  ICaseConversationType,
  ICaseDocumentIssue,
  ICaseDocumentIssueItem,
  ICaseMessageType,
} from '@/types/case';
import { cn } from '@/utils';
import { ExternalLink, Loader2 } from 'lucide-react';
import { memo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CaseActionLogWrapper, ClientCaseLogger } from '.';
import { SiteLogo } from '../siteLogo';

const ThreadServerCaseLogger = (props: {
  message: ICaseConversationItem;
  caseId: string;
  onActionEmit?: (params: {
    threadId: string;
    documentIssues?: ICaseDocumentIssueItem;
    message: ICaseConversationItem;
  }) => void;
}) => {
  const { message, caseId } = props;

  const renderAction = (msg: ICaseConversationItem) => {
    const { conversationType, documentIssues, metadata } = msg;
    const { pilotInfo } = metadata ?? {};
    if (conversationType === ICaseConversationType.AUTO_FILLING) {
      return (
        <>
          <div className="w-full flex justify-end items-center">
            <Button
              variant="outline"
              disabled={!pilotInfo?.pilotTabInfo?.id}
              onClick={() => {
                if (!!pilotInfo?.pilotTabInfo?.id) {
                  const messageJump = {
                    type: 'ginkgoo-page-background-tab-update',
                    tabId: pilotInfo?.pilotTabInfo?.id,
                    updateProperties: { active: true },
                  };
                  window.postMessage(messageJump, window.location.origin);

                  const messageOpenSidepanel = {
                    type: 'ginkgoo-page-background-sidepanel-open',
                    options: {
                      tabId: pilotInfo?.pilotTabInfo?.id,
                    },
                  };
                  window.postMessage(messageOpenSidepanel, window.location.origin);
                }
              }}
            >
              <ExternalLink size={16} />
              Proceed to Government Portal
            </Button>
          </div>
        </>
      );
    }
    if (conversationType === ICaseConversationType.EMAIL) {
      return CopyButton({ message: message.content });
    }
    if (conversationType === ICaseConversationType.ISSUE) {
      return (
        <>
          {(documentIssues ?? []).length > 0 && (
            <>
              <div className="w-full flex flex-row gap-2 justify-end">
                {documentIssues.map(item => {
                  const { actions, issues } = item;
                  return actions.map((act, index) => (
                    <div key={index}>{IssueActionButton(act, caseId, issues)}</div>
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
      <div className="dark:text-foreground text-[#1B2559] flex flex-col gap-2">
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        {message.conversationType === ICaseConversationType.ISSUE ? (
          <>
            {(message.documentIssues ?? []).map(item =>
              (item.issues ?? []).map(issue => (
                <Markdown key={issue.id} remarkPlugins={[remarkGfm]}>
                  {issue.message}
                </Markdown>
              ))
            )}
          </>
        ) : null}
      </div>
      <div className="mt-2">{renderAction(message)}</div>
    </>
  );
};

const IssueActionButton = (
  issueAction: ICaseConversationAction,
  caseId: string,
  issues: ICaseDocumentIssue[]
) => {
  const [submitting, setSubmitting] = useState(false);
  const { emit } = useEventManager('ginkgoo-thread', () => {});

  const handleIssueAction = (params: ICaseConversationAction) => {
    const { action } = params;
    if (action === 'IGNORE_ISSUE') {
      handleIgnoreIssues(caseId, {
        issueIds: (issues ?? []).map(is => is.id),
      });
      return;
    }
    if (action === 'UPLOAD_DOCUMENTS') {
      handleUploadDocuments();
      return;
    }
  };

  const handleIgnoreIssues = async (
    caseId: string,
    params: { issueIds: string[]; reason?: string }
  ) => {
    if (!params.issueIds.length) return;
    setSubmitting(true);
    try {
      const res = await IgnoreIssues(caseId, params);
      if (res.success) {
        emit({
          type: 'event: ignoreIssues',
          data: {},
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocuments = async () => {
    emit({
      type: 'event: uploadDocuments',
      data: {},
    });
  };

  return (
    <Button
      variant="outline"
      disabled={submitting}
      onClick={() => handleIssueAction(issueAction)}
    >
      {submitting && <Loader2 className="animate-spin" size={16} />}
      {issueAction.label}
    </Button>
  );
};

const PureThreadGrapher = ({
  data,
  className,
  onActionEmit,
  caseId,
}: {
  data: ICaseConversationItem;
  active?: boolean;
  className?: string;
  caseId: string;
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
        return (
          <ThreadServerCaseLogger
            caseId={caseId}
            message={data}
            onActionEmit={onActionEmit}
          />
        );
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
