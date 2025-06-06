import {
  IconFile,
  IconFileTypeDoc,
  IconFileTypeExcel,
  IconFileTypeImage,
  IconFileTypePDF,
  IconFileTypePPT,
  IconFileTypeTXT,
} from '@/components/ui/icon';
import { FileType } from '@/types/file';
import { memo, ReactElement, useEffect } from 'react';

interface ItemFileProps {
  resultFile?: FileType;
}

function PureItemFile(props: ItemFileProps) {
  const { resultFile } = props;

  useEffect(() => {}, [resultFile]);

  const renderIconFileType = () => {
    const fileTypeMap: Record<string, ReactElement> = {
      'application/msword': <IconFileTypeDoc size={24} />,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': (
        <IconFileTypeDoc size={24} />
      ),
      'application/vnd.ms-excel': <IconFileTypeExcel size={24} />,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': (
        <IconFileTypeExcel size={24} />
      ),
      'image/jpeg': <IconFileTypeImage size={24} />,
      'image/png': <IconFileTypeImage size={24} />,
      'image/gif': <IconFileTypeImage size={24} />,
      'image/webp': <IconFileTypeImage size={24} />,
      'application/pdf': <IconFileTypePDF size={24} />,
      'application/vnd.ms-powerpoint': <IconFileTypePPT size={24} />,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': (
        <IconFileTypePPT size={24} />
      ),
      'text/plain': <IconFileTypeTXT size={24} />,
    };
    return fileTypeMap[resultFile?.fileType || ''] || <IconFile size={24} />;
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div>{renderIconFileType()}</div>
    </div>
  );
}

export const ItemFile = memo(PureItemFile);
