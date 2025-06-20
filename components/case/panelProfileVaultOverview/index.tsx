import { ICaseItemType } from '@/types/case';
import { memo } from 'react';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';
import { PanelProfileVaultDocuments } from '../panelProfileVaultDocuments';
import { PanelProfileVaultInformationChecklist } from '../panelProfileVaultInformation';

type PurePanelProfileVaultOverviewProps = ICaseItemType;

function PurePanelProfileVaultOverview({
  documentChecklist,
  id,
  profileChecklist,
}: PurePanelProfileVaultOverviewProps) {
  return (
    <div className="w-full flex flex-col gap-8">
      <PanelProfileVaultDashboard
        documentChecklist={documentChecklist}
        profileChecklist={profileChecklist}
      />
      <PanelProfileVaultInformationChecklist {...profileChecklist} caseId={id} />
      <PanelProfileVaultDocuments {...documentChecklist} caseId={id} />
    </div>
  );
}

export const PanelProfileVaultOverview = memo(PurePanelProfileVaultOverview);
