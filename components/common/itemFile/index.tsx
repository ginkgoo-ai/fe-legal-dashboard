import {
  IconFile,
  IconFileTypeDoc,
  IconFileTypeExcel,
  IconFileTypeImage,
  IconFileTypePDF,
  IconFileTypePPT,
  IconFileTypeTXT,
} from '@/components/ui/icon';
import { FileStatus, FileTypeEnum, IFileItemType } from '@/types/file';
import { Button } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { X } from 'lucide-react';
import { memo, ReactElement, useEffect, useState } from 'react';

/**
| **Time Difference (Δt)**          | **Display Text (English)** | **Example (Current Time: ~Jun 9, 2025, 04:28 AM)** |
| --------------------------------- | -------------------------- | -------------------------------------------------- |
| `0s ≤ Δt < 10s`                   | `Just now`                 | `Just now`                                         |
| `10s ≤ Δt < 60s`                  | `X seconds ago`            | `35 seconds ago`                                   |
| `1 min ≤ Δt < 2 mins`             | `A minute ago`             | `A minute ago`                                     |
| `2 mins ≤ Δt < 60 mins`           | `X minutes ago`            | `45 minutes ago`                                   |
| `1 hr ≤ Δt < 2 hrs`               | `An hour ago`              | `An hour ago`                                      |
| `2 hrs ≤ Δt < 24 hrs`             | `X hours ago`              | `18 hours ago`                                     |
| Falls on **yesterday**'s date     | `Yesterday at HH:mm`       | `Yesterday at 2:30 PM`                             |
| `2 days ≤ Δt < 7 days`            | `X days ago`               | `3 days ago`                                       |
| `Δt ≥ 7 days` **(Current Year)**  | `MMM D`                    | `Jun 2`                                            |
| `Δt ≥ 7 days` **(Previous Year)** | `MMM D, YYYY`              | `Dec 25, 2024`                                     |
| **Future Timestamp**              | `Month D at HH:mm`         | `June 15 at 10:00 AM`                              |
| **On Hover/Click**                | `YYYY-MM-DD HH:mm:ss`      | `2025-06-08 10:15:30`                              |
*/

dayjs.extend(utc);

const getFileTypeMap = (params: { size: number; type: FileTypeEnum }): ReactElement => {
  const { size = 40, type } = params || {};

  const typeMap = {
    [FileTypeEnum.DOC]: <IconFileTypeDoc size={size} />,
    [FileTypeEnum.DOCX]: <IconFileTypeDoc size={size} />,
    [FileTypeEnum.XLS]: <IconFileTypeExcel size={size} />,
    [FileTypeEnum.XLSX]: <IconFileTypeExcel size={size} />,
    [FileTypeEnum.PPT]: <IconFileTypePPT size={size} />,
    [FileTypeEnum.PPTX]: <IconFileTypePPT size={size} />,
    [FileTypeEnum.PDF]: <IconFileTypePDF size={size} />,
    [FileTypeEnum.JSON]: <IconFile size={size} />,
    [FileTypeEnum.JPEG]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.PNG]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.GIF]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.WEBP]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.BMP]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.ICO]: <IconFileTypeImage size={size} />,
    [FileTypeEnum.TXT]: <IconFileTypeTXT size={size} />,
    [FileTypeEnum.UNKNOW]: <IconFile size={size} />,
  };

  return typeMap[type] || typeMap[FileTypeEnum.UNKNOW];
};

const fileStatusMap: Record<FileStatus, ReactElement> = {
  [FileStatus.UPLOADING]: <div className="text-sm text-[#0061FD]">Uploading...</div>,
  [FileStatus.UPLOAD_COMPLETED]: (
    <div className="text-sm text-[#0061FD]">Analyzing...</div>
  ),
  [FileStatus.COMPLETED]: <div className="text-sm text-[#27CA40]">Analyzed</div>,
  [FileStatus.FAILED]: <div className="text-sm text-[#FF0C00]">Failed</div>,
  [FileStatus.REJECTED]: <div className="text-sm text-[#FF0C00]">Failed</div>,
};

const fileStatusColorMap: Record<FileStatus, string> = {
  [FileStatus.UPLOADING]: '#0061FD',
  [FileStatus.UPLOAD_COMPLETED]: '#0061FD',
  [FileStatus.COMPLETED]: '#27CA40',
  [FileStatus.FAILED]: '#FF0C00',
  [FileStatus.REJECTED]: '#FF0C00',
};

const extMap: Record<string, FileTypeEnum> = {
  doc: FileTypeEnum.DOC,
  docx: FileTypeEnum.DOCX,
  xls: FileTypeEnum.XLS,
  xlsx: FileTypeEnum.XLSX,
  ppt: FileTypeEnum.PPT,
  pptx: FileTypeEnum.PPTX,
  pdf: FileTypeEnum.PDF,
  json: FileTypeEnum.JSON,
  jpeg: FileTypeEnum.JPEG,
  jpg: FileTypeEnum.JPEG,
  png: FileTypeEnum.PNG,
  gif: FileTypeEnum.GIF,
  webp: FileTypeEnum.WEBP,
  bmp: FileTypeEnum.BMP,
  ico: FileTypeEnum.ICO,
  txt: FileTypeEnum.TXT,
};

interface ItemFileProps {
  mode: 'CreateCase' | 'Reference';
  file: IFileItemType;
  isFold?: boolean;
  onBtnDeleteClick?: () => void;
}

