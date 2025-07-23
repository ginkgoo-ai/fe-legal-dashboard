'use client';

import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile, ItemFileModeEnum } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import { IconActionBarSend, IconActionBarUpload } from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useStateCallback } from '@/hooks/useStateCallback';
import { cn } from '@/lib/utils';
import { uploadDocumentOnlyUpload } from '@/service/api/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { message as messageAntd } from 'antd';
import { produce } from 'immer';
import { LoaderCircle } from 'lucide-react';
import { memo, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

interface InputMultimodalProps {
  caseId: string;
  name: string;
  placeholderDescription: string;
  isShowBtnUpload: boolean;
  isLoadingBtnSend: boolean;
  verifyList: (string | boolean)[]; // 'fileList' | 'description' | 自定义校验结果 通过为true ，未通过为false
  initFileListForActionUpload?: File[];
  renderFileListBefore?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  onBtnSendClick?: (params: { fileList: IFileItemType[]; description: string }) => void;
}

function PureInputMultimodal(props: InputMultimodalProps) {
  const {
    caseId,
    name,
    placeholderDescription = 'Give your files a brief description.',
    isShowBtnUpload,
    isLoadingBtnSend,
    verifyList = [],
    initFileListForActionUpload,
    renderFileListBefore,
    renderFooter,
    onBtnSendClick,
  } = props;

  const [fileList, setFileList] = useStateCallback<IFileItemType[]>([]);
  const [description, setDescription] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabledBtnSend = useMemo(() => {
    let result = !fileList.every(file => {
      return [FileStatus.COMPLETED, FileStatus.UPLOAD_COMPLETED].includes(file.status);
    });

    verifyList.forEach(value => {
      if (value === 'fileList') {
        result = result || !(fileList.length > 0);
      } else if (value === 'description') {
        result = result || !description;
      } else {
        result = result || !value;
      }
    });

    return result;
  }, [verifyList, fileList, description]);

  useEffectStrictMode(() => {
    if (Number(initFileListForActionUpload?.length) > 0) {
      // console.log('===initFileListForActionUpload', initFileListForActionUpload);
      handleFileChange(initFileListForActionUpload as File[]);
    }
  }, [initFileListForActionUpload]);

  const actionUploadFileOnly = async (file: IFileItemType) => {
    const resUploadDocument = await uploadDocumentOnlyUpload({
      caseId,
      file: file.localFile!,
    });

    // console.log('actionUploadFiles', newFiles, resUploadDocument);

    if (resUploadDocument?.documentId) {
      setFileList(prev =>
        produce(prev, draft => {
          const currentIndex = draft.findIndex(itemPrev => {
            return itemPrev.localId === file.localId;
          });

          if (currentIndex >= 0) {
            draft[currentIndex].status = FileStatus.UPLOAD_COMPLETED;
            draft[currentIndex].documentFile = resUploadDocument;
          }
        })
      );
    } else {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_UPLOAD_FILE_FAILED,
      });
      setFileList(prev =>
        produce(prev, draft => {
          const currentIndex = draft.findIndex(itemPrev => {
            return itemPrev.localId === file.localId;
          });

          if (currentIndex >= 0) {
            draft[currentIndex].status = FileStatus.UPLOAD_FAILED;
          }
        })
      );
    }
  };

  const actionUploadFiles = async (newFiles: IFileItemType[] = []) => {
    for (const newFile of newFiles) {
      actionUploadFileOnly(newFile);
    }
  };

  const handleFileBtnDeleteClick = (index: number) => {
    setFileList(prev =>
      produce(prev, draft => {
        draft.splice(index, 1);
      })
    );
  };

  const handleFileBtnReuploadClick = (index: number) => {
    setFileList(prev =>
      produce(prev, draft => {
        const file = draft[index];
        if (file) {
          file.status = FileStatus.UPLOADING;
        }
      })
    );

    actionUploadFiles([fileList[index]]);
  };

  const handleFileChange = async (files: File[]) => {
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

    await actionUploadFiles(newFiles);
  };

  const handleFileError = (error: string) => {
    messageAntd.open({
      type: 'error',
      content: error,
    });
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e?.target?.value || '');
    // 自适应高度
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const handleBtnSendClick = () => {
    onBtnSendClick?.({
      fileList,
      description,
    });
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-col gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
        {renderFileListBefore?.()}
        {fileList?.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 w-full">
            {fileList.map((itemFile, indexFile) => {
              return (
                <ItemFile
                  key={`input-multimodal-item-file-${indexFile}`}
                  mode={ItemFileModeEnum.Upload}
                  file={itemFile}
                  onBtnDeleteClick={() => handleFileBtnDeleteClick(indexFile)}
                  onBtnReuploadClick={() => handleFileBtnReuploadClick(indexFile)}
                />
              );
            })}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          name={`input-multimodal-input-${name}`}
          className="box-border pl-1 pr-3 rounded border-none resize-none outline-none min-h-[40px] max-h-[200px] w-full transition-all"
          placeholder={placeholderDescription}
          value={description}
          onChange={handleDescriptionChange}
          rows={1}
          style={{ overflow: 'auto' }}
        />
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-1">
          {isShowBtnUpload ? (
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
                  <IconActionBarUpload />
                </div>
              </FileUploadSimple>
            </Button>
          ) : null}
          {renderFooter?.()}
        </div>

        <Button
          type="button"
          variant="default"
          className={cn('w-9 h-9 flex-shrink-0 cursor-pointer', {})}
          disabled={isDisabledBtnSend || isLoadingBtnSend}
          onClick={handleBtnSendClick}
        >
          {isLoadingBtnSend ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <IconActionBarSend />
          )}
        </Button>
      </div>
    </div>
  );
}

export const InputMultimodal = memo(PureInputMultimodal);
