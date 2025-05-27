import React, { memo } from 'react';

interface PanelContainerProps {
  title: string;
  showTitle: boolean;
  renderHeaderExtend?: () => React.ReactNode;
  children: React.ReactNode;
}

function PurePanelContainer(props: PanelContainerProps) {
  const { title, showTitle, renderHeaderExtend, children } = props;

  return (
    <>
      <div className="flex flex-row p-4 justify-between items-center h-[66px] border-b flex-[0_0_auto]">
        {showTitle && (
          <div className="text-base font-semibold text-[#1F2937]">{title}</div>
        )}
        {renderHeaderExtend?.()}
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto box-border p-4 flex-1 h-0">
        {children}
      </div>
    </>
  );
}

export const PanelContainer = memo(PurePanelContainer);