function PureItemFile(props: ItemFileProps) {
  const { mode, file, isFold, onBtnDeleteClick } = props;

  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<FileTypeEnum>(FileTypeEnum.UNKNOW);
  const [fileUpdate, setFileUpdate] = useState<string>('');

  useEffect(() => {
    const { localFile, documentFile, documentInitResultFile } = file || {};
    let dayjsUpdate = dayjs();
    let fileNameTmp = '';
    let fileTypeTmp = FileTypeEnum.UNKNOW;
    let fileUpdateTmp = '';

    if (documentInitResultFile) {
      fileNameTmp = documentInitResultFile.filename;
      fileTypeTmp = documentInitResultFile.fileType as FileTypeEnum;
      dayjsUpdate = dayjs.utc(documentInitResultFile.updatedAt).local();
    } else if (documentFile) {
      fileNameTmp = documentFile.filename;
      fileTypeTmp = documentFile.fileType as FileTypeEnum;
      dayjsUpdate = dayjs.utc(documentFile.receivedAt).local();
    } else if (localFile) {
      fileNameTmp = localFile.name;
      fileTypeTmp = localFile.type as FileTypeEnum;
      dayjsUpdate = dayjs();
    }

    if (!fileTypeTmp && fileNameTmp) {
      const ext = fileNameTmp.split('.').pop()?.toLowerCase();
      fileTypeTmp = (ext && extMap[ext]) || FileTypeEnum.UNKNOW;
    }

    const now = dayjs();
    const diffSeconds = now.diff(dayjsUpdate, 'second');
    const diffMinutes = now.diff(dayjsUpdate, 'minute');
    const diffHours = now.diff(dayjsUpdate, 'hour');
    const diffDays = now.diff(dayjsUpdate, 'day');
    const isYesterday = dayjsUpdate.isSame(now.subtract(1, 'day'), 'day');
    const isCurrentYear = dayjsUpdate.year() === now.year();
    const isFuture = dayjsUpdate.isAfter(now);

    if (isFuture) {
      // fileUpdateTmp = dayjsUpdate.format('MMMM D [at] h:mm A');
      fileUpdateTmp = 'Just now';
    } else if (diffSeconds < 10) {
      fileUpdateTmp = 'Just now';
    } else if (diffSeconds < 60) {
      fileUpdateTmp = `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 2) {
      fileUpdateTmp = 'A minute ago';
    } else if (diffMinutes < 60) {
      fileUpdateTmp = `${diffMinutes} minutes ago`;
    } else if (diffHours < 2) {
      fileUpdateTmp = 'An hour ago';
    } else if (diffHours < 24) {
      fileUpdateTmp = `${diffHours} hours ago`;
    } else if (isYesterday) {
      fileUpdateTmp = `Yesterday at ${dayjsUpdate.format('h:mm A')}`;
    } else if (diffDays < 7) {
      fileUpdateTmp = `${diffDays} days ago`;
    } else if (isCurrentYear) {
      fileUpdateTmp = dayjsUpdate.format('MMM D');
    } else {
      fileUpdateTmp = dayjsUpdate.format('MMM D, YYYY');
    }

    setFileName(fileNameTmp);
    setFileType(fileTypeTmp);
    setFileUpdate(fileUpdateTmp);
  }, [file]);

  const handleBtnDeleteClick = () => {
    onBtnDeleteClick?.();
  };

  const renderIconFileType = (params: {
    size: number;
    isDot?: boolean;
  }): ReactElement => {
    const { size, isDot } = params || {};

    return (
      <div className="relative">
        {getFileTypeMap({ size, type: fileType })}
        {isDot && (
          <div
            className="absolute -right-1 -bottom-2 rounded-full w-2 h-2"
            style={{
              backgroundColor: fileStatusColorMap[file?.status],
            }}
          ></div>
        )}
      </div>
    );
  };

  const renderIconFileStatus = () => {
    return fileStatusMap[file?.status] || null;
  };

  const renderModeCreateCase = () => {
    return (
      <div className="flex flex-row justify-start items-center h-14 rounded-lg border border-solid border-[#E1E1E2] bg-[#FCFCFC] pl-6 pr-2 box-border gap-2">
        {/* Icon */}
        {renderIconFileType({ size: 16, isDot: false })}
        {/* Name */}
        <div className="flex flex-col flex-1 w-0">
          <div className="font-normal text-base truncate">{fileName}</div>
        </div>
        {/* Status */}
        <div className="flex justify-center items-center">
          <Button
            type="text"
            icon={
              <div className="flex justify-center items-center">
                <X size={20} color="#A1A1AA" />
              </div>
            }
            onClick={handleBtnDeleteClick}
          />
        </div>
      </div>
    );
  };

  const renderModeReference = () => {
    return isFold ? (
      <div className="flex flex-row justify-center items-center h-10">
        {renderIconFileType({ size: 22, isDot: true })}
      </div>
    ) : (
      <div className="flex flex-row justify-start items-center h-10 gap-2">
        {/* Icon */}
        {renderIconFileType({ size: 40, isDot: false })}
        {/* Name */}
        <div className="flex flex-col flex-1 w-0">
          <div className="font-normal text-[0.9375rem] text-foreground truncate">
            {fileName}
          </div>
          <div className="font-semibold text-xs text-[#B4B3B3] truncate">
            {fileUpdate || ' '}
          </div>
        </div>
        {/* Status */}
        <div className="flex justify-center items-center">
          <div>{renderIconFileStatus()}</div>
        </div>
      </div>
    );
  };

  return (
    {
      CreateCase: renderModeCreateCase(),
      Reference: renderModeReference(),
    }[mode] || null
  );
}

export const ItemFile = memo(PureItemFile);
