import { memo } from 'react';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';
import { PanelProfileVaultDocuments } from '../panelProfileVaultDocuments';
import { PanelProfileVaultInformationChecklist } from '../panelProfileVaultInformation';

type PurePanelProfileVaultOverviewProps = {
  documentChecklist: any;
};

function PurePanelProfileVaultOverview({
  documentChecklist,
}: PurePanelProfileVaultOverviewProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <PanelProfileVaultDashboard />
      <PanelProfileVaultInformationChecklist />
      <PanelProfileVaultDocuments {...documentChecklist} />
    </div>
  );
}

export const PanelProfileVaultOverview = memo(PurePanelProfileVaultOverview);
