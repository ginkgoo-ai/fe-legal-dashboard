import { ICloudFileType } from '@/types/file';
import { AxiosHeaders } from 'axios';
import ApiRequest from '../axios';

export const FileApi = {
  file: '/storage/v1/files',
  files: '/storage/v2/files',
};

// const baseUrl = process.env.LOCAL_BASE_URL
//   ? `${process.env.LOCAL_BASE_URL}:8080/api`
//   : `${process.env.NEXT_PUBLIC_API_URL}/api`;
const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const uploadFile = async (
  file: File,
  config?: {
    onUploadeProgress?: (percentCompleted: number) => void;
    abortSignal?: AbortSignal;
  }
): Promise<ICloudFileType> => {
  const { onUploadeProgress, abortSignal } = config ?? {};
  const formData = new FormData();
  formData.append('file', file);

  return ApiRequest.post(`${baseUrl}${FileApi.file}`, formData, {
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
): Promise<{ cloudFiles: ICloudFileType[] }> => {
  const { onUploadeProgress, abortSignal } = config ?? {};
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return ApiRequest.post(`${baseUrl}${FileApi.files}`, formData, {
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

const downloadCustomFile = async (params: {
  method?: 'GET';
  url: string;
  headers?: AxiosHeaders;
}): Promise<BlobPart> => {
  const {
    method = 'GET',
    url,
    headers = {
      Accept: 'application/octet-stream',
    },
  } = params || {};

  return ApiRequest.get(
    url,
    {},
    {
      baseURL: '',
      headers,
      responseType: 'blob',
    }
  );
};

export { downloadCustomFile, downloadFile, uploadFile, uploadFiles };
