import defaultWorkspaceImage from '@/assets/default-workspace.png';
import defaultImage from '@/assets/default.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Loading } from '@/components/ui/loading';
import { cn } from '@/utils';
import React, { ChangeEvent, useRef, useState } from 'react';

export interface AvatarUploadProps {
  url?: string;
  onChange?: (file: File | null) => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
  uploadText?: string;
  loading?: boolean;
  scenario?: 'user' | 'workspace';
}

export default React.forwardRef<HTMLInputElement, AvatarUploadProps>(
  ({
    url,
    onChange,
    error,
    disabled,
    className,
    title,
    description,
    loading,
    uploadText,
    scenario,
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(url);
    const inputRef = useRef<HTMLInputElement>(null);
    const workspaceImage =
      scenario === 'workspace' ? defaultWorkspaceImage : defaultImage;

    // React.useEffect(() => {
    //   if (url && url !== workspaceImage) {
    //     setPreviewUrl(url);
    //   }
    // });

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange?.(file);
    };

    return (
      <div className={cn('relative  flex flex-row', className ?? '')}>
        {/* <Loading loading={loading}>
          <div
            className={cn(
              'w-32 h-32 relative bg-background rounded-lg flex items-center justify-center overflow-hidden mr-4',
              error && 'border-2 border-red-500',
            )}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={workspaceImage} className="w-full h-full object-cover" />
            )}
          </div>
        </Loading> */}
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <span className={cn(error && 'text-red-500')}>{title}</span>
            <p
              className={cn(
                'text-sm text-muted-foreground mb-4',
                error && 'text-red-500'
              )}
            >
              {description}
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Input
                id="avatar-upload"
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled}
              />
              <Button
                variant="outline"
                className="rounded-full"
                disabled={loading}
                onClick={e => {
                  e.preventDefault();
                  inputRef?.current?.click();
                }}
              >
                {uploadText ?? 'Upload'}
              </Button>
            </label>

            {/* {previewUrl && url !== workspaceImage && !loading && (
              <Button
                variant="outline"
                className="text-red-500 bg-white dark:bg-black rounded-full"
                onClick={() => {
                  setPreviewUrl(undefined);
                  onChange?.(null);
                }}
              >
                <Trash2 />
              </Button>
            )} */}
          </div>
        </div>
      </div>
    );
  }
);
