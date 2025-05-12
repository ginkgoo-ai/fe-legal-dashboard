import { Input } from '@/components/ui/input';
import { cn } from '@/utils';
import { Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  className?: string;
  label?: string;
  subLabel?: string;
  id?: string;
  triggerText?: string;
  hideUploadIcon?: boolean;
}

export function FileUpload({
  accept = 'application/pdf,image/jpeg,image/png,image/gif,image/webp',
  multiple = true,
  maxSize = 50,
  onChange,
  onError,
  className,
  label = 'Drag & drop your file',
  subLabel = 'Supported file types: PDF, JPEG, PNG, GIF, WEBP',
  id,
  triggerText = 'browse files',
  hideUploadIcon,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

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
    [onError, validateFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
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
    <div className={cn('relative', className)}>
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
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border border-dashed border-primary rounded-lg p-8 text-center transition-colors duration-200 bg-primary/5 cursor-pointer hover:bg-primary/10',
            isDragging && 'border-primary bg-primary/10'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            {hideUploadIcon ? null : (
              <div className="aspect-square rounded-md sl-layout-background border border-default p-2 mb-2">
                <Upload className="text-gray-500" size={18} />
              </div>
            )}
            <p className="text-sm text-gray-500">
              {label}
              {', or '}
              <span className="text-primary hover:underline cursor-pointer">
                {triggerText}
              </span>
            </p>
            <p className="text-xs text-muted-foreground italic">
              {subLabel}({maxSize}MB)
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}
