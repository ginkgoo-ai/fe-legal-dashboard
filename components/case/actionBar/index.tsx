'use client';

import { ActionBarContainer } from '@/components/case/actionBarContainer';
import { InputMultimodal } from '@/components/case/inputMultimodal';
import { FileUploadSimple } from '@/components/common/form/upload/fileUploadSimple';
import { ItemFile, ItemFileModeEnum } from '@/components/common/itemFile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import {
  IconActionBarDraftEmail,
  IconActionBarDraftEmailMissInfo,
  IconActionBarDraftEmailPDF,
  IconActionBarSummarize,
  IconActionBarUpload,
  IconExtensionInstall,
  IconExtensionStart,
  IconExtensionStop,
  IconInfo,
} from '@/components/ui/icon';
import { MESSAGE } from '@/config/message';
import GlobalManager from '@/customManager/GlobalManager';
import UtilsManager from '@/customManager/UtilsManager';
import { useEffectStrictMode } from '@/hooks/useEffectStrictMode';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import {
  createEmailDraft,
  getMissingFields,
  getSummary,
  processDocument,
} from '@/service/api/case';
import { useExtensionsStore } from '@/store/extensionsStore';
import { ICaseItemType } from '@/types/case';
import { IPilotType, PilotStatusEnum } from '@/types/casePilot';
import { FileStatus, FileTypeEnum, IFileItemType } from '@/types/file';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Checkbox as CheckboxAntd, message as messageAntd } from 'antd';
import { motion } from 'framer-motion';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import './index.css';

export enum TypeActionBarEnum {
  INIT = 'INIT',
  ADD_REFERENCE = 'ADD_REFERENCE',
  DRAFT_EMAIL_MISS_INFO = 'DRAFT_EMAIL_MISS_INFO',
  DRAFT_EMAIL_PDF = 'DRAFT_EMAIL_PDF',
}

export enum TypeCustomDropdownMenuEnum {
  NONE = 'NONE',
  DRAFT_EMAIL_SELECT = 'DRAFT_EMAIL_SELECT',
  DRAFT_EMAIL_MISS_INFO = 'DRAFT_EMAIL_MISS_INFO',
  INSTALL_EXTENSION = 'INSTALL_EXTENSION',
}

interface ActionBarProps {
  caseInfo: ICaseItemType | null;
  pilotInfoCurrent: IPilotType | null;
  onSizeChange?: (size: DOMRectReadOnly) => void;
  onShowNewWorkflow: () => void;
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
  const { caseInfo, pilotInfoCurrent, onSizeChange, onShowNewWorkflow } = props || {};

  const actionBarRef = useRef<HTMLDivElement>(null);
  const customDropdownRef = useRef<HTMLDivElement>(null);

  const [typeActionBar, setTypeActionBar] = useState<TypeActionBarEnum>(
    TypeActionBarEnum.INIT
  );

  const [typeCustomDropdownMenu, setTypeCustomDropdownMenu] =
    useState<TypeCustomDropdownMenuEnum>(TypeCustomDropdownMenuEnum.NONE);
  const [isShowDropdownMenuDraftEmailChild, setShowDropdownMenuDraftEmailChild] =
    useState<boolean>(false);
  const [isLoadingInstall, setLoadingInstall] = useState<boolean>(false);
  const [isLoadingBtnSummarize, setLoadingBtnSummarize] = useState<boolean>(false);
  const [isLoadingBtnSend, setLoadingBtnSend] = useState<boolean>(false);

  const [
    initFileListForActionUploadForReferenceFile,
    setInitFileListForActionUploadForReferenceFile,
  ] = useState<File[]>([]);

