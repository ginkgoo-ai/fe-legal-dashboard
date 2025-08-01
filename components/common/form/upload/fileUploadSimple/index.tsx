import { buttonVariants } from '@/components/ui/button';
import { IconFileUpload } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';
import { useCallback, useRef } from 'react';

export interface FileUploadSimpleProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  className?: string;
  id?: string;
  children: React.ReactNode;
}

export function FileUploadSimple({
  accept = 'application/pdf,image/jpeg,image/png,image/gif,image/webp',
  multiple = true,
  maxSize = 50,
  onChange,
  onError,
  className,
  id,
  children,
}: FileUploadSimpleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]) => {
      const acceptedTypes = accept.split(',');
      for (const file of files) {
        // 检查文件类型
        const isAccepted = acceptedTypes.some(type => file.type.match(type.trim()));
        if (!isAccepted) {
          throw new Error(`File type not supported: ${file.name}`);
        }
        // 检查文件大小
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}`);
        }
      }
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;

      try {
        const fileArray = Array.from(files);
        validateFiles(fileArray);
        onChange?.(fileArray);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Unknown error');
      }
    },
    [validateFiles, onChange, onError]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      handleFiles(files);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  return (
    <div className={cn('relative w-full box-border', className)}>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        id={id ?? 'file-upload'}
      />
      <label htmlFor={id ?? 'file-upload'}>
        {children ? (
          children
        ) : (
          <div
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'w-full border-dashed text-primary'
            )}
          >
            <IconFileUpload size={24} />
            <span className="font-semibold">Add files</span>
          </div>
        )}
      </label>
    </div>
  );
}
