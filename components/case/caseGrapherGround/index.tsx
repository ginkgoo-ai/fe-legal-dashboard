import {
  ICaseConversationItem,
  ICaseDocumentIssueItem,
  ICaseItemType,
} from '@/types/case';
import { cn } from '@/utils';
import { Splitter } from 'antd';
import { HTMLAttributes, useEffect, useState } from 'react';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';
import { MainGrapherGround } from './mainGrapherGround';
import { ThreadGrapherGround } from './threadGrapherGround';

type CaseGrapherGroundProps = {
  caseInfo: ICaseItemType;
  workflowOptions?: Record<string, any>;
  bottomPadding?: number;
} & HTMLAttributes<HTMLDivElement>;

export const CaseGrapherGround = (props: CaseGrapherGroundProps) => {
  const { caseInfo, bottomPadding, workflowOptions } = props;

  // 右侧面板状态
  const [sizeRightPanel, setSizeRightPanel] = useState<string | number>('0%');
  const [sizeLeftPanel, setSizeLeftPanel] = useState<string | number>('100%');
  const [pandelGap, setPanelGap] = useState('0px');

  // 当前选中的对话
  const [currentConversation, setCurrentConversation] = useState<{
    threadId: string;
    documentIssues: ICaseDocumentIssueItem;
    message: ICaseConversationItem;
    [key: string]: any;
  } | null>(null);

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
                activeMessage={currentConversation?.message ?? null}
                paddingBottom={bottomPadding}
                workflowOptions={workflowOptions}
                emitMessageAction={$event => {
                  setCurrentConversation(null);
                  setTimeout(() => {
                    setCurrentConversation($event);
                  }, 200);
                }}
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
              {currentConversation && (
                <ThreadGrapherGround
                  data={currentConversation}
                  caseId={caseInfo.id}
                  onCloseEmit={() => setCurrentConversation(null)}
                />
              )}
            </Splitter.Panel>
          )}
        </Splitter>
      </div>
    </div>
  );
};