  const [draftEmailMissInfo] = useState<IFileItemType | null>({
    localId: uuid(),
    status: FileStatus.COMPLETED,
    documentFile: {
      success: true,
      documentId: uuid(),
      caseId: caseInfo?.id || '',
      message: 'Missing information',
      filename: 'Missing information',
      fileSize: 0,
      fileType: FileTypeEnum.MISS_INFO,
      description: null,
      receivedAt: null,
      errorCode: null,
      errorDetails: null,
    },
  });
  const [draftEmailMissInfoOption, setDraftEmailMissInfoOption] = useState<
    Record<string, string>[]
  >([]);
  const [draftEmailMissInfoList, setDraftEmailMissInfoList] = useState<any[]>([]);
  const [draftEmailPDF, setDraftEmailPDF] = useState<IFileItemType | null>(null);

  const { extensionsInfo } = useExtensionsStore();

  const isRunningExtension = useMemo(() => {
    return !(!pilotInfoCurrent || pilotInfoCurrent?.pilotStatus === PilotStatusEnum.HOLD);
  }, [pilotInfoCurrent]);

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

  const { emit: emitCase } = useEventManager('ginkgoo-case', () => {});

  const refreshDraftEmailMissInfoOption = async () => {
    setDraftEmailMissInfoOption([]);
    const resMissingFields = await getMissingFields({
      caseId: caseInfo?.id || '',
    });

    if (resMissingFields?.length > 0) {
      setDraftEmailMissInfoOption(
        resMissingFields.map(item => {
          return { label: item.displayName, value: item.fieldPath };
        })
      );
    }
    console.log('refreshDraftEmailMissInfoOption', resMissingFields);
  };

  useEffectStrictMode(() => {
    setTypeCustomDropdownMenu(TypeCustomDropdownMenuEnum.NONE);
    setShowDropdownMenuDraftEmailChild(false);
    // setShowDropdownMenuDraftEmail(false);
    // setShowDropdownMenuDraftEmailMissInfo(false);
    setDraftEmailPDF(null);
    setDraftEmailMissInfoList([]);

    switch (typeActionBar) {
      case TypeActionBarEnum.INIT: {
        setInitFileListForActionUploadForReferenceFile([]);
        break;
      }
      case TypeActionBarEnum.DRAFT_EMAIL_MISS_INFO: {
        refreshDraftEmailMissInfoOption();
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
    if (typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.NONE) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        customDropdownRef.current &&
        !customDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeCustomDropdownMenu(TypeCustomDropdownMenuEnum.NONE);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [typeCustomDropdownMenu]);

  const handleFileChange = async (files: File[]) => {
    if (files?.length > 10) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_UPLOAD_FILE_MAX,
      });
      return;
    }

    setTypeActionBar(TypeActionBarEnum.ADD_REFERENCE);
    setInitFileListForActionUploadForReferenceFile(files);
  };

  const handleFileError = (error: string) => {
    messageAntd.open({
      type: 'error',
      content: error,
    });
  };

  const handleReferenceBtnSendClick = async (params: {
    fileList: IFileItemType[];
    description: string;
  }) => {
    const { fileList, description } = params || {};

    setLoadingBtnSend(true);
    // 根据 referenceFileList 提取所有有效的 documentId
    const documentIds = fileList
      // .filter(file => {
      //   return [FileStatus.UPLOAD_COMPLETED, FileStatus.COMPLETED].includes(file.status);
      // })
      .map(file => file.documentFile?.documentId || '');

    const resProcessDocument = await processDocument({
      caseId: caseInfo?.id || '',
      documentIds,
      description,
    });

    setLoadingBtnSend(false);

    if (resProcessDocument?.acceptedDocuments) {
      setTypeActionBar(TypeActionBarEnum.INIT);
      emitCase({
        type: 'update-case-reference-change',
        description,
        acceptedDocuments: resProcessDocument?.acceptedDocuments,
      });
      return;
    }

    messageAntd.open({
      type: 'error',
      content: MESSAGE.TOAST_PROBLEM,
    });
  };

