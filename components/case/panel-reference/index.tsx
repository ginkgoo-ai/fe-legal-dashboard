import { BadgeStatus } from '@/components/badgeStatus';
import { PanelContainer } from '@/components/case/panel-container';
import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ocrDocuments } from '@/service/api';
import { uploadFiles } from '@/service/api/file';
import { ICaseItemType } from '@/types/case';
import { FileStatus, FileType, IFileItemType } from '@/types/file';
import { produce } from 'immer';
import { FileText, Loader2, PanelLeft, RotateCcw, X } from 'lucide-react';
import { Dispatch, memo, SetStateAction } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

interface PanelReferenceProps {
  caseInfo: ICaseItemType | null;
  showTitle: boolean;
  fileList: IFileItemType[];
  onFileListUpdate: Dispatch<SetStateAction<IFileItemType[]>>;
  onBtnPanelLeftClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const { caseInfo, showTitle, fileList, onFileListUpdate, onBtnPanelLeftClick } = props;

  const actionOcrFile = async (cloudFiles: FileType[]) => {
    const data = await ocrDocuments({
      caseId: caseInfo?.id || '',
      storageIds: cloudFiles.map(file => file.id),
    });

    if (data?.length > 0) {
      // TODO:
    } else {
      toast.error('Analysis file failed.');
      onFileListUpdate(prev =>
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
      onFileListUpdate(prev =>
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
      onFileListUpdate(prev =>
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

  const handleFileChange = async (files: File[]) => {
    const newFiles = files.map(file => ({
      localId: uuid(),
      status: FileStatus.UPLOADING,
      file,
      progress: 0,
    }));

    onFileListUpdate(prev =>
      produce(prev, draft => {
        draft.push(...newFiles);
      })
    );

    await actionUploadFile(newFiles);
  };

  const handleFileError = (error: string) => {
    toast.error(error);
  };

  const handleFileRetry = async (indexFile: number) => {
    onFileListUpdate(prev =>
      produce(prev, draft => {
        draft[indexFile].status = FileStatus.UPLOADING;
      })
    );

    await actionUploadFile([fileList[indexFile]]);
  };

  return (
    <PanelContainer
      title="Reference"
      showTitle={showTitle}
      renderHeaderExtend={() => {
        return (
          <Button variant="ghost" onClick={onBtnPanelLeftClick}>
            <PanelLeft />
          </Button>
        );
      }}
    >
      <div className="flex flex-col gap-2 overflow-y-auto box-border flex-1 h-0">
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
                    onFileListUpdate(fileList.filter((_, i) => i !== indexFile));
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
    </PanelContainer>
  );
}

export const PanelReference = memo(PurePanelReference);
