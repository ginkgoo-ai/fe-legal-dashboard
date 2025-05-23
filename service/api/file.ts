import { FileType } from '@/types/file';
import ApiRequest from '../axios';

export const FileApi = {
  file: '/storage/v1/files',
  files: '/storage/v2/files',
};

const uploadFile = async (
  file: File,
  config?: {
    onUploadeProgress?: (percentCompleted: number) => void;
    abortSignal?: AbortSignal;
  }
): Promise<FileType> => {
  const { onUploadeProgress, abortSignal } = config ?? {};
  const formData = new FormData();
  formData.append('file', file);

  return ApiRequest.post(`${FileApi.file}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal: abortSignal,
    onUploadProgress: progressEvent => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent?.total ?? 0)
      );
      onUploadeProgress?.(percentCompleted);
    },
  });
};

const uploadFiles = async (
  files: File[],
  config?: {
    onUploadeProgress?: (percentCompleted: number) => void;
    abortSignal?: AbortSignal;
  }
): Promise<{ cloudFiles: FileType[] }> => {
  const { onUploadeProgress, abortSignal } = config ?? {};
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return ApiRequest.post(`${FileApi.files}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal: abortSignal,
    onUploadProgress: progressEvent => {
      console.log('progressEvent', progressEvent);
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent?.total ?? 0)
      );
      onUploadeProgress?.(percentCompleted);
    },
  });
};

const downloadFile = async (fileId: string): Promise<BlobPart> => {
  return ApiRequest.post(
    `${FileApi.file}/${fileId}`,
    {},
    {
      headers: {
        Accept: 'application/octet-stream',
      },
      responseType: 'blob',
    }
  );
};

const saveBlob = (blobPart: BlobPart, fileName: string) => {
  const blob = new Blob([blobPart]);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export { downloadFile, saveBlob, uploadFile, uploadFiles };
