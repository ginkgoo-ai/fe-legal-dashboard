'use client';

import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { Button } from '@/components/ui/button';
import {
  IconToolbeltDraftEmail,
  IconToolbeltStartExtensions,
  IconToolbeltUpload,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import LockManager from '@/customManager/LockManager';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/service/api/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { message as messageAntd } from 'antd';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { memo, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import './index.css';

interface ToolbeltProps {
  caseId: string;
  // onBtnUploadClick: () => void;
  // onBtnDraftEmail: () => void;
  // onBtnStartClick: () => void;
}

function PureToolbelt(props: ToolbeltProps) {
  const {
    caseId,
    // onBtnUploadClick, onBtnDraftEmail, onBtnStartClick
  } = props || {};

  const [fileList, setFileList] = useStateCallback<IFileItemType[]>([]);

  useEventManager('ginkgoo-sse', async message => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      // case 'event:init': {
      //   const { data: dataMsg } = message || {};
      //   const { documents } = dataMsg || {};

      //   setFileList(() => {
      //     return (
      //       documents?.map((item: ICaseDocumentInitResultType) => ({
      //         localId: uuid(),
      //         status: item.status,
      //         documentInitResultFile: item,
      //       })) || []
      //     );
      //   });
      //   setFileLoading(false);

      //   break;
      // }
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
                    return (
                      file.documentInitResultFile?.id === documentId || // for init
                      file.documentFile?.documentId === documentId // for add
                    );
                  });
                  if (indexFile >= 0) {
                    draft[indexFile].status = status;
                  } else {
                    draft.push({
                      localId: uuid(),
                      status: status,
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

  useEffect(() => {
    const fileListTmp: IFileItemType[] = [
      {
        localId: '0147d714-620b-47fd-ba6a-8b323490c41d',
        status: 'COMPLETED',
        localFile: {},
        documentFile: {
          success: true,
          documentId: 'e179541d-2d37-4faf-b850-8cc115c49c08',
          caseId: 'c1ed8742-c58b-404a-b4ae-c6410bd8ef73',
          message: 'Document received and processing started',
          filename: 'example-of-ielts-test-report-form.jpg',
          fileSize: 71947,
          fileType: 'image/jpeg',
          description: null,
          receivedAt: '2025-07-10T09:56:27.814Z',
          errorCode: null,
          errorDetails: null,
        },
      },
      {
        localId: 'd3f7e7c7-043f-4eab-9090-7447a8d49f38',
        status: 'UPLOAD_COMPLETED',
        localFile: {},
        documentFile: {
          success: true,
          documentId: '0ecca232-72bc-4db7-ac6c-39c813088fe1',
          caseId: 'c1ed8742-c58b-404a-b4ae-c6410bd8ef73',
          message: 'Document received and processing started',
          filename: 'ielts.jpg',
          fileSize: 201511,
          fileType: 'image/jpeg',
          description: null,
          receivedAt: '2025-07-10T09:56:27.854Z',
          errorCode: null,
          errorDetails: null,
        },
      },
      {
        localId: '025c25e1-f939-4731-bad4-cc10ca39e7a5',
        status: 'UPLOADING',
        localFile: {},
        documentFile: {
          success: true,
          documentId: '05ddbc7c-1085-4be8-89f7-709ca948069b',
          caseId: 'c1ed8742-c58b-404a-b4ae-c6410bd8ef73',
          message: 'Document received and processing started',
          filename: 'info for parents.pdf',
          fileSize: 98605,
          fileType: 'application/pdf',
          description: null,
          receivedAt: '2025-07-10T09:56:28.015Z',
          errorCode: null,
          errorDetails: null,
        },
      },
    ] as any;
    // setFileList(fileListTmp);
    // console.log('PureToolbelt', fileListTmp);
  }, []);

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
              file.status = FileStatus.UPLOADING;
              file.documentFile = resUploadDocument?.acceptedDocuments?.[indexNewFile];
            }
          });
        })
      );
      // await actionOcrFile(data.cloudFiles);
    } else {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_UPLOAD_FILE_FAILED,
      });
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            if (newFiles.some(newFile => newFile.localId === file.localId)) {
              file.status = FileStatus.FAILED;
            }
          });
        })
      );
    }
  };

  const handleFileChange = async (files: File[]) => {
    console.log('handleFileChange', files);
    if (files?.length > 10) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_UPLOAD_FILE_MAX,
      });
      return;
    }

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
    messageAntd.open({
      type: 'error',
      content: error,
    });
  };

  const handleBtnDraftEmail = () => {};

  const handleBtnStartClick = () => {};

  return (
    <div
      className={cn(
        'absolute bottom-6 left-[50%] -translate-x-1/2 bg-background flex flex-row items-center gap-[18px] toolbelt-wrap box-border py-[11px] px-[18px] rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)]',
        {
          'w-[80%]': fileList.length > 0,
        }
      )}
    >
      <Button
        variant="ghost"
        className="border border-solid border-[rgba(225, 225, 226, 1)] h-11 p-0"
      >
        <FileUploadSimple
          accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
          maxSize={50}
          onChange={handleFileChange}
          onError={handleFileError}
        >
          <div className="w-full h-full flex flex-row items-center gap-2 px-4 py-2 has-[>svg]:px-3 cursor-pointer">
            <IconToolbeltUpload />
            <span>Add reference</span>
          </div>
        </FileUploadSimple>
      </Button>
      <Button
        variant="ghost"
        className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
        onClick={handleBtnDraftEmail}
      >
        <IconToolbeltDraftEmail />
        <span>Draft email</span>
      </Button>
      <Button
        variant="ghost"
        className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
        onClick={handleBtnStartClick}
      >
        <IconToolbeltStartExtensions />
        <span>Start auto-fill</span>
      </Button>
    </div>
  );
}

export const Toolbelt = memo(PureToolbelt);
