import { IWorkflowDummyDataType } from '@/types/casePilot';

export enum FileStatus {
  // ANALYSIS = 'ANALYSIS',
  // DONE = 'DONE',
  // ERROR = 'ERROR',
  UPLOADING = 'UPLOADING',
  UPLOAD_COMPLETED = 'UPLOAD_COMPLETED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export enum FileTypeEnum {
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PDF = 'application/pdf',
  JSON = 'application/json',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
  BMP = 'image/bmp',
  ICO = 'image/x-icon',
  TXT = 'text/plain',
  UNKNOW = 'unknow',
}

export interface ICloudFileType {
  id: string;
  originalName: string;
  storageName: string;
  fileType: FileTypeEnum | string;
  fileSize: number;
  storagePath: string;
  videoDuration?: number | null;
  videoThumbnailId?: string | null;
  videoThumbnailUrl?: string | null;
  videoResolution?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IOcrFileType {
  id: string;
  title: string;
  description: string;
  filePath: string;
  fileType: string; // FileTypeEnum;
  fileSize: number;
  storageId: string | null;
  caseId: string;
  documentType: string | null;
  downloadUrl: string | null;
  metadataJson: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  createdBy: string | null;
}

export interface ICaseDocumentType {
  success: boolean;
  documentId: string;
  caseId: string;
  message: string;
  filename: string;
  fileSize: number;
  fileType: string; // 'application/pdf';
  receivedAt: string; // '2025-06-19T15:07:37.719299';
  errorCode: null;
  errorDetails: null;
}

export interface ICaseDocumentInitResultType {
  createdAt: string;
  filename: string;
  fileSize: number;
  documentType: string;
  documentCategory: string;
  id: string;
  fileType: string;
  status: string; // 'REJECTED';
  updatedAt: string;
  storageId: null;
}

export interface IFileItemType {
  localId: string;
  status: FileStatus;
  progress?: number; // ignore
  localFile?: File;
  documentFile?: ICaseDocumentType;
  cloudFile?: ICloudFileType;
  ocrFile?: IOcrFileType;
  ocrResult?: Record<string, string>[];
}

export interface IUploadDocumentEventType {
  status: string;
  documentId: string;
  filename: string;
}

export interface IFilesThirdPartParamsType {
  thirdPartUrl: string;
  cookie: string;
}

export interface IFilesPDFHighlightParamsType {
  fileId: string;
  highlightData: IWorkflowDummyDataType[];
}
