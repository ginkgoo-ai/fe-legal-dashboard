import { PanelContainer } from '@/components/case/panelContainer';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import { IconFoldLeft } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ocrDocuments } from '@/service/api';
import { uploadFiles } from '@/service/api/file';
import { ICaseItemType } from '@/types/case';
import { FileStatus, ICloudFileType, IFileItemType } from '@/types/file';
import { produce } from 'immer';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

interface PanelReferenceProps {
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  // onFileListUpdate: Dispatch<SetStateAction<IFileItemType[]>>;
  onBtnPanelLeftClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const { caseInfo, isFold, onBtnPanelLeftClick } = props;

  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  const actionOcrFile = async (cloudFiles: ICloudFileType[]) => {
    const data = await ocrDocuments({
      caseId: caseInfo?.id || '',
      storageIds: cloudFiles.map(file => file.id),
    });

    if (data?.length > 0) {
      // nothing... async ocr...
    } else {
      toast.error('Analysis file failed.');
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            if (
              cloudFiles.some(cloudFile => {
                return cloudFile.id === file.cloudFile?.id;
              })
            ) {
              file.status = FileStatus.ERROR;
            }
          });
        })
      );
    }
  };

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const data = await uploadFiles(
      newFiles.map(file => file.localFile!),
      {
        onUploadeProgress: (percentCompleted: number) => {
          // console.log('percentCompleted', percentCompleted);
        },
      }
    );
    if (data?.cloudFiles) {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            const indexNewFile = newFiles.findIndex(
              newFile => newFile.localId === file.localId
            );
            if (indexNewFile >= 0) {
              file.status = FileStatus.ANALYSIS;
              file.cloudFile = data.cloudFiles[indexNewFile];
            }
          });
        })
      );
      await actionOcrFile(data.cloudFiles);
    } else {
      toast.error('Upload file failed.');
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            if (newFiles.some(newFile => newFile.localId === file.localId)) {
              file.status = FileStatus.ERROR;
            }
          });
        })
      );
    }
  };

  useEffect(() => {
    setFileList(() => {
      return (
        caseInfo?.documents?.map(item => ({
          localId: uuid(),
          status: FileStatus.DONE,
          ocrFile: item,
        })) || []
      );
    });
  }, [caseInfo?.timestamp]);

  const handleFileChange = async (files: File[]) => {
    console.log('handleFileChange', files);
    const newFiles = files.map(file => ({
      localId: uuid(),
      status: FileStatus.UPLOADING,
      localFile: file,
    }));

    setFileList(prev =>
      produce(prev, draft => {
        draft.push(...newFiles);
      })
    );

    await actionUploadFile(newFiles);
  };

  const handleFileError = (error: string) => {
    toast.error(error);
  };

  const handleFileRetry = async (indexFile: number) => {
    setFileList(prev =>
      produce(prev, draft => {
        draft[indexFile].status = FileStatus.UPLOADING;
      })
    );

    await actionUploadFile([fileList[indexFile]]);
  };

  return (
    <PanelContainer
      title="Reference"
      showTitle={!isFold}
      renderTitleExtend={() => {
        return (
          <Button variant="ghost" onClick={onBtnPanelLeftClick}>
            <IconFoldLeft size={24} />
          </Button>
        );
      }}
      renderHeader={() => {
        return !isFold ? (
          <div className="flex flex-col py-4 w-full">
            <FileUploadSimple
              accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
              multiple
              maxSize={50}
              onChange={handleFileChange}
              onError={handleFileError}
            />
          </div>
        ) : null;
      }}
    >
      <div
        className={cn('flex flex-col overflow-y-auto px-4 pb-4 box-border flex-1 h-0', {
          'pt-4': true,
        })}
      >
        <div className="flex flex-col gap-8">
          {fileList.map((itemFile, indexFile) => (
            <ItemFile
              key={`reference-item-${indexFile}-${Math.random()}`}
              file={itemFile}
              isFold={isFold}
            />
          ))}
        </div>
      </div>
    </PanelContainer>
  );
}

export const PanelReference = memo(PurePanelReference);