  const handleDraftEmailMissInfoBtnSendClick = async (params: {
    fileList: IFileItemType[];
    description: string;
  }) => {
    const { description } = params || {};

    console.log(
      'handleDraftEmailMissInfoBtnSendClick draftEmailMissInfoList',
      draftEmailMissInfoList
    );

    setLoadingBtnSend(true);

    const resCreateEmailDrafts = await createEmailDraft({
      caseId: caseInfo?.id || '',
      emailType: 'missing_documents',
      fields: draftEmailMissInfoList.map(item => {
        return item.value;
      }),
      context: description,
    });

    setLoadingBtnSend(false);

    if (!!resCreateEmailDrafts?.threadId) {
      setTypeActionBar(TypeActionBarEnum.INIT);
      return;
    }

    messageAntd.open({
      type: 'error',
      content: MESSAGE.TOAST_PROBLEM,
    });
  };

  const handleDraftEmailPDFBtnSendClick = async () => {
    console.log('handleDraftEmailPDFBtnSendClick draftEmailPDF', draftEmailPDF);

    setLoadingBtnSend(true);

    const resCreateEmailDrafts = await createEmailDraft({
      caseId: caseInfo?.id || '',
      emailType: 'pdf', // TODO:
    });

    setLoadingBtnSend(false);

    console.log(
      'handleDraftEmailPDFBtnSendClick resCreateEmailDrafts',
      resCreateEmailDrafts
    );
  };

  const handleBtnDraftEmailClick = () => {
    setTypeCustomDropdownMenu(TypeCustomDropdownMenuEnum.DRAFT_EMAIL_SELECT);
  };

  const handleBtnSummarizeClick = async () => {
    setLoadingBtnSummarize(true);

    const resSummary = await getSummary({
      caseId: caseInfo?.id || '',
    });

    setLoadingBtnSummarize(false);

    if (!resSummary?.id) {
      messageAntd.open({
        type: 'error',
        content: MESSAGE.TOAST_PROBLEM,
      });
    }
  };

  const handleBtnExtensionStartClick = () => {
    if (!!extensionsInfo?.version) {
      onShowNewWorkflow?.();
    } else {
      setTypeCustomDropdownMenu(TypeCustomDropdownMenuEnum.INSTALL_EXTENSION);
    }
  };

  const handleBtnExtensionStopClick = () => {
    window.postMessage({
      type: 'ginkgoo-page-all-pilot-stop',
      workflowId: pilotInfoCurrent?.pilotWorkflowInfo?.workflow_instance_id,
    });
  };

  const handleBtnExtensionInstallClick = async () => {
    setLoadingInstall(true);

    UtilsManager.clickTagA({
      url: GlobalManager.urlInstallExtension,
    });

    setTimeout(() => {
      setLoadingInstall(false);
    }, 2000);
  };

