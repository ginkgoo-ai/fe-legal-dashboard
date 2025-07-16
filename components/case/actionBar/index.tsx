'use client';

import { ActionBarContainer } from '@/components/case/actionBarContainer';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile } from '@/components/common/itemFile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import {
  IconActionBarDraftEmail,
  IconActionBarDraftEmailMissInfo,
  IconActionBarDraftEmailPDF,
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
import { ICaseItemType } from '@/types/case';
import { FileStatus, FileTypeEnum, IFileItemType } from '@/types/file';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Checkbox as AntdCheckbox, message as messageAntd } from 'antd';
import { motion } from 'framer-motion';
import { produce } from 'immer';
import { cloneDeep } from 'lodash';
import { ChevronDown } from 'lucide-react';
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
  caseInfo: ICaseItemType | null;
  onSizeChange?: (size: DOMRectReadOnly) => void;
}

const optionDraftEmailList = [
  {
    label: 'Send information request',
    icon: <IconActionBarDraftEmailMissInfo size={24} className="w-6! h-6!" />,
    value: TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO,
  },
  {
    label: 'Email Visa Application (PDF)',
    icon: <IconActionBarDraftEmailPDF size={24} className="w-6! h-6!" />,
    value: TypeActionBarEnum.DRAFT_EMAIL_PDF,
  },
];

