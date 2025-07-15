'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { ItemFile } from '@/components/common/itemFile';
import { IconLogo } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
// import { uploadFiles } from '@/service/api/file';
import { Button } from '@/components/ui/button';
import { useStateCallback } from '@/hooks/useStateCallback';
import { ICaseItemType } from '@/types/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

interface PanelReferenceProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  oBtnCloseClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const { caseInfo, isFold, oBtnCloseClick } = props;

  const [isFileLoading, setFileLoading] = useState<boolean>(true);
  const [fileList, setFileList] = useStateCallback<IFileItemType[]>([]);

  useEffect(() => {
    if (caseInfo?.documents) {
      const fileListTmp =
        caseInfo?.documents?.map(itemDoc => {
          return {
            localId: uuid(),
            status: FileStatus.COMPLETED,
            ocrFile: itemDoc,
          };
        }) || [];

      setFileList(fileListTmp);
      setFileLoading(false);
    }
  }, [caseInfo, setFileList, setFileLoading]);

  return (
    <PanelContainer
      title="Reference"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <Button
            type="button"
            variant="ghost"
            className={cn('w-9 h-9 flex-shrink-0 cursor-pointer')}
            onClick={oBtnCloseClick}
          >
            <X size={24} />
          </Button>
        );
      }}
    >
      <div
        className={cn('flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0', {
          'pt-4': false,
        })}
      >
        {isFileLoading ? (
          <div className="w-full h-full flex flex-col justify-center items-center text-primary">
            <IconLogo size={24} className="animate-spin mb-2 animation-duration-[2s]" />

            {!isFold && <p className="after:animate-point-loading">Loading</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {fileList?.map((itemFile, indexFile) => (
              <ItemFile
                key={`reference-item-${indexFile}`}
                mode="Reference"
                file={itemFile}
                isFold={isFold}
              />
            ))}
          </div>
        )}
      </div>
    </PanelContainer>
  );
}

export const PanelReference = memo(PurePanelReference);