  const renderActionBarInit = () => {
    return (
      <div className="flex flex-row items-center">
        <div className="flex flex-row items-center gap-[18px] py-[11px] pl-[18px] pr-[14px] border-r border-solid border-[rgba(225, 225, 226, 1)] ">
          <Button
            variant="ghost"
            className={cn('border border-solid border-[rgba(225, 225, 226, 1)] h-11 p-0')}
            disabled={isRunningExtension}
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
              'pointer-events-none':
                isRunningExtension ||
                typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.DRAFT_EMAIL_SELECT,
            })}
            disabled={isRunningExtension}
            onClick={handleBtnDraftEmailClick}
          >
            <IconActionBarDraftEmail />
            <span>Draft email</span>
          </Button>
        </div>

        <div className="flex flex-row items-center gap-[18px] py-[11px] pl-[14px] pr-[18px]">
          <Button
            variant="ghost"
            className={cn('border border-solid border-[rgba(225, 225, 226, 1)] h-11', {
              'pointer-events-none': isRunningExtension,
            })}
            disabled={isRunningExtension}
            onClick={handleBtnSummarizeClick}
          >
            {isLoadingBtnSummarize ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <IconActionBarSummarize />
            )}
            <span>Summarize</span>
          </Button>

          {isRunningExtension ? (
            <>
              <Button
                variant="ghost"
                className={cn(
                  'border border-solid border-[rgba(225, 225, 226, 1)] h-11',
                  {
                    'pointer-events-none': isRunningExtension,
                  }
                )}
                disabled={isRunningExtension}
              >
                <LoaderCircle className="animate-spin" />
                <span>Running...</span>
              </Button>

              <Button
                variant="ghost"
                className={cn('border border-solid border-[rgba(225, 225, 226, 1)] h-11')}
                onClick={handleBtnExtensionStopClick}
              >
                <IconExtensionStop />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              className={cn('border border-solid border-[rgba(225, 225, 226, 1)] h-11', {
                'pointer-events-none':
                  isRunningExtension ||
                  typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.INSTALL_EXTENSION,
              })}
              disabled={isRunningExtension}
              onClick={handleBtnExtensionStartClick}
            >
              <IconExtensionStart size={20} />
              <span>Start auto-fill</span>
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderActionBarAddReference = () => {
    return (
      <ActionBarContainer
        title="Add reference"
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        renderContent={() => {
          return (
            <InputMultimodal
              caseId={caseInfo?.id || ''}
              name="add-reference"
              placeholderDescription="Give your files a brief description."
              isShowBtnUpload
              isLoadingBtnSend={isLoadingBtnSend}
              verifyList={['fileList']}
              initFileListForActionUpload={initFileListForActionUploadForReferenceFile}
              onBtnSendClick={handleReferenceBtnSendClick}
            />
          );
        }}
      />
    );
  };

  const renderActionbarDraftEmailMissInfo = () => {
    return (
      <ActionBarContainer
        title="Draft email"
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        renderContent={() => {
          return (
            <InputMultimodal
              caseId={caseInfo?.id || ''}
              name="draft-email-miss-info"
              placeholderDescription="Give your files a brief description."
              isShowBtnUpload={false}
              isLoadingBtnSend={isLoadingBtnSend}
              verifyList={[draftEmailMissInfoList.length > 0]}
              renderFileListBefore={() => {
                return (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {!!draftEmailMissInfo ? (
                      <ItemFile
                        mode={ItemFileModeEnum.ActionBarDraftEmail}
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
                          setTypeCustomDropdownMenu(
                            TypeCustomDropdownMenuEnum.DRAFT_EMAIL_MISS_INFO
                          );
                        }}
                      />
                    ) : null}
                  </div>
                );
              }}
              renderFooter={renderActionbarDraftEmailFooter}
              onBtnSendClick={handleDraftEmailMissInfoBtnSendClick}
            />
          );
        }}
      />
    );
  };

  const renderActionbarDraftEmailPDF = () => {
    return (
      <ActionBarContainer
        title="Draft email"
        onBtnBackClick={() => {
          setTypeActionBar(TypeActionBarEnum.INIT);
        }}
        renderContent={() => {
          return (
            <InputMultimodal
              caseId={caseInfo?.id || ''}
              name="draft-email-miss-info"
              placeholderDescription="Give your files a brief description."
              isShowBtnUpload={false}
              isLoadingBtnSend={isLoadingBtnSend}
              verifyList={[false]}
              renderFileListBefore={() => {
                return (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {!!draftEmailPDF ? (
                      <ItemFile
                        mode={ItemFileModeEnum.ActionBarDraftEmail}
                        file={draftEmailPDF}
                      />
                    ) : null}
                  </div>
                );
              }}
              renderFooter={renderActionbarDraftEmailFooter}
              onBtnSendClick={handleDraftEmailPDFBtnSendClick}
            />
          );
        }}
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

  const renderCustomDropdownMenuSelect = (params: { customClassName?: string }) => {
    const { customClassName } = params || {};

    return (
      <motion.div
        ref={customDropdownRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={customClassName}
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
    );
  };

  const renderCustomDropdownMenuDraftEmailMissInfo = (params: {
    customClassName?: string;
  }) => {
    const { customClassName } = params || {};

    return (
      <motion.div
        ref={customDropdownRef}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0 }}
        transition={{ duration: 0.2 }}
        className={customClassName}
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
          onBtnBackClick={() => {
            setTypeCustomDropdownMenu(TypeCustomDropdownMenuEnum.NONE);
          }}
          renderContent={() => {
            return (
              <div className="w-full h-56 overflow-x-hidden overflow-y-auto">
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
                        <CheckboxAntd
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
                        </CheckboxAntd>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }}
        />
      </motion.div>
    );
  };

  const renderCustomDropdownMenuInstallExtension = (params: {
    customClassName?: string;
  }) => {
    const { customClassName } = params || {};

    return (
      <motion.div
        ref={customDropdownRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={customClassName}
      >
        <div className="box-border flex flex-row items-center gap-2.5 p-3">
          <Button
            variant="ghost"
            className={cn(
              'w-9 h-9 flex-shrink-0 border border-solid border-[rgba(225, 225, 226, 1)] pointer-events-none'
            )}
          >
            <IconInfo color="#E4570C" size={20} />
          </Button>
          <div className="text-[#1A1A1A] text-lg font-bold">Install extension</div>
        </div>
        <div className="box-border text-[#1A1A1AB2] text-sm px-3 pb-3">
          Install our Chrome browser extension to enable seamless automation.
        </div>
        <div className="flex flex-row justify-end items-center border-t border-solid border-[rgba(225, 225, 226, 1)] p-3">
          <Button
            variant="default"
            color="primary"
            className="h-9"
            onClick={handleBtnExtensionInstallClick}
          >
            {isLoadingInstall ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <IconExtensionInstall />
            )}
            <span className="font-bold">Install extension</span>
          </Button>
        </div>
      </motion.div>
    );
  };

  const customStyle = {
    'w-[45.5rem]': typeActionBar === TypeActionBarEnum.INIT && isRunningExtension,
    'w-[43rem]': typeActionBar === TypeActionBarEnum.INIT && !isRunningExtension,
    'w-[80%]': typeActionBar !== TypeActionBarEnum.INIT,
  };

  return (
    <div
      ref={actionBarRef}
      className="absolute bottom-10 left-[50%] -translate-x-1/2 flex flex-col items-center gap-3 w-full"
    >
      {/* Custom DropdownMenu for DraftEmail Select */}
      {typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.DRAFT_EMAIL_SELECT
        ? renderCustomDropdownMenuSelect({
            customClassName: cn(
              'bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] gap-0.5 p-1 w-full flex flex-col',
              customStyle
            ),
          })
        : null}

      {/* Custom DropdownMenu for DraftEmail Miss Info */}
      {typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.DRAFT_EMAIL_MISS_INFO
        ? renderCustomDropdownMenuDraftEmailMissInfo({
            customClassName: cn(
              'bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] gap-0.5 p-1 w-full flex flex-col',
              'absolute bottom-0 left-[50%] z-30 -translate-x-1/2 action-bar-content',
              customStyle
            ),
          })
        : null}

      {/* Custom DropdownMenu for Install extension */}
      {typeCustomDropdownMenu === TypeCustomDropdownMenuEnum.INSTALL_EXTENSION
        ? renderCustomDropdownMenuInstallExtension({
            customClassName: cn(
              'bg-background box-border rounded-[12px] border border-solid border-[rgba(225, 225, 226, 1)] gap-0 p-0 w-full flex flex-col',
              customStyle
            ),
          })
        : null}

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
          ? renderActionbarDraftEmailPDF()
          : null}
      </div>
    </div>
  );
}

export const ActionBar = memo(PureActionBar);
