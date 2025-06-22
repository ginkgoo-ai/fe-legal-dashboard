export interface IMarkDocumentValid {
  documentId: string;
  markAsValid: boolean;
  reason?: string;
  reviewedBy?: string;
}
