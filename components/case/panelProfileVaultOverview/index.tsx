import { ICaseItemType } from '@/types/case';
import { memo } from 'react';
import { PanelProfileVaultInfoChecklist } from '../panelProfileVaultInfoChecklist';

type PurePanelProfileVaultOverviewProps = ICaseItemType;

function PurePanelProfileVaultOverview({
  id,
  profileChecklist,
}: PurePanelProfileVaultOverviewProps) {
  return (
    <div className="w-full flex flex-col gap-8">
      <PanelProfileVaultInfoChecklist {...profileChecklist} caseId={id} />
    </div>
  );
}

export const PanelProfileVaultOverview = memo(PurePanelProfileVaultOverview);
