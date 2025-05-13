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
