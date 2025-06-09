import {
  IconFile,
  IconFileStatusError,
  IconFileStatusLoading,
  IconFileStatusSuccess,
  IconFileTypeDoc,
  IconFileTypeExcel,
  IconFileTypeImage,
  IconFileTypePDF,
  IconFileTypePPT,
  IconFileTypeTXT,
} from '@/components/ui/icon';
import { FileStatus, FileTypeEnum, IFileItemType } from '@/types/file';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { memo, ReactElement, useEffect, useState } from 'react';

dayjs.extend(utc);

const getFileTypeMap = (params: { size: number; type: FileTypeEnum }): ReactElement => {
  const { size = 40, type } = params || {};
  return {
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
  }[type];
};

const fileStatusMap: Record<FileStatus, ReactElement> = {
  [FileStatus.UPLOADING]: <IconFileStatusLoading size={20} />,
  [FileStatus.ANALYSIS]: <IconFileStatusLoading size={20} />,
  [FileStatus.DONE]: <IconFileStatusSuccess size={20} />,
  [FileStatus.ERROR]: <IconFileStatusError size={20} />,
};

const fileStatusColorMap: Record<FileStatus, string> = {
  [FileStatus.UPLOADING]: '#0061FD',
  [FileStatus.ANALYSIS]: '#0061FD',
  [FileStatus.DONE]: '#27CA40',
  [FileStatus.ERROR]: '#FF0C00',
};

interface ItemFileProps {
  file: IFileItemType;
  isFold?: boolean;
}

function PureItemFile(props: ItemFileProps) {
  const { file, isFold } = props;

  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<FileTypeEnum>(FileTypeEnum.UNKNOW);
  const [fileUpdate, setFileUpdate] = useState<string>('');

  useEffect(() => {
    const { localFile, cloudFile, ocrFile } = file || {};
    let dayjsUpdate = dayjs();
    let fileNameTmp = '';
    let fileTypeTmp = FileTypeEnum.UNKNOW;
    let fileUpdateTmp = '';

    if (ocrFile) {
      fileNameTmp = ocrFile.title;
      fileTypeTmp = ocrFile.fileType;
      dayjsUpdate = dayjs.utc(ocrFile.updatedAt).local();
      console.log('dayjsUpdate1', dayjsUpdate);
    } else if (cloudFile) {
      fileNameTmp = cloudFile.originalName;
      fileTypeTmp = cloudFile.fileType;
      dayjsUpdate = dayjs.utc(cloudFile.updatedAt).local();
      console.log('dayjsUpdate2', dayjsUpdate);
    } else if (localFile) {
      fileNameTmp = localFile.name;
      fileTypeTmp = localFile.type as FileTypeEnum;
      dayjsUpdate = dayjs();
      console.log('dayjsUpdate3', dayjsUpdate);
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

  const renderIconFileType = (): ReactElement => {
    return (
      <div className="relative">
        {getFileTypeMap({ size: isFold ? 22 : 40, type: fileType })}
        {isFold && (
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

  return isFold ? (
    <div className="flex flex-row justify-center items-center h-10">
      {renderIconFileType()}
    </div>
  ) : (
    <div className="flex flex-row justify-between items-center h-10">
      <div className="flex flex-row gap-2">
        {/* Icon */}
        {renderIconFileType()}
        {/* Name */}
        <div className="flex flex-col">
          <div className="font-normal text-[0.9375rem]">{fileName}</div>
          <div className="font-semibold text-xs text-[#B4B3B3]">{fileUpdate || ' '}</div>
        </div>
      </div>
      {/* Status */}
      <div className="flex justify-center items-center">
        <div>{renderIconFileStatus()}</div>
      </div>
    </div>
  );
}

export const ItemFile = memo(PureItemFile);
