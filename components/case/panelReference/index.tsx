'use client';

import { PanelContainer } from '@/components/case/panelContainer';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import { IconFoldLeft } from '@/components/ui/icon';
import LockManager from '@/customManager/LockManager';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/service/api/case';
import { message as messageAntd, Spin } from 'antd';
// import { uploadFiles } from '@/service/api/file';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { FileStatus, ICaseDocumentInitResultType, IFileItemType } from '@/types/file';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { memo } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

interface PanelReferenceProps {
  caseId: string;
  isFold: boolean;
  // onFileListUpdate: Dispatch<SetStateAction<IFileItemType[]>>;
  onBtnPanelLeftClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const { caseId, isFold, onBtnPanelLeftClick } = props;

  const [fileList, setFileList] = useStateCallback<IFileItemType[]>([]);

  useEventManager('ginkgoo-message', async message => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case 'event:init': {
        const { data: dataMsg } = message || {};
        const { documents } = dataMsg || {};

        setFileList(() => {
          return (
            documents?.map((item: ICaseDocumentInitResultType) => ({
              localId: uuid(),
              status: item.status === 'COMPLETED' ? FileStatus.DONE : FileStatus.ERROR,
              documentInitResultFile: item,
            })) || []
          );
        });

        break;
      }
      case 'event:documentStatusUpdate': {
        const { data: dataMsg } = message || {};

        const { status, documentId } = dataMsg || {};

        if (!!documentId) {
          const lockId = 'panel-reference-file-list';
          await LockManager.acquireLock(lockId);

          setFileList(
            prev =>
              cloneDeep(
                produce(prev, draft => {
                  const indexFile = draft.findIndex(file => {
                    return file.documentFile?.documentId === documentId;
                  });
                  if (indexFile >= 0) {
                    draft[indexFile].status =
                      status === 'COMPLETED' ? FileStatus.DONE : FileStatus.ERROR;
                  } else {
                    draft.push({
                      localId: uuid(),
                      status: status === 'COMPLETED' ? FileStatus.DONE : FileStatus.ERROR,
                      documentFile: dataMsg,
                    });
                  }
                })
              ),
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

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const resUploadDocument = await uploadDocument({
      caseId,
      files: newFiles.map(file => file.localFile!),
    });

    // console.log('actionUploadFile', newFiles, resUploadDocument);

    if (resUploadDocument?.acceptedDocuments) {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            const indexNewFile = newFiles.findIndex(
              newFile => newFile.localId === file.localId
            );

            if (indexNewFile >= 0) {
              file.status = FileStatus.ANALYSIS;
              file.documentFile = resUploadDocument?.acceptedDocuments?.[indexNewFile];
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
        {fileList.length > 0 ? (
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
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <Spin tip="Loading" size="small">
              <div className="w-20 h-20"></div>
            </Spin>
          </div>
        )}
      </div>
    </PanelContainer>
  );
}

export const PanelReference = memo(PurePanelReference);
