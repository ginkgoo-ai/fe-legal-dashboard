'use client';

import { BadgeStatus } from '@/components/badgeStatus';
import { TagStatus } from '@/components/case/tag-status';
import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEventManager } from '@/hooks/useEventManager';
import { cn, parseCaseInfo } from '@/lib/utils';
import { caseStream, ocrDocuments } from '@/service/api';
import { downloadCustomFile, uploadFiles } from '@/service/api/file';
import { useExtensionsStore } from '@/store/extensionsStore';
import {
  IActionItemType,
  ICaseItemType,
  IPilotType,
  IStepItemType,
  PilotStatusEnum,
} from '@/types/case';
import { FileType } from '@/types/file';
import { Breadcrumb, Card, Splitter, StepProps, Steps, Tag, Tooltip } from 'antd';
import { AxiosHeaders } from 'axios';
import { produce } from 'immer';
import {
  CirclePlay,
  CircleStop,
  Download,
  FileText,
  Loader2,
  PanelLeft,
  PanelRight,
  RotateCcw,
  SquareArrowOutUpRight,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import './index.css';

enum FileStatus {
  UPLOADING = 'UPLOADING',
  ANALYSIS = 'ANALYSIS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

interface IFileItemType {
  localId: string;
  status: FileStatus;
  file: File;
  progress: number;
  resultAnalysis?: Record<string, string>[];
  resultFile?: FileType;
}

const breadcrumbItemsCasePortal = {
  title: 'Cases',
  href: '/case-portal',
};

const PANEL_SIZE_LIMIT = 200;
const SIZE_REFERENCE_DEFAULT = window.innerWidth * 0.3;
const SIZE_PROFILEVAULT_DEFAULT = window.innerWidth * 0.4;
const SIZE_PILOT_DEFAULT = window.innerWidth * 0.3;
const SIZE_REFERENCE_MIN = 70;
const SIZE_PROFILEVAULT_MIN = 200;
const SIZE_PILOT_MIN = 70;

export default function CaseDetailPage() {
  const searchParams = useSearchParams();
  const caseId = decodeURIComponent(
    searchParams.get('caseId') || '44c6cd75-b7c4-4e27-b643-ab14c15ee3a0'
  );

  const fill_data = useRef<Record<string, any>>({});

  const [breadcrumbItems, setBreadcrumbItems] = useState<any[]>([
    breadcrumbItemsCasePortal,
  ]);

  const [sizeReference, setSizeReference] = useState<number>(SIZE_REFERENCE_DEFAULT);
  const [sizeProfileVault, setSizeProfileVault] = useState<number>(
    SIZE_PROFILEVAULT_DEFAULT
  );
  const [sizePilot, setSizePilot] = useState<number>(SIZE_PILOT_DEFAULT);

  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  const [caseInfo, setCaseInfo] = useState<ICaseItemType | null>(null);
  const [caseStreamDocumentList, setCaseStreamDocumentList] = useState<any[]>([]);
  const [pilotInfo, setPilotInfo] = useState<IPilotType | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<StepProps[]>([]);

  const { extensionsInfo } = useExtensionsStore();

  const { emit } = useEventManager('ginkgo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;
    if (typeMsg === 'ginkgo-background-all-case-update') {
      const {
        caseId: caseIdMsg,
        stepListCurrent: stepListCurrentMsg,
        stepListItems: stepListItemsMsg,
      } = pilotInfoMsg || {};

      setPilotInfo(pilotInfoMsg);
      setStepListCurrent(stepListCurrentMsg);
      setStepListItems(calcStepListCurrent(stepListItemsMsg));

      if (
        stepListCurrentMsg >= 0 &&
        stepListItemsMsg?.length > 0 &&
        !!stepListItemsMsg[stepListCurrentMsg]
      ) {
        setTimeout(() => {
          const { actioncurrent, actionlist } =
            stepListItemsMsg[stepListCurrentMsg] || {};
          if (actioncurrent >= 0 && actionlist?.length > 0) {
            document
              .getElementById(`action-item-${stepListCurrentMsg}-${actioncurrent}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            document
              .getElementById(`step-item-${stepListCurrentMsg}`)
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 40);
      }
    }
  });

  const calcActionItem = (
    item: IActionItemType,
    indexStep: number,
    indexAction: number
  ) => {
    const { type, selector, value, actionresult, actiontimestamp } = item || {};

    return {
      title: (
        <div
          id={`action-item-${indexStep}-${indexAction}`}
          className="flex flex-row items-center gap-1"
        >
          <Tag className="flex-0 whitespace-nowrap" color="success">
            {type}
          </Tag>
          <Tooltip placement="top" title={selector} mouseEnterDelay={1}>
            <div className="flex-1 truncate">{selector}</div>
          </Tooltip>
          {actionresult && (
            <Tag
              className="flex-0 whitespace-nowrap"
              color={actionresult === 'success' ? 'success' : 'error'}
            >
              {actionresult}
            </Tag>
          )}
        </div>
      ),
      description: (
        <div className="flex w-full flex-col">
          {value && (
            <div className="flex flex-row gap-1 text-gray-400">value: {value}</div>
          )}
          <div className="flex flex-row gap-1 text-gray-400">{actiontimestamp}</div>
        </div>
      ),
    };
  };

  const calcStepListCurrent = (source: IStepItemType[] = []) => {
    const result = source.map((itemStep, indexStep) => {
      return {
        title: (
          <div id={`step-item-${indexStep}`} className="font-bold">
            {itemStep.title}
          </div>
        ),
        description: (
          <div className="box-border pl-2">
            <Steps
              progressDot
              direction="vertical"
              current={itemStep.actioncurrent}
              items={itemStep.actionlist.map((itemAction, indexAction) =>
                calcActionItem(itemAction, indexStep, indexAction)
              )}
            />
          </div>
        ),
      };
    });

    return result;
  };

  const actionOcrFile = async (cloudFiles: FileType[]) => {
    const data = await ocrDocuments({
      caseId,
      storageIds: cloudFiles.map(file => file.id),
    });

    if (data?.length > 0) {
      // TODO:
    } else {
      toast.error('Analysis file failed.');
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            if (
              cloudFiles.some(cloudFile => {
                return cloudFile.id === file.resultFile?.id;
              })
            ) {
              file.status = FileStatus.ERROR;
              file.progress = 0;
            }
          });
        })
      );
    }
  };

  const actionUploadFile = async (newFiles: IFileItemType[]) => {
    const data = await uploadFiles(
      newFiles.map(file => file.file),
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
              file.progress = 100;
              file.resultFile = data.cloudFiles[indexNewFile];
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
              file.progress = 0;
            }
          });
        })
      );
    }
  };

  const registerCaseStream = async () => {
    try {
      const { cancel, request } = await caseStream(
        { caseId },
        (controller: any) => {
          // 可以立即获取到 controller
          // setRequestController({ cancel: () => controller.abort() });
        },
        res => {
          setFileList(prev =>
            produce(prev, draft => {
              draft.forEach((file: IFileItemType) => {
                file.status = FileStatus.DONE;
                file.progress = 100;
              });
            })
          );

          console.log('🚀 ~ res:', res);
          // const parts = parseMessageContent(res);
          // originalMessageLogRef.current = res;
          try {
            const data = JSON.parse(res);
            const caseStreamDocumentListTmp = data.documents.map((itemDocument: any) => {
              const metadataForFrontObject = itemDocument.metadataJson
                ? JSON.parse(itemDocument.metadataJson)
                : {};
              return {
                ...itemDocument,
                metadataForFrontObject,
                metadataForFrontList: metadataForFrontObject
                  ? Object.keys(metadataForFrontObject).map((key: any) => {
                      return {
                        key,
                        value: JSON.stringify(metadataForFrontObject[key]),
                      };
                    })
                  : [],
              };
            });

            fill_data.current = {};
            caseStreamDocumentListTmp.forEach(
              (
                item: { documentType: string; metadataForFrontObject: any },
                index: number
              ) => {
                fill_data.current[item.documentType] = item.metadataForFrontObject;
              }
            );

            console.log('fill_data.current', fill_data.current);

            setCaseInfo(parseCaseInfo(data));
            setCaseStreamDocumentList(caseStreamDocumentListTmp);
          } catch (error) {
            console.warn('[Debug] Error parse message', error);
          }
        }
      );

      try {
        await request;
      } catch (error: any) {
        throw error;
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        // Common Error
      } else {
        // Cancel Error
      }
    } finally {
    }
  };

  useEffect(() => {
    registerCaseStream();
  }, []);

  useEffect(() => {
    if (!caseInfo?.title) {
      return;
    }

    setBreadcrumbItems([
      breadcrumbItemsCasePortal,
      {
        // title: `${caseName} - ${caseType}`,
        title: caseInfo?.title,
      },
    ]);
  }, [caseInfo]);

  useEffect(() => {
    if (!!extensionsInfo?.version) {
      window.postMessage({
        type: 'ginkgo-page-background-case-query',
        caseId,
      });
    }
  }, [extensionsInfo?.version]);

  const handleFileChange = async (files: File[]) => {
    const newFiles = files.map(file => ({
      localId: uuid(),
      status: FileStatus.UPLOADING,
      file,
      progress: 0,
    }));

    setFileList(prev =>
      produce(prev, draft => {
        draft.push(...newFiles);
      })
    );

    await actionUploadFile(newFiles);
  };

  const handleFileRetry = async (indexFile: number) => {
    setFileList(prev =>
      produce(prev, draft => {
        draft[indexFile].status = FileStatus.UPLOADING;
      })
    );

    await actionUploadFile([fileList[indexFile]]);
  };

  const handleFileError = (error: string) => {
    toast.error(error);
  };

  const handleSplitterResize = (sizes: number[]) => {
    const [left, mid, right] = sizes || [];

    setSizeReference(left);
    setSizeProfileVault(mid);
    setSizePilot(right);
  };

  const handleBtnPanelLeftClick = () => {
    console.log('handleBtnPanelLeftClick');
    // setCollapsibleReference(prev => {
    //   return !prev;
    // });
    if (sizeReference > SIZE_REFERENCE_MIN) {
      setSizeReference(SIZE_REFERENCE_MIN);
    } else {
      setSizeReference(SIZE_REFERENCE_DEFAULT);
    }
  };

  const handleBtnPanelRightClick = () => {
    console.log('handleBtnPanelRightClick');
    // setCollapsiblePilot(prev => {
    //   return !prev;
    // });
    if (sizePilot > SIZE_PILOT_MIN) {
      setSizePilot(SIZE_PILOT_MIN);
    } else {
      setSizePilot(SIZE_PILOT_DEFAULT);
    }
  };

  const handleBtnStartClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-case-start',
      caseId,
      fill_data: fill_data.current,
    };

    window.postMessage(message, window.location.origin);
  };

  const handleBtnStopClick = () => {
    // 只发送消息给本页面
    const message = {
      type: 'ginkgo-page-all-case-stop',
      caseId,
    };

    window.postMessage(message, window.location.origin);
  };

  const handleBtnDownloadClick = async () => {
    console.log('handleBtnDownloadClick', pilotInfo);
    if (pilotInfo?.pdfUrl && pilotInfo?.cookiesStr) {
      const headers = new AxiosHeaders();
      // headers.set('Accept', 'application/octet-stream');
      headers.set('withCredentials', true);
      headers.set('Cookie', pilotInfo.cookiesStr);

      const resDownloadCustomFile = await downloadCustomFile({
        url: pilotInfo.pdfUrl,
        headers,
      });

      // await saveBlob({ blobPart: resDownloadCustomFile });
    }
  };

  const handleBtnJumpClick = async () => {
    if (!!pilotInfo?.tabInfo?.url) {
      const messageJump = {
        type: 'ginkgo-page-background-tab-update',
        tabId: pilotInfo?.tabInfo?.id,
        updateProperties: { active: true },
      };
      window.postMessage(messageJump, window.location.origin);

      const messageOpenSidepanel = {
        type: 'ginkgo-page-background-sidepanel-open',
        options: {
          tabId: pilotInfo?.tabInfo?.id,
        },
      };
      window.postMessage(messageOpenSidepanel, window.location.origin);

      // console.log('handleBtnJumpClick', messageJump, messageOpenSidepanel);
    }
  };

  const handleBtnSidepanelOpenClick = async () => {
    const messageOpenSidepanel = {
      type: 'ginkgo-page-background-sidepanel-open',
      options: {
        tabId: pilotInfo?.tabInfo?.id,
      },
    };

    window.postMessage(messageOpenSidepanel, window.location.origin);
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col h-0 case-detail-wrap">
      {/* Breadcrumb */}
      <div
        className={cn(
          'bg-background flex h-[50px] w-full items-center justify-between border-b px-4'
        )}
      >
        <div className="flex items-center gap-4">
          <Breadcrumb separator=">" items={breadcrumbItems} />
        </div>
        <div className="flex items-center gap-4">
          {!!caseInfo?.caseStatusForFront?.text && (
            <TagStatus
              colorBackground={caseInfo.caseStatusForFront?.colorBackground}
              colorText={caseInfo.caseStatusForFront?.colorText}
              text={caseInfo.caseStatusForFront?.text}
            />
          )}
        </div>
      </div>

      {/* max-w-[var(--width-max)] px-[var(--width-padding)] */}
      <div className="flex h-0 w-full flex-1 flex-col px-6 py-6">
        <Splitter
          lazy={false}
          style={{
            // borderRadius: '12px',
            gap: '12px',
          }}
          onResize={handleSplitterResize}
        >
          <Splitter.Panel
            min={SIZE_REFERENCE_MIN}
            size={sizeReference}
            className="bg-white rounded-2xl flex-col flex"
          >
            <div className="flex flex-row p-4 justify-between items-center h-[66px] border-b flex-[0_0_auto]">
              {sizeReference > PANEL_SIZE_LIMIT && (
                <div className="text-base font-semibold text-[#1F2937]">Reference</div>
              )}
              <Button variant="ghost" onClick={handleBtnPanelLeftClick}>
                <PanelLeft />
              </Button>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto box-border p-4 flex-1 h-0">
              <div className="flex flex-col gap-2">
                <FileUpload
                  accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
                  multiple
                  maxSize={50}
                  onChange={handleFileChange}
                  onError={handleFileError}
                  label="Drag & drop your file"
                  subLabel="Supported file types: PDF, JPG, PNG, GIF, WEBP, DOC, DOCX, XLS, XLSX, TXT"
                  triggerText="browse files"
                />
              </div>
              <div className="flex flex-col gap-2">
                {fileList.map((itemFile, indexFile) => (
                  <div key={`${itemFile.localId}`} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-default">
                      <div className="bg-form-background border border-default rounded-lg flex items-center justify-center p-2">
                        <FileText size={24} />
                      </div>
                      <div className="flex flex-col gap-2 min-w-0 flex-1 mx-4">
                        <div className="flex flex-row items-center">
                          <BadgeStatus status={itemFile.status} />
                          <span className="ml-2 text-sm truncate font-semibold">
                            {itemFile.file.name}
                          </span>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                          <Progress value={itemFile.progress} />
                          {itemFile.status === FileStatus.ANALYSIS && (
                            <Button
                              type="button"
                              variant="ghost"
                              disabled
                              className="w-1 h-1 flex-shrink-0 cursor-pointer text-destructive hover:text-destructive/80"
                            >
                              <Loader2 className="animate-spin" color="#333333" />
                            </Button>
                          )}
                          {itemFile.status === FileStatus.ERROR && (
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-1 h-1 flex-shrink-0 cursor-pointer text-destructive hover:text-destructive/80"
                              onClick={() => {
                                handleFileRetry(indexFile);
                              }}
                            >
                              <RotateCcw color="#333333" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFileList(fileList.filter((_, i) => i !== indexFile));
                        }}
                        className="flex-shrink-0 cursor-pointer text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Splitter.Panel>
          <Splitter.Panel
            min={SIZE_PROFILEVAULT_MIN}
            size={sizeProfileVault}
            className="bg-white rounded-2xl flex-col flex"
          >
            <div className="flex flex-row p-4 justify-between items-center h-[66px] border-b flex-[0_0_auto]">
              <div className="text-base font-semibold text-[#1F2937]">Profile vault</div>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto box-border p-4 flex-1 h-0">
              {caseStreamDocumentList.map((itemDocument, indexDocument) => {
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
            </div>
          </Splitter.Panel>
          <Splitter.Panel
            min={SIZE_PILOT_MIN}
            size={sizePilot}
            className="bg-white rounded-2xl flex-col flex"
          >
            <div className="flex flex-row p-4 justify-between items-center h-[66px] border-b flex-[0_0_auto]">
              {sizePilot > PANEL_SIZE_LIMIT && (
                <div className="text-base font-semibold text-[#1F2937]">Pilot</div>
              )}
              <Button variant="ghost" onClick={handleBtnPanelRightClick}>
                <PanelRight />
              </Button>
            </div>
            <div className="flex-[0_0_auto] p-4 ">
              <div className="whitespace-nowrap font-bold">Steps:</div>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto box-border p-4 flex-1 h-0">
              <Steps
                direction="vertical"
                current={stepListCurrent}
                items={stepListItems}
              />
            </div>
            <div className="flex flex-col gap-2 flex-[0_0_auto] p-4">
              <div className="flex flex-row gap-2">
                <div className="flex flex-row gap-2">
                  <span className="whitespace-nowrap font-bold">Status:</span>
                  <span
                    className={cn('font-bold', {
                      'text-green-500': pilotInfo?.pilotStatus !== PilotStatusEnum.HOLD,
                      'text-red-500': pilotInfo?.pilotStatus === PilotStatusEnum.HOLD,
                    })}
                  >
                    {pilotInfo?.pilotStatus || ''}
                  </span>
                </div>
                <div className="flex flex-row gap-2">
                  <span className="whitespace-nowrap font-bold">Version:</span>
                  <span className={cn('font-bold')}>{extensionsInfo?.version}</span>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Button
                  variant="default"
                  disabled={!extensionsInfo?.version}
                  onClick={handleBtnStartClick}
                >
                  <CirclePlay />
                </Button>
                <Button
                  variant="outline"
                  disabled={!extensionsInfo?.version}
                  onClick={handleBtnStopClick}
                >
                  <CircleStop />
                </Button>

                <Button
                  variant="outline"
                  disabled={
                    !extensionsInfo?.version ||
                    !pilotInfo?.pdfUrl ||
                    !pilotInfo?.cookiesStr
                  }
                  onClick={handleBtnDownloadClick}
                >
                  <Download />
                </Button>

                <Button
                  variant="outline"
                  disabled={!extensionsInfo?.version || !pilotInfo?.tabInfo?.id}
                  onClick={handleBtnJumpClick}
                >
                  <SquareArrowOutUpRight />
                </Button>

                <Button
                  variant="outline"
                  disabled={!extensionsInfo?.version || !pilotInfo?.tabInfo?.id}
                  onClick={handleBtnSidepanelOpenClick}
                >
                  <PanelRight />
                </Button>
              </div>
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
