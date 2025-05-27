export enum FileStatus {
  UPLOADING = 'UPLOADING',
  ANALYSIS = 'ANALYSIS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export type FileType = {
  id: string;
  originalName: string;
  storageName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  videoDuration?: number;
  videoThumbnailId?: string;
  videoThumbnailUrl?: string;
  videoResolution?: string;
  createdAt: string;
  updatedAt: string;
};

export interface IFileItemType {
  localId: string;
  status: FileStatus;
  file: File;
  progress: number;
  resultAnalysis?: Record<string, string>[];
  resultFile?: FileType;
}
