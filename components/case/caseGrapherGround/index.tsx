import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getHistoryConversation } from '@/service/api';
import {
  ICaseConversationAction,
  ICaseConversationItem,
  ICaseItemType,
} from '@/types/case';
import { cn } from '@/utils';
import { Splitter } from 'antd';
import { X } from 'lucide-react';
import { HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { CaseGrapher } from '../caseGrapher';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';

type CaseGrapherGroundProps = {
  caseInfo: ICaseItemType;
  bottomPadding?: number;
} & HTMLAttributes<HTMLDivElement>;

export const CaseGrapherGround = (props: CaseGrapherGroundProps) => {
  const { caseInfo, bottomPadding } = props;
  const [sizeRightPanel, setSizeRightPanel] = useState<string | number>('0%');
  const [sizeLeftPanel, setSizeLeftPanel] = useState<string | number>('100%');
  const [pandelGap, setPanelGap] = useState('0px');
  const [conversations, setConversations] = useState<ICaseConversationItem[]>([]);
  const [currentConversation, setCurrentConversation] = useState<{
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const getConversations = useCallback(async () => {
    setLoading(true);
    const res = await getHistoryConversation(caseInfo!.id, { page: 0, size: 50 });
    if (res?.messages) {
      setConversations(res.messages);
    }
    setLoading(false);
  }, [caseInfo]);

  useEffect(() => {
    if (caseInfo?.id) {
      getConversations();
    }
  }, [caseInfo, getConversations]);

  const handleMessageAction = (params: {
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  }) => {
    if (params) {
      setCurrentConversation(params);
    }
  };

  useEffect(() => {
    if (currentConversation) {
      setSizeLeftPanel('50%');
      setSizeRightPanel('50%');
      setPanelGap('12px');
    } else {
      setSizeLeftPanel('100%');
      setSizeRightPanel('0%');
      setPanelGap('0');
    }
  }, [currentConversation]);

  return (
    <div className={cn('w-full h-full flex flex-col gap-2 pb-8', props.className)}>
      <PanelProfileVaultDashboard caseInfo={props.caseInfo} />
      <div className="h-[calc(100%_-_98px)]">
        <Splitter
          lazy={false}
          style={{
            gap: pandelGap,
          }}
        >
          <Splitter.Panel
            resizable={false}
            size={sizeLeftPanel}
            className={cn(
              'relative rounded flex-col flex h-full transition-all duration-200'
            )}
          >
            <div className="h-full overflow-auto">
              <div
                className="flex flex-col gap-4"
                style={{
                  paddingBottom: `${bottomPadding ?? 0}px`,
                }}
              >
                {conversations.map(con => {
                  return (
                    <CaseGrapher
                      data={con}
                      key={con.id}
                      onActionEmit={handleMessageAction}
                    />
                  );
                })}
                {loading && (
                  <>
                    <Skeleton className="h-[120px] bg-gray-300 dark:bg-gray-600 w-full rounded-xl" />
                    <Skeleton className="h-[120px] bg-gray-300 dark:bg-gray-600 w-full rounded-xl" />
                    <Skeleton className="h-[120px] bg-gray-300 dark:bg-gray-600 w-full rounded-xl" />
                  </>
                )}
                <div>{props.children}</div>
              </div>
            </div>
          </Splitter.Panel>
          {currentConversation && (
            <Splitter.Panel
              resizable={false}
              size={sizeRightPanel}
              className={cn(
                'bg-panel-background relative rounded-2xl flex-col flex border transition-all duration-200'
              )}
            >
              <SecondaryGrapherContainer
                title={() => (
                  <div className="flex items-center flex-1 font-semibold text-base">
                    {currentConversation.message.title}
                  </div>
                )}
                onCloseEmit={() => setCurrentConversation(null)}
              >
                <div>TODO content: {currentConversation.message.content}</div>
              </SecondaryGrapherContainer>
            </Splitter.Panel>
          )}
        </Splitter>
      </div>
    </div>
  );
};

const SecondaryGrapherContainer = ({
  title,
  onCloseEmit,
  children,
}: {
  title: () => React.ReactNode;
  onCloseEmit: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl w-full h-full">
      <div className="border-b p-4 relative">
        <div className="min-h-9 flex flex-col">{title()}</div>
        <Button
          onClick={onCloseEmit}
          variant={'ghost'}
          size={'icon'}
          className="absolute top-4 right-4"
        >
          <X />
        </Button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};
