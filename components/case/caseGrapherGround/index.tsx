import { ICaseItemType } from '@/types/case';
import { cn } from '@/utils';
import { Splitter } from 'antd';
import { HTMLAttributes, useState } from 'react';
import { CaseGrapher } from '../caseGrapher';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';

type CaseGrapherGroundProps = {
  caseInfo: ICaseItemType;
} & HTMLAttributes<HTMLDivElement>;

export const CaseGrapherGround = (props: CaseGrapherGroundProps) => {
  const [sizeRightPanel, setSizeRightPanel] = useState<string | number>('0%');
  const [sizeLeftPanel, setSizeLeftPanel] = useState<string | number>('100%');

  const handleSplitterResize = (sizes: number[]) => {
    console.log(sizes);
    // console.log('handleSplitterResize', sizes);
    const [left, right] = sizes || [];

    setSizeLeftPanel(left);
    if (typeof right === 'number' && right >= 0) {
      setSizeRightPanel(right);
    }
  };

  const handleToggle = () => {
    setSizeLeftPanel('50%');
    setSizeRightPanel('50%');
  };

  return (
    <div className={cn('w-full h-full flex flex-col gap-2', props.className)}>
      <PanelProfileVaultDashboard caseInfo={props.caseInfo} />
      <div className="h-[calc(100%_-_98px)]">
        <Splitter
          lazy={false}
          style={{
            gap: '12px',
          }}
          onResize={handleSplitterResize}
        >
          <Splitter.Panel
            resizable={false}
            size={sizeLeftPanel}
            className={cn('relative rounded-2xl flex-col flex h-full overflow-auto', {
              'transition-all duration-200': true,
            })}
          >
            <div className="h-full overflow-auto">
              <div className="relative pb-28">
                <CaseGrapher />
              </div>
              <div>{props.children}</div>
            </div>
          </Splitter.Panel>
          <Splitter.Panel
            resizable={false}
            size={sizeRightPanel}
            className={cn('bg-panel-background relative rounded-2xl flex-col flex ', {
              'transition-all duration-200': true,
            })}
          >
            right
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
};
