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
import { memo, ReactElement, useEffect, useState } from 'react';

const fileTypeMap: Record<FileTypeEnum, ReactElement> = {
  [FileTypeEnum.DOC]: <IconFileTypeDoc size={40} />,
  [FileTypeEnum.DOCX]: <IconFileTypeDoc size={40} />,
  [FileTypeEnum.XLS]: <IconFileTypeExcel size={40} />,
  [FileTypeEnum.XLSX]: <IconFileTypeExcel size={40} />,
  [FileTypeEnum.PPT]: <IconFileTypePPT size={40} />,
  [FileTypeEnum.PPTX]: <IconFileTypePPT size={40} />,
  [FileTypeEnum.PDF]: <IconFileTypePDF size={40} />,
  [FileTypeEnum.JSON]: <IconFile size={40} />,
  [FileTypeEnum.JPEG]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.PNG]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.GIF]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.WEBP]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.BMP]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.ICO]: <IconFileTypeImage size={40} />,
  [FileTypeEnum.TXT]: <IconFileTypeTXT size={40} />,
  [FileTypeEnum.UNKNOW]: <IconFile size={40} />,
};

const fileStatusMap: Record<FileStatus, ReactElement> = {
  [FileStatus.UPLOADING]: <IconFileStatusLoading size={20} />,
  [FileStatus.ANALYSIS]: <IconFileStatusLoading size={20} />,
  [FileStatus.DONE]: <IconFileStatusSuccess size={20} />,
  [FileStatus.ERROR]: <IconFileStatusError size={20} />,
};

interface ItemFileProps {
  file: IFileItemType;
}

function PureItemFile(props: ItemFileProps) {
  const { file } = props;

  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<FileTypeEnum>(FileTypeEnum.UNKNOW);
  const [fileUpdate, setFileUpdate] = useState<string>('');

  useEffect(() => {
    const { localFile, cloudFile, ocrFile } = file || {};

    console.log('PureItemFile', file);
    let fileNameTmp = '';
    let fileTypeTmp = FileTypeEnum.UNKNOW;
    let fileUpdateTmp = '';

    if (ocrFile) {
      fileNameTmp = ocrFile.title;
      fileTypeTmp = ocrFile.fileType;
    } else if (cloudFile) {
      fileNameTmp = cloudFile.originalName;
      fileTypeTmp = cloudFile.fileType;
    } else if (localFile) {
      fileNameTmp = localFile.name;
      fileTypeTmp = localFile.type as FileTypeEnum;
    }

    setFileName(fileNameTmp);
    setFileType(fileTypeTmp);
    setFileUpdate(fileUpdateTmp);
  }, [file]);

  const renderIconFileType = (): ReactElement => {
    return fileTypeMap[fileType] || fileTypeMap[FileTypeEnum.UNKNOW];
  };

  const renderIconFileStatus = () => {
    return fileStatusMap[file?.status] || null;
  };

  return (
    <div className="flex flex-row justify-between items-center h-10">
      {/*  */}
      <div className="flex flex-row gap-2">
        {/*  */}
        {renderIconFileType()}
        {/*  */}
        <div className="flex flex-col">
          <div className="font-normal text-[0.9375rem]">{fileName}</div>
          <div className="font-semibold text-xs">{fileUpdate || ' '}</div>
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
