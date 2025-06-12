import { PanelContainer } from '@/components/case/panelContainer';
import { cn } from '@/lib/utils';
import { ICaseItemType, IProfileVaultDocumentType } from '@/types';
import { Card } from 'antd';
import { memo, useEffect, useState } from 'react';

interface PanelProfileVaultProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const { caseInfo = null, isFold } = props;

  const [profileVaultDocumentList, setProfileVaultDocumentList] = useState<
    IProfileVaultDocumentType[]
  >([]);

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

  return (
    <PanelContainer title="Profile vault" showTitle={!isFold}>
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
