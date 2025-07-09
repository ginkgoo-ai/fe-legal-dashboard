'use client';

import { BadgeStatus } from '@/components/badgeStatus';
import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useInterval } from '@/hooks/useInterval';
import { uploadFiles } from '@/service/api/file';
import { FileStatus, ICloudFileType, IFileItemType } from '@/types/file';
import { produce } from 'immer';
import { FileText, Loader2, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { mockUploadFile } from './mock';

export default function UploadFilePage() {
  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  useInterval(
    () => {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach(file => {
            if ((file?.progress ?? 0) >= 100) return;

            const shouldUpdate =
              file.status === FileStatus.UPLOADING && Math.random() < 0.6;
            if (!shouldUpdate) return;

            const maxIncrement = 8;
            const increment = Math.floor(Math.random() * maxIncrement) + 1;

            file.progress = Math.max(
              file?.progress ?? 0,
              Math.min(
                90 + Math.floor(Math.random() * 10),
                (file?.progress ?? 0) + increment
              )
            );
          });
        })
      );
    },
    400,
    true
  );

  const actionAnalysisFile = async (cloudFiles: ICloudFileType[]) => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (Math.random() < 0.5) {
      setFileList(prev =>
        produce(prev, draft => {
          draft.forEach((file: IFileItemType) => {
            if (
              cloudFiles.some(cloudFile => {
                return cloudFile.id === file.cloudFile?.id;
              })
            ) {
              file.status = FileStatus.COMPLETED;
              file.progress = 100;
              file.ocrResult = mockUploadFile;
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
                return cloudFile.id === file.cloudFile?.id;
              })
            ) {
              file.status = FileStatus.FAILED;
              file.progress = 0;
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
        onUploadeProgress: () => {
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
              file.status = FileStatus.UPLOAD_COMPLETED;
              file.progress = 100;
              file.cloudFile = data.cloudFiles[indexNewFile];
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
              file.status = FileStatus.FAILED;
              file.progress = 0;
            }
          });
        })
      );
    }
  };

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
      <h1 className="text-xl font-bold">Upload File</h1>

      <div className="flex flex-col gap-4">
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
                      {itemFile.localFile?.name || ''}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <Progress value={itemFile.progress} />
                    {itemFile.status === FileStatus.UPLOAD_COMPLETED && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled
                        className="w-1 h-1 flex-shrink-0 cursor-pointer text-destructive hover:text-destructive/80"
                      >
                        <Loader2 className="animate-spin" color="#333333" />
                      </Button>
                    )}
                    {itemFile.status === FileStatus.FAILED && (
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
              {itemFile.status === FileStatus.COMPLETED && (
                <div className="flex flex-col gap-2">
                  {itemFile.ocrResult?.map((itemResult, indexResult) => (
                    <div key={indexResult} className="flex flex-row gap-2">
                      <div className="flex-[0_0_auto] max-w-[50%] text-xs font-semibold whitespace-pre-wrap">
                        {itemResult.key}:
                      </div>
                      <div className="flex-1 text-xs whitespace-pre-wrap">
                        {itemResult.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
