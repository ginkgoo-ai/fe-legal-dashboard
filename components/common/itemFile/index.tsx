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
import { memo, ReactElement, useEffect, useState } from 'react';

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
      dayjsUpdate = dayjs(ocrFile.updatedAt);
    } else if (cloudFile) {
      fileNameTmp = cloudFile.originalName;
      fileTypeTmp = cloudFile.fileType;
      dayjsUpdate = dayjs(cloudFile.updatedAt);
    } else if (localFile) {
      fileNameTmp = localFile.name;
      fileTypeTmp = localFile.type as FileTypeEnum;
      dayjsUpdate = dayjs();
    }

    const now = dayjs();
    const diffMinutes = now.diff(dayjsUpdate, 'minute');
    const diffHours = now.diff(dayjsUpdate, 'hour');
    const diffDays = now.diff(dayjsUpdate, 'day');

    if (diffDays > 0) {
      fileUpdateTmp = `Uploaded ${diffDays} days ago`;
    } else if (diffHours > 0) {
      fileUpdateTmp = `Uploaded ${diffHours} hours ago`;
    } else if (diffMinutes > 0) {
      fileUpdateTmp = `Uploaded ${diffMinutes} minutes ago`;
    } else {
      fileUpdateTmp = 'Uploaded just now';
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
