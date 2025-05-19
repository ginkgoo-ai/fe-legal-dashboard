'use client';

import { BadgeStatus } from '@/components/badgeStatus';
import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { HeaderRobot } from '@/components/headerRobot';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEventManager } from '@/hooks/useEventManager';
import { cn } from '@/lib/utils';
import { caseStream } from '@/service/api';
import { uploadFiles } from '@/service/api/file';
import { FileType } from '@/types/file';
import {
  CaseStreamStatusEnum,
  IActionItemType,
  IStepItemType,
  PilotStatusEnum,
} from '@/types/pilot';
import { Splitter, StepProps, Steps, Tag, Tooltip } from 'antd';
import { produce } from 'immer';
import { FileText, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { mockUploadFile } from './mock';

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

export default function UploadFilePage() {
  const [fileList, setFileList] = useState<IFileItemType[]>([]);
  const [caseId, setCaseId] = useState<string>('44c6cd75-b7c4-4e27-b643-ab14c15ee3a0');
  const [caseStreamStatus, setCaseStreamStatus] = useState<CaseStreamStatusEnum>(
    CaseStreamStatusEnum.INIT
  );
  const [caseStreamDocumentList, setCaseStreamDocumentList] = useState<any[]>([]);
  const [pilotStatus, setPilotStatus] = useState<PilotStatusEnum>(PilotStatusEnum.HOLD);
  const [stepListCurrent, setStepListCurrent] = useState<number>(0);
  const [stepListItems, setStepListItems] = useState<StepProps[]>([]);

  const { emit } = useEventManager('ginkgo-message', message => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type, pilotItem } = message;
    if (type === 'ginkgo-background-all-pilot-update') {
      setPilotStatus(pilotItem.pilotStatus);
      setStepListCurrent(pilotItem.stepListCurrent);
      setStepListItems(calcStepListCurrent(pilotItem.stepListItems));
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

  const actionAnalysisFile = async (cloudFiles: FileType[]) => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (Math.random() < 0.5) {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach((file: IFileItemType) => {
            if (
              cloudFiles.some(cloudFile => {
                return cloudFile.id === file.resultFile?.id;
              })
            ) {
              file.status = FileStatus.DONE;
              file.progress = 100;
              file.resultAnalysis = mockUploadFile;
            }
          });
        })
      );
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
      await actionAnalysisFile(data.cloudFiles);
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
          console.log('🚀 ~ res:', res);
          // const parts = parseMessageContent(res);

          setCaseStreamStatus(CaseStreamStatusEnum.STREAMING);
          // originalMessageLogRef.current = res;
          try {
            const data = JSON.parse(res);
            setCaseStreamDocumentList(
              data.documents.map((itemDocument: any) => {
                const metadataForFrontObject = JSON.parse(itemDocument.metadataJson);
                return {
                  ...itemDocument,
                  metadataForFront: metadataForFrontObject
                    ? Object.keys(metadataForFrontObject).map((key: any) => {
                        return {
                          key,
                          value: metadataForFrontObject[key],
                        };
                      })
                    : [],
                };
              })
            );
          } catch (error) {
            console.error('Error parse message', error);
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

  return (
    <div className="box-border flex w-full flex-1 flex-col gap-4 py-4">
      <h1 className="text-xl font-bold">Pilot Detail</h1>

      <div className="flex-1">
        <Splitter lazy style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel defaultSize="30%" min="20%" max="70%">
            <div className="flex-col gap-4">
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
          <Splitter.Panel defaultSize="40%" min="20%" max="70%">
            <div>{caseStreamStatus}</div>
            <div className="flex flex-col gap-2">
              {caseStreamDocumentList.map((itemDocument, indexDocument) => {
                return (
                  <div key={`case-stream-document-${indexDocument}`}>
                    <div>{itemDocument.title}</div>
                    <div>{itemDocument.description}</div>
                    {itemDocument.metadataForFront.map(
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
                  </div>
                );
              })}
            </div>
          </Splitter.Panel>
          <Splitter.Panel defaultSize="30%" min="20%" max="70%">
            <HeaderRobot />
            <div className="flex flex-col gap-2 h-full overflow-y-auto">
              <div className="flex flex-row gap-2">
                <span className="whitespace-nowrap font-bold">Status:</span>
                <span
                  className={cn('font-bold', {
                    'text-green-500': pilotStatus !== PilotStatusEnum.HOLD,
                    'text-red-500': pilotStatus === PilotStatusEnum.HOLD,
                  })}
                >
                  {pilotStatus}
                </span>
              </div>
              <div className="whitespace-nowrap font-bold">Steps:</div>
              <Steps
                direction="vertical"
                current={stepListCurrent}
                items={stepListItems}
              />
            </div>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
