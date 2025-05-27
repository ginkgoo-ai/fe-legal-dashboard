import { BadgeStatus } from '@/components/badgeStatus';
import { PanelContainer } from '@/components/case/panel-container';
import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileStatus, IFileItemType } from '@/types/file';
import { FileText, Loader2, PanelLeft, RotateCcw, X } from 'lucide-react';
import { memo } from 'react';

interface PanelReferenceProps {
  showTitle: boolean;
  fileList: IFileItemType[];
  onFileChange: (files: File[]) => void;
  onFileError: (error: string) => void;
  onFileRetry: (index: number) => void;
  onFileListUpdate: (files: IFileItemType[]) => void;
  onBtnPanelLeftClick: () => void;
}

function PurePanelReference(props: PanelReferenceProps) {
  const {
    showTitle,
    fileList,
    onFileChange,
    onFileError,
    onFileRetry,
    onFileListUpdate,
    onBtnPanelLeftClick,
  } = props;

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
            onChange={onFileChange}
            onError={onFileError}
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
                          onFileRetry(indexFile);
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
