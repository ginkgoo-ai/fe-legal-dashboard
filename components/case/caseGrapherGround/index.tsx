import { Button } from '@/components/ui/button';
import {
  ICaseConversationAction,
  ICaseConversationItem,
  ICaseItemType,
} from '@/types/case';
import { cn } from '@/utils';
import { Splitter } from 'antd';
import { X } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';
import { MainGrapherGround } from './mainGrapherGround';

type CaseGrapherGroundProps = {
  caseInfo: ICaseItemType;
  bottomPadding?: number;
} & HTMLAttributes<HTMLDivElement>;

export const CaseGrapherGround = (props: CaseGrapherGroundProps) => {
  const { caseInfo, bottomPadding } = props;

  // 右侧面板状态
  const [sizeRightPanel, setSizeRightPanel] = useState<string | number>('0%');
  const [sizeLeftPanel, setSizeLeftPanel] = useState<string | number>('100%');
  const [pandelGap, setPanelGap] = useState('0px');

  // 当前选中的对话
  const [currentConversation, setCurrentConversation] = useState<{
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  } | null>(null);

  // 处理消息操作
  const handleMessageAction = (params: {
    message: ICaseConversationItem;
    action: ICaseConversationAction;
  }) => {
    setCurrentConversation(params);
  };

  // 处理右侧面板显示/隐藏
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
    <div className={cn('w-full h-full flex flex-col gap-4 pb-8', props.className)}>
      <PanelProfileVaultDashboard caseInfo={props.caseInfo} />

      <div className="h-[calc(100%_-_98px)]">
        <Splitter
          lazy={false}
          style={{
            gap: pandelGap,
          }}
        >
          {/* 左侧消息面板 */}
          <Splitter.Panel
            resizable={false}
            size={sizeLeftPanel}
            className={cn('relative rounded flex-col flex h-full transition-all')}
          >
            {caseInfo?.id && (
              <MainGrapherGround
                caseId={caseInfo.id}
                paddingBottom={bottomPadding}
                emitMessageAction={handleMessageAction}
              />
            )}
            {props.children}
          </Splitter.Panel>

          {/* 右侧详情面板 */}
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
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentConversation.message.content}
                </div>
              </SecondaryGrapherContainer>
            </Splitter.Panel>
          )}
        </Splitter>
      </div>
    </div>
  );
};

// 右侧面板容器组件
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
      <div className="p-4 h-[calc(100%-73px)] overflow-auto">{children}</div>
    </div>
  );
};
