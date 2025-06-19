'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { IconExtensionStart, IconExtensionStop } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType, IProfileVaultDocumentType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { Button, Card } from 'antd';
import { memo, useEffect, useState } from 'react';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  pilotInfo: IPilotType | null;
  isFold: boolean;
  onShowInstallExtension: () => void;
  onShowNewWorkflow: () => void;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const {
    caseInfo = null,
    pilotInfo,
    isFold,
    onShowInstallExtension,
    onShowNewWorkflow,
  } = props;

  const [profileVaultDocumentList, setProfileVaultDocumentList] = useState<
    IProfileVaultDocumentType[]
  >([]);

  const { extensionsInfo } = useExtensionsStore();

  useEffect(() => {
    const profileVaultDocumentListTmp =
      caseInfo?.documents?.map((itemDocument: any) => {
        let metadataForFrontObject: Record<string, unknown> = {};

        try {
          metadataForFrontObject = itemDocument.metadataJson
            ? JSON.parse(itemDocument.metadataJson)
            : {};
        } catch (error) {
          console.error('PurePanelProfileVault parse', error);
        }

        return {
          ...itemDocument,
          metadataForFrontList: Object.keys(metadataForFrontObject).map((key: string) => {
            return {
              key,
              value: JSON.stringify(metadataForFrontObject[key]),
            };
          }),
        };
      }) || [];

    setProfileVaultDocumentList(profileVaultDocumentListTmp);
  }, [caseInfo?.timestamp, caseInfo?.documents]);

  const handleBtnDraftEmailClick = () => {
    console.log('handleBtnDraftEmailClick');
  };

  const handleBtnExtensionClick = () => {
    if (!extensionsInfo?.version) {
      onShowInstallExtension?.();
      return;
    }

    onShowNewWorkflow?.();
  };

  return (
    <PanelContainer
      title="Profile vault"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <div className="mt-2 flex flex-row items-center justify-between gap-2.5">
            <Button
              type="default"
              className="h-9 flex-1"
              onClick={handleBtnDraftEmailClick}
            >
              <span className="font-bold">Draft email</span>
            </Button>
            <Button
              type="primary"
              className="h-9 flex-1"
              onClick={handleBtnExtensionClick}
            >
              {pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD ? (
                <IconExtensionStart />
              ) : (
                <IconExtensionStop />
              )}
              <span className="font-bold">Start auto-fill</span>
            </Button>
          </div>
        );
      }}
    >
      <div
        className={cn('flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0')}
      >
        {profileVaultDocumentList?.map((itemDocument, indexDocument) => {
          return (
            <Card key={`case-stream-document-${indexDocument}`}>
              <div>
                <span className="font-bold">{indexDocument + 1}.</span>
                <span className="">{itemDocument.title}</span>
              </div>
              <div className="font-bold">{itemDocument.documentType}</div>
              {itemDocument.metadataForFrontList?.map(
                (itemMetadata: any, indexMetadata: any) => {
                  return (
                    <div
                      key={`case-stream-document-metadata-${indexMetadata}`}
                      className="flex flex-row gap-2"
                    >
                      <div className="flex-[0_0_auto] max-w-[50%] text-xs font-semibold whitespace-pre-wrap">
                        {itemMetadata.key}:
                      </div>
                      <div className="flex-1 text-xs whitespace-pre-wrap">
                        {itemMetadata.value}
                      </div>
                    </div>
                  );
                }
              )}
            </Card>
          );
        })}
      </div>
    </PanelContainer>
  );
}

export const PanelProfileVault = memo(PurePanelProfileVault);