function PureActionBar(props: ActionBarProps) {
  const { caseInfo, onSizeChange } = props || {};

  const actionBarRef = useRef<HTMLDivElement>(null);
  const dropdownDraftEmailRef = useRef<HTMLDivElement>(null); // 新增ref
  const dropdownDraftEmailMissInfoRef = useRef<HTMLDivElement>(null); // 新增ref

  const [typeActionBar, setTypeActionBar] = useState<TypeActionBarEnum>(
    TypeActionBarEnum.INIT
  );
  const [isShowDropdownMenuDraftEmail, setShowDropdownMenuDraftEmail] =
    useState<boolean>(false); // custom
  const [isShowDropdownMenuDraftEmailChild, setShowDropdownMenuDraftEmailChild] =
    useState<boolean>(false);
  const [isShowDropdownMenuDraftEmailMissInfo, setShowDropdownMenuDraftEmailMissInfo] =
    useState<boolean>(false); // custom
  const [isLoadingBtnSend, setLoadingBtnSend] = useState<boolean>(false);
  const [actionBarDesc, setActionBarDesc] = useState<string>('');

  const [referenceFileList, setReferenceFileList] = useStateCallback<IFileItemType[]>([]);

  const [draftEmailMissInfo] = useState<IFileItemType | null>({
    localId: uuid(),
    status: FileStatus.COMPLETED,
    documentFile: {
      success: true,
      documentId: uuid(),
      caseId: caseInfo?.id || '',
      message: 'Missing information',
      filename: 'Missing information',
      fileSize: 2245148,
      fileType: FileTypeEnum.MISS_INFO,
      description: null,
      receivedAt: null,
      errorCode: null,
      errorDetails: null,
    },
  });
  const [draftEmailMissInfoList, setDraftEmailMissInfoList] = useState<any[]>([]);
  const [draftEmailPDF, setDraftEmailPDF] = useState<IFileItemType | null>(null);

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

  const currentDraftEmail = useMemo(() => {
    return (
      optionDraftEmailList.find(item => {
        return item.value === typeActionBar;
      }) || {
        label: '',
        icon: null,
        value: '',
        width: 'auto',
      }
    );
  }, [typeActionBar]);

  const draftEmailMissInfoOption = useMemo(() => {
    console.log('caseInfo', caseInfo);
    return [
      { label: 'Date of Birth', value: 'Date of Birth' },
      { label: 'Visa Application Date', value: 'Visa Application Date' },
      { label: 'Visa Submission Date', value: 'Visa Submission Date' },
      { label: 'Visa Request Date', value: 'Visa Request Date' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date1' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date2' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date3' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date4' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date5' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date6' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date7' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date8' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date9' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date10' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date11' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date12' },
      { label: 'Visa Processing Date', value: 'Visa Processing Date13' },
    ];
  }, [caseInfo]);

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
    setShowDropdownMenuDraftEmail(false);
    setShowDropdownMenuDraftEmailChild(false);
    setShowDropdownMenuDraftEmailMissInfo(false);
    setDraftEmailPDF(null);
    setDraftEmailMissInfoList([]);

    switch (typeActionBar) {
      case TypeActionBarEnum.INIT: {
        setReferenceFileList([]);
        setActionBarDesc('');
        break;
      }
      case TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO: {
        break;
      }
      case TypeActionBarEnum.DRAFT_EMAIL_PDF: {
        setDraftEmailPDF({
          localId: uuid(),
          status: FileStatus.COMPLETED,
          documentFile: {
            success: true,
            documentId: uuid(),
            caseId: caseInfo?.id || '',
            message: 'Draft Email PDF',
            filename: 'Draft Email PDF.pdf',
            fileSize: 2245148,
            fileType: 'application/pdf',
            description: null,
            receivedAt: null,
            errorCode: null,
            errorDetails: null,
          },
        });
        break;
      }
      default: {
        break;
      }
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

  useEffect(() => {
    if (!isShowDropdownMenuDraftEmail) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownDraftEmailRef.current &&
        !dropdownDraftEmailRef.current.contains(event.target as Node)
      ) {
        setShowDropdownMenuDraftEmail(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowDropdownMenuDraftEmail]);

  useEffect(() => {
    if (!isShowDropdownMenuDraftEmailMissInfo) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownDraftEmailMissInfoRef.current &&
        !dropdownDraftEmailMissInfoRef.current.contains(event.target as Node)
      ) {
        setShowDropdownMenuDraftEmail(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShowDropdownMenuDraftEmailMissInfo]);

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const resUploadDocument = await uploadDocumentOnlyUpload({
      caseId: caseInfo?.id || '',
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
      caseId: caseInfo?.id || '',
      documentIds,
      description: actionBarDesc,
    });

    setLoadingBtnSend(false);

    if (resProcessDocument?.acceptedDocuments) {
      setTypeActionBar(TypeActionBarEnum.INIT);
    }
  };

  const handleBtnDraftEmailClick = () => {
    if (!isShowDropdownMenuDraftEmail) {
      setShowDropdownMenuDraftEmail(true);
    }
  };

  const handleBtnSummarizeClick = () => {};

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
            className={cn('border border-solid border-[rgba(225, 225, 226, 1)] h-11', {
              'pointer-events-none': isShowDropdownMenuDraftEmail,
            })}
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
                        mode="ActionBarReference"
                        file={itemReferenceFile}
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

  const renderActionbarDraftEmailMissInfo = () => {
    return (
      <ActionBarContainer
        title="Draft email"
        isLoadingBtnSend={isLoadingBtnSend}
        isDisabledBtnSend={isDisabledBtnSend}
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        onBtnSendClick={() => {
          console.log('renderActionbarDraftEmailMissInfo onBtnSendClick');
        }}
        renderContent={() => {
          return (
            <div className="flex flex-col items-start gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
              {!!draftEmailMissInfo ? (
                <ItemFile
                  mode="ActionBarDraftEmail"
                  file={draftEmailMissInfo}
                  renderExtend={() => {
                    return (
                      <Badge
                        className="flex justify-center items-center bg-transparent border border-solid border-[#E1E1E2] text-[#1559EA]"
                        variant="small"
                      >
                        {draftEmailMissInfoList.length}
                      </Badge>
                    );
                  }}
                  onItemClick={() => {
                    setShowDropdownMenuDraftEmailMissInfo(true);
                  }}
                />
              ) : null}
              <Input
                name="draft-email-miss-info-desc-input"
                className="px-2 w-full"
                type="text"
                placeholder="Give your files a brief description."
                isBorder={false}
                onChange={handleActionBarDescChange}
              />
            </div>
          );
        }}
        renderFooter={renderActionbarDraftEmailFooter}
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
            <div className="flex flex-col items-start gap-1 bg-[#F0F0F0] dark:bg-primary-gray box-border p-3 rounded-xl">
              {!!draftEmailPDF ? (
                <ItemFile mode="ActionBarDraftEmail" file={draftEmailPDF} />
              ) : null}
              <Input
                name="draft-email-miss-info-desc-input"
                className="px-2 w-full"
                type="text"
                placeholder="Give your files a brief description."
                isBorder={false}
                onChange={handleActionBarDescChange}
              />
            </div>
          );
        }}
        renderFooter={renderActionbarDraftEmailFooter}
      />
    );
  };

  const renderActionbarDraftEmailFooter = () => {
    return (
      <div className="flex flex-row gap-1">
        <DropdownMenu
          open={isShowDropdownMenuDraftEmailChild}
          onOpenChange={e => {
            setShowDropdownMenuDraftEmailChild(e);
          }}
        >
          <DropdownMenuTrigger>
            <Button variant="ghost" asChild className="h-11">
              <div className="border border-solid border-[rgba(225, 225, 226, 1)] flex flex-row justify-start items-center text-[#5F5F5F] dark:text-[#FFFFFF]">
                {currentDraftEmail.icon}
                <span>{currentDraftEmail.label}</span>
                <ChevronDown
                  className={cn('transition-all', {
                    'rotate-180': isShowDropdownMenuDraftEmailChild,
                  })}
                />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="relative w-full flex flex-col">
            {optionDraftEmailList.map((itemOption, indexOption) => {
              return (
                <Button
                  key={`dropdown-menu-draft-email-btn-${indexOption}`}
                  variant="ghost"
                  asChild
                  className="h-11"
                  onClick={() => {
                    setShowDropdownMenuDraftEmailChild(false);
                    setTypeActionBar(itemOption.value);
                  }}
                >
                  <div className="flex flex-row justify-start items-center text-[#5F5F5F] dark:text-[#FFFFFF]">
                    {itemOption.icon}
                    <span>{itemOption.label}</span>
                  </div>
                </Button>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const customStyle = {
    'w-[43rem]': typeActionBar === TypeActionBarEnum.INIT,
    'w-[80%]': typeActionBar !== TypeActionBarEnum.INIT,
  };

  return (
    <>
      <div
        ref={actionBarRef}
        className="absolute bottom-10 left-[50%] -translate-x-1/2 flex flex-col items-center gap-3 w-full"
      >
        {/* Custom DropdownMenu for DraftEmail */}
        {typeActionBar === TypeActionBarEnum.INIT && isShowDropdownMenuDraftEmail && (
          <motion.div
            ref={dropdownDraftEmailRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] gap-0.5 p-1 w-full flex flex-col',
              customStyle
            )}
          >
            {optionDraftEmailList.map((itemOption, indexOption) => {
              return (
                <Button
                  key={`dropdown-menu-draft-email-btn-${indexOption}`}
                  variant="ghost"
                  asChild
                  className="h-11"
                  onClick={() => {
                    setTypeActionBar(itemOption.value);
                  }}
                >
                  <div className="flex flex-row justify-start items-center text-[#5F5F5F] dark:text-[#FFFFFF]">
                    {itemOption.icon}
                    <span>{itemOption.label}</span>
                  </div>
                </Button>
              );
            })}
          </motion.div>
        )}

        {/* Base */}
        <div
          className={cn(
            'action-bar-content bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] transition-all',
            customStyle
          )}
        >
          {typeActionBar === TypeActionBarEnum.INIT ? renderActionBarInit() : null}
          {typeActionBar === TypeActionBarEnum.ADD_REFERENCE
            ? renderActionBarAddReference()
            : null}
          {typeActionBar === TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO
            ? renderActionbarDraftEmailMissInfo()
            : null}
          {typeActionBar === TypeActionBarEnum.DRAFT_EMAIL_PDF
            ? renderactionbarDraftEmailPDF()
            : null}
        </div>

        {/* Custom DropdownMenu for DraftEmail Miss Info */}
        {typeActionBar === TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO &&
          isShowDropdownMenuDraftEmailMissInfo && (
            <motion.div
              ref={dropdownDraftEmailMissInfoRef}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute bottom-0 left-[50%] -translate-x-1/2 action-bar-content bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] transition-all',
                customStyle
              )}
            >
              <ActionBarContainer
                title={
                  <div className="flex flex-row gap-1">
                    <div>Missing information</div>
                    <Badge
                      className="flex justify-center items-center bg-transparent border border-solid border-[#E1E1E2] text-[#1559EA]"
                      variant="small"
                    >
                      {draftEmailMissInfoList.length}
                    </Badge>
                  </div>
                }
                isLoadingBtnSend={isLoadingBtnSend}
                isDisabledBtnSend={isDisabledBtnSend}
                onBtnBackClick={() => {
                  setShowDropdownMenuDraftEmailMissInfo(false);
                }}
                renderContent={() => {
                  return (
                    <div className="w-full h-80 overflow-y-auto">
                      <div className="flex flex-col gap-3 box-border px-5">
                        {draftEmailMissInfoOption.map((itemOption, indexOption) => {
                          const checked = draftEmailMissInfoList.some(
                            (item: any) => item.value === itemOption.value
                          );
                          return (
                            <div
                              key={`dropdown-menu-draft-email-miss-info-checkbox-${indexOption}`}
                              className="scale-125 origin-left"
                            >
                              <AntdCheckbox
                                className="w-full"
                                checked={checked}
                                onChange={e => {
                                  setDraftEmailMissInfoList((prev: any[]) => {
                                    return !!e?.target?.checked
                                      ? [...prev, itemOption]
                                      : prev.filter(
                                          (item: any) => item.value !== itemOption.value
                                        );
                                  });
                                }}
                              >
                                <span className="text-xs">{itemOption.label}</span>
                              </AntdCheckbox>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
            </motion.div>
          )}
      </div>
    </>
  );
}

export const ActionBar = memo(PureActionBar);
