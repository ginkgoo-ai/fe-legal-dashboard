'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import { IconFoldLeft } from '@/components/ui/icon';
import LockManager from '@/customManager/LockManager';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/service/api/case';
import { message as messageAntd } from 'antd';
// import { uploadFiles } from '@/service/api/file';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { ICaseItemType } from '@/types/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { produce } from 'immer';
import { memo } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

interface PanelReferenceProps {
  caseId: string;
  caseInfo: ICaseItemType | null;
  isFold: boolean;
  // onFileListUpdate: Dispatch<SetStateAction<IFileItemType[]>>;
  onBtnPanelLeftClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const { caseId, caseInfo, isFold, onBtnPanelLeftClick } = props;

  const [fileList, setFileList] = useStateCallback<IFileItemType[]>([]);

  useEventManager('ginkgoo-message', async message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg } = message;

    switch (typeMsg) {
      case 'event:documentStatusUpdate': {
        const { data: dataMsg } = message || {};

        const { status, documentId } = dataMsg || {};

        if (!!documentId) {
          const lockId = 'panel-reference-file-list';
          await LockManager.acquireLock(lockId);

          setFileList(
            prev =>
              produce(prev, draft => {
                draft.forEach(file => {
                  if (file.cloudFile?.documentId === documentId) {
                    file.status =
                      status === 'COMPLETED' ? FileStatus.DONE : FileStatus.ERROR;
                  }
                });
              }),
            () => {
              LockManager.releaseLock(lockId);
            }
          );
        }
        break;
      }
      default: {
        break;
      }
    }
  });

  // const actionOcrFile = async (cloudFiles: ICloudFileType[]) => {
  //   const data = await ocrDocuments({
  //     caseId,
  //     storageIds: cloudFiles.map(file => file.id),
  //   });

  //   if (data?.length > 0) {
  //     // nothing... async ocr...
  //   } else {
  //     toast.error('Analysis file failed.');
  //     setFileList(prev =>
  //       produce(prev, draft => {
  //         draft.forEach(file => {
  //           if (
  //             cloudFiles.some(cloudFile => {
  //               return cloudFile.id === file.cloudFile?.id;
  //             })
  //           ) {
  //             file.status = FileStatus.ERROR;
  //           }
  //         });
  //       })
  //     );
  //   }
  // };

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const res = await uploadDocument({
      caseId,
      files: newFiles.map(file => file.localFile!),
    });

    console.log('actionUploadFile', newFiles, res);

    if (res?.success) {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            const indexAccepted = res?.acceptedDocuments?.findIndex(
              acceptedFile => acceptedFile.filename === file.localFile?.name
            );
            if (indexAccepted >= 0) {
              file.status = FileStatus.UPLOADING;
              file.cloudFile = res?.acceptedDocuments?.[indexAccepted];
              return;
            }

            const indexRejected = res?.rejectedDocuments?.findIndex(
              rejectedFile => rejectedFile.filename === file.localFile?.name
            );
            if (indexRejected >= 0) {
              file.status = FileStatus.ERROR;
              file.cloudFile = res?.rejectedDocuments?.[indexRejected];
            }
          });
        })
      );
      // await actionOcrFile(data.cloudFiles);
    } else {
      messageAntd.open({
        type: 'error',
        content: 'Upload file failed.',
      });
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

  useEffectStrictMode(() => {
    console.log('caseInfo', caseInfo);
    if (fileList.length > 0) {
      return;
    }
    setFileList(() => {
      return (
        caseInfo?.documents?.map(item => ({
          localId: uuid(),
          status: FileStatus.DONE,
          ocrFile: item,
        })) || []
      );
    });
  }, [fileList, caseInfo?.documents]);

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

  // const handleFileRetry = async (indexFile: number) => {
  //   setFileList(prev =>
  //     produce(prev, draft => {
  //       draft[indexFile].status = FileStatus.UPLOADING;
  //     })
  //   );

  //   await actionUploadFile([fileList[indexFile]]);
  // };

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
              key={`reference-item-${indexFile}`}
              mode="Reference"
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
