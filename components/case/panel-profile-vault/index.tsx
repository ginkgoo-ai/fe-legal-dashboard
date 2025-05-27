import { PanelContainer } from '@/components/case/panel-container';
import { IProfileVaultDocumentType } from '@/types';
import { Card } from 'antd';
import { memo } from 'react';

interface PanelProfileVaultProps {
  profileVaultDocumentList?: IProfileVaultDocumentType[];
}

function PurePanelProfileVault(props: PanelProfileVaultProps) {
  const { profileVaultDocumentList = [] } = props;

  return (
    <PanelContainer title="Profile vault" showTitle={true}>
      <>
        {profileVaultDocumentList?.map((itemDocument, indexDocument) => {
          return (
            <Card key={`case-stream-document-${indexDocument}`}>
              <div>
                <span className="font-bold">{indexDocument + 1}.</span>
                <span className="">{itemDocument.title}</span>
              </div>
              <div>{itemDocument.description}</div>
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
      </>
    </PanelContainer>
  );
}

export const PanelProfileVault = memo(PurePanelProfileVault);
