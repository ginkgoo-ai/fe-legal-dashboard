'use client';

import { ActionBarContainer } from '@/components/case/actionBarContainer';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile } from '@/components/common/itemFile';
import { Button } from '@/components/ui/button';
import {
  IconActionBarDraftEmail,
  IconActionBarStartExtensions,
  IconActionBarUpload,
} from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { MESSAGE } from '@/config/message';
import LockManager from '@/customManager/LockManager';
import { useEventManager } from '@/hooks/useEventManager';
import { useStateCallback } from '@/hooks/useStateCallback';
import { cn } from '@/lib/utils';
import { processDocument, uploadDocumentOnlyUpload } from '@/service/api/case';
import { FileStatus, IFileItemType } from '@/types/file';
import { message as messageAntd } from 'antd';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import './index.css';

export enum TypeActionBarEnum {
  INIT = 'INIT',
  ADD_REFERENCE = 'ADD_REFERENCE',
  DRAFT_EMAIL_MISS_INFO = 'DRAFT_EMAIL_MISS_INFO',
  DRAFT_EMAIL_PDF = 'DRAFT_EMAIL_PDF',
}

interface ActionBarProps {
  caseId: string;
  onSizeChange?: (size: DOMRectReadOnly) => void;
}

function PureActionBar(props: ActionBarProps) {
  const { caseId, onSizeChange } = props || {};

  const actionBarRef = useRef<HTMLDivElement>(null);

  const [typeActionBar, setTypeActionBar] = useState<TypeActionBarEnum>(
    TypeActionBarEnum.INIT
  );
  const [isLoadingBtnSend, setLoadingBtnSend] = useState<boolean>(false);
  const [actionBarDesc, setActionBarDesc] = useState<string>('');

  const [referenceFileList, setReferenceFileList] = useStateCallback<IFileItemType[]>([]);

  const isDisabledBtnSend = useMemo(() => {
    if (typeActionBar === TypeActionBarEnum.ADD_REFERENCE) {
      if (
        referenceFileList.length > 0 &&
        !referenceFileList.some(file => {
          return file.status === FileStatus.UPLOADING;
        })
      ) {
        return false;
      }
      return true;
    }
    return false;
  }, [typeActionBar, referenceFileList]);

  useEventManager('ginkgoo-sse', async message => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      // case 'event:documentStatusUpdate': {
      case 'event:documentUploadCompleted': {
        const { data: dataMsg } = message || {};

        const { status, documentId } = dataMsg || {};

        if (!!documentId) {
          const lockId = 'panel-reference-file-list';
          await LockManager.acquireLock(lockId);

          setReferenceFileList(
            prev =>
              cloneDeep(
                produce(prev, draft => {
                  const indexFile = draft.findIndex(file => {
                    return (
                      file.documentFile?.documentId === documentId // for add
                    );
                  });
                  if (indexFile >= 0) {
                    draft[indexFile].status = status;
                  }
                  // else
                  // draft.push({
                  //   localId: uuid(),
                  //   status: status,
                  //   documentFile: dataMsg,
                  // });
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
    if (typeActionBar === TypeActionBarEnum.INIT) {
      setReferenceFileList([]);
      setActionBarDesc('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeActionBar]);

  useEffect(() => {
    if (!actionBarRef.current) return;

    const observer = new window.ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === actionBarRef.current) {
          onSizeChange?.(entry.contentRect);
        }
      }
    });

    observer.observe(actionBarRef.current);

    const rect = actionBarRef.current.getBoundingClientRect();

    onSizeChange?.(rect);

    return () => {
      observer.disconnect();
    };
  }, [onSizeChange]);

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const resUploadDocument = await uploadDocumentOnlyUpload({
      caseId,
      files: newFiles.map(file => file.localFile!),
    });

    // console.log('actionUploadFile', newFiles, resUploadDocument);

    if (resUploadDocument?.acceptedDocuments) {
      setReferenceFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            const indexNewFile = newFiles.findIndex(
              newFile => newFile?.localId === file?.localId
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
      setReferenceFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            const indexNewFile = newFiles.findIndex(
              newFile => newFile?.localId === file?.localId
            );

            if (indexNewFile >= 0) {
              file.status = FileStatus.FAILED;
            }
          });
        })
      );
    }
  };

  const handleFileChange = async (files: File[]) => {
    if (files?.length > 10) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_UPLOAD_FILE_MAX,
      });
      return;
    }

    setTypeActionBar(TypeActionBarEnum.ADD_REFERENCE);

    const newFiles = files.map(file => ({
      localId: uuid(),
      status: FileStatus.UPLOADING,
      localFile: file,
    }));

    setReferenceFileList(prev =>
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

  const handleReferenceFileBtnDeleteClick = (index: number) => {
    setReferenceFileList(prev =>
      produce(prev, draft => {
        draft.splice(index, 1);
      })
    );
  };

  const handleReferenceFileBtnReuploadClick = (index: number) => {
    setReferenceFileList(prev =>
      produce(prev, draft => {
        const file = draft[index];
        if (file) {
          file.status = FileStatus.UPLOADING;
        }
      })
    );

    actionUploadFile([referenceFileList[index]]);
  };

  const handleActionBarDescChange = (e: any) => {
    setActionBarDesc(e?.target?.value?.trim() || '');
  };

  const handleReferenceBtnSendClick = async () => {
    setLoadingBtnSend(true);
    // 根据 referenceFileList 提取所有有效的 documentId
    const documentIds = referenceFileList
      .filter(file => {
        return [FileStatus.UPLOAD_COMPLETED, FileStatus.COMPLETED].includes(file.status);
      })
      .map(file => file.documentFile?.documentId || '');

    const resProcessDocument = await processDocument({
      caseId,
      documentIds,
      description: actionBarDesc,
    });

    setLoadingBtnSend(false);

    if (resProcessDocument?.acceptedDocuments) {
      setTypeActionBar(TypeActionBarEnum.INIT);
    }
  };

  const handleBtnDraftEmailClick = () => {
    setTypeActionBar(TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO);
  };

  const handleBtnSummarizeClick = () => {
    setTypeActionBar(TypeActionBarEnum.DRAFT_EMAIL_PDF);
  };

  const handleBtnStartClick = () => {};

  const renderActionBarInit = () => {
    return (
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center gap-[18px] py-[11px] pl-[18px] pr-[14px] border-r border-solid border-[rgba(225, 225, 226, 1)] ">
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
                <span>Add reference</span>
              </div>
            </FileUploadSimple>
          </Button>

          <Button
            variant="ghost"
            className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
            onClick={handleBtnDraftEmailClick}
          >
            <IconActionBarDraftEmail />
            <span>Draft email</span>
          </Button>
        </div>

        <div className="flex flex-row items-center gap-[18px] py-[11px] pl-[14px] pr-[18px]">
          <Button
            variant="ghost"
            className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
            onClick={handleBtnSummarizeClick}
          >
            <IconActionBarDraftEmail />
            <span>Summarize</span>
          </Button>

          <Button
            variant="ghost"
            className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
            onClick={handleBtnStartClick}
          >
            <IconActionBarStartExtensions />
            <span>Start auto-fill</span>
          </Button>
        </div>
      </div>
    );
  };

  const renderActionBarAddReference = () => {
    return (
      <ActionBarContainer
        title="Add reference"
        isLoadingBtnSend={isLoadingBtnSend}
        isDisabledBtnSend={isDisabledBtnSend}
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        onBtnSendClick={handleReferenceBtnSendClick}
        renderContent={() => {
          return (
            <div className="flex flex-col gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
              {referenceFileList?.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 w-full">
                  {referenceFileList.map((itemReferenceFile, indexReferenceFile) => {
                    return (
                      <ItemFile
                        key={`action-bar-reference-${indexReferenceFile}`}
                        mode="ActionBar"
                        file={itemReferenceFile}
                        isFold={false}
                        onBtnDeleteClick={() =>
                          handleReferenceFileBtnDeleteClick(indexReferenceFile)
                        }
                        onBtnReuploadClick={() =>
                          handleReferenceFileBtnReuploadClick(indexReferenceFile)
                        }
                      />
                    );
                  })}
                </div>
              ) : null}
              <Input
                name="add-reference-desc-input"
                className="px-2"
                type="text"
                placeholder="Give your files a brief description."
                isBorder={false}
                onChange={handleActionBarDescChange}
              />
            </div>
          );
        }}
        renderFooter={() => {
          return (
            <div className="flex flex-row gap-1">
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
            </div>
          );
        }}
      />
    );
  };

  const renderactionbarDraftEmailMissInfo = () => {
    return (
      <ActionBarContainer
        title="Draft email"
        isLoadingBtnSend={isLoadingBtnSend}
        isDisabledBtnSend={isDisabledBtnSend}
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        onBtnSendClick={() => {
          console.log('renderactionbarDraftEmailMissInfo onBtnSendClick');
        }}
        renderContent={() => {
          return (
            <div className="flex flex-col gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
              <div>renderactionbarDraftEmailMissInfo renderContent</div>
              <Input
                name="draft-email-miss-info-desc-input"
                className="px-2"
                type="text"
                placeholder="Give your files a brief description."
                isBorder={false}
                onChange={handleActionBarDescChange}
              />
            </div>
          );
        }}
        renderFooter={() => {
          return (
            <div className="flex flex-row gap-1">
              <Button
                variant="ghost"
                className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
              >
                renderactionbarDraftEmailMissInfo renderFooter
              </Button>
            </div>
          );
        }}
      />
    );
  };

  const renderactionbarDraftEmailPDF = () => {
    return (
      <ActionBarContainer
        title="Draft email"
        isLoadingBtnSend={isLoadingBtnSend}
        isDisabledBtnSend={isDisabledBtnSend}
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        onBtnSendClick={() => {
          console.log('renderactionbarDraftEmailPDF onBtnSendClick');
        }}
        renderContent={() => {
          return (
            <div className="flex flex-col gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
              <div>renderactionbarDraftEmailPDF renderContent</div>
              <Input
                name="draft-email-miss-info-desc-input"
                className="px-2"
                type="text"
                placeholder="Give your files a brief description."
                isBorder={false}
                onChange={handleActionBarDescChange}
              />
            </div>
          );
        }}
        renderFooter={() => {
          return (
            <div className="flex flex-row gap-1">
              <Button
                variant="ghost"
                className="border border-solid border-[rgba(225, 225, 226, 1)] h-11"
              >
                renderactionbarDraftEmailPDF renderFooter
              </Button>
            </div>
          );
        }}
      />
    );
  };

  return (
    <div
      ref={actionBarRef}
      className={cn(
        'absolute bottom-10 left-[50%] -translate-x-1/2 bg-background action-bar-wrap box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] transition-all',
        {
          'w-[43rem]': typeActionBar === TypeActionBarEnum.INIT,
          'w-[80%]': typeActionBar !== TypeActionBarEnum.INIT,
        }
      )}
    >
      {typeActionBar === TypeActionBarEnum.INIT ? renderActionBarInit() : null}
      {typeActionBar === TypeActionBarEnum.ADD_REFERENCE
        ? renderActionBarAddReference()
        : null}
      {typeActionBar === TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO
        ? renderactionbarDraftEmailMissInfo()
        : null}
      {typeActionBar === TypeActionBarEnum.DRAFT_EMAIL_PDF
        ? renderactionbarDraftEmailPDF()
        : null}
    </div>
  );
}

export const ActionBar = memo(PureActionBar);
