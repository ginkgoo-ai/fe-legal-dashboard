'use client';

import React, { memo } from 'react';

interface PanelContainerProps {
  title: string;
  showTitle: boolean;
  renderTitleExtend?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  children: React.ReactNode;
}

function PurePanelContainer(props: PanelContainerProps) {
  const { title, showTitle, renderTitleExtend, renderHeader, renderFooter, children } =
    props;

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col">
      <div className="flex flex-row p-4 justify-center items-center h-[66px] flex-[0_0_auto]">
        {showTitle && (
          <div className="text-base font-semibold flex-1 text-[#1F2937]">{title}</div>
        )}
        {renderTitleExtend?.()}
      </div>
      <div className="flex flex-row px-4 justify-center items-center flex-[0_0_auto]">
        {renderHeader?.()}
      </div>
      <div className="flex flex-col overflow-y-auto box-border flex-1 h-0">
        {children}
      </div>
      <div className="flex flex-row px-4 justify-center items-center flex-[0_0_auto]">
        {renderFooter?.()}
      </div>
    </div>
  );
}

export const PanelContainer = memo(PurePanelContainer);
