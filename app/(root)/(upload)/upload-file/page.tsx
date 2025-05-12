'use client';

import { FileUpload } from '@/components/common/form/upload/fileUpload';
import { Progress } from '@/components/ui/progress';
import { useInterval } from '@/hooks/useInterval';
import { FileText, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { mockUploadFile } from './mock';

interface IFileItemType {
  id: string;
  file: File;
  progress: number;
  result?: Record<string, string>[];
}

export default function UploadFilePage() {
  const [fileList, setFileList] = useState<IFileItemType[]>([]);

  useInterval(
    () => {
      setFileList(prev =>
        prev.map(file => {
          if (file.progress >= 100) return file;

          const shouldUpdate = Math.random() < 0.3;
          if (!shouldUpdate) return file;

          const maxIncrement = 8;
          const increment = Math.floor(Math.random() * maxIncrement) + 1;

          return {
            ...file,
            progress: Math.min(95, file.progress + increment),
          };
        })
      );
    },
    400,
    true
  );

  const uploadFile = async (file: IFileItemType) => {
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
    // const data = await response.json();

    // console.log(data);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));

    setFileList(prev =>
      prev.map(filePrev => {
        if (filePrev.id === file.id) {
          return {
            ...filePrev,
            progress: 100,
            result: mockUploadFile,
          };
        }
        return filePrev;
      })
    );

    return;
  };

  const handleFileChange = (files: File[]) => {
    const newFiles = files.map(file => {
      const newFile = {
        file,
        id: uuid(),
        progress: 0,
      };
      uploadFile(newFile);
      return newFile;
    });

    setFileList(prev => [...prev, ...newFiles]);
  };

  const handleFileError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="box-border flex w-full flex-1 flex-col gap-4 py-4">
      <h1 className="text-xl font-bold">Upload File</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <FileUpload
            accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
            multiple
            maxSize={50}
            onChange={handleFileChange}
            onError={handleFileError}
            label="Drag & drop your file"
            subLabel="Supported file types: PDF, JPG, PNG, GIF, WEBP"
            triggerText="browse files"
          />
        </div>
        <div className="flex flex-col gap-2">
          {fileList.map((file, index) => (
            <div key={`${file.id}`} className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-default">
                <div className="bg-form-background border border-default rounded-lg flex items-center justify-center p-2">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col gap-2 min-w-0 flex-1 mx-4">
                  <div className="text-xs truncate font-semibold">{file.file.name}</div>
                  <Progress value={file.progress} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFileList(fileList.filter((_, i) => i !== index));
                  }}
                  className="flex-shrink-0 text-destructive hover:text-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {file.result && (
                <div className="flex flex-col gap-2">
                  {file.result.map((item, index) => (
                    <div key={index} className="flex flex-row gap-2">
                      <div className="flex-[0_0_auto] max-w-[50%] text-xs font-semibold whitespace-pre-wrap">
                        {item.key}:
                      </div>
                      <div className="flex-1 text-xs whitespace-pre-wrap">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
