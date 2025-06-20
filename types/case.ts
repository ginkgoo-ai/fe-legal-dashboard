import { ICaseDocumentType, IOcrFileType } from '@/types/file';
import { StepProps } from 'antd';

export enum CaseStreamStatusEnum {
  INIT = 'INIT',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export enum CaseStatusEnum {
  DOCUMENTATION_IN_PROGRESS = 'DOCUMENTATION_IN_PROGRESS',
  ANALYZING = 'ANALYZING',
  PROGRESS = 'PROGRESS',
  READY = 'READY',
  AUTO_FILLING = 'AUTO_FILLING',
  HOLD = 'HOLD',
  FINAL_REVIEW = 'FINAL_REVIEW',
  DEFAULT = 'DEFAULT',
}

export type ActionResultType = 'success' | 'notFound' | 'manual';

export interface IProfileVaultDocumentType extends IOcrFileType {
  metadataForFrontList: Record<string, string>[];
}

export interface ICaseItemType {
  additionalData: null;
  clientId: string | null;
  clientName: string | null;
  createdAt: string;
  description: string;
  documentChecklist: unknown;
  documents?: IOcrFileType[];
  documentsCount: number;
  endDate: null;
  eventsCount: number;
  id: string;
  profileChecklist: unknown;
  profileId: string;
  profileName: string | null;
  startDate: string | null;
  status: string;
  title: string;
  travelDate: null;
  updatedAt: string;
  visaType: string | null;
  caseStatusForFront?: {
    colorBackground: string;
    colorText: string;
    text: string;
  };
  timestamp?: number;
  [key: string]: unknown;
}

export interface IAddressItemType {
  hidden?: boolean;
  type: string;
  label: string;
  value: string;
}

export interface IProfileItemType {
  label: string;
  value: string | IAddressItemType[];
}

export interface IProfileType {
  [key: string]: IProfileItemType;
}

export interface IActionItemType {
  selector: string;
  type: 'input' | 'click' | 'manual';
  value?: string;
  actionresult?: ActionResultType;
  actiontimestamp?: string;
}

export interface IFormItemType {
  name: string;
  label: string;
  value: string;
  type: 'input' | 'radio' | 'checkbox';
  options?: {
    label: string;
    value: string;
  };
}

export interface IStepActionType {
  actioncurrent?: number;
  actionresult?: 'success' | 'error';
  actiontimestamp?: string;
  actionlist?: IActionItemType[];
}

export interface IStepItemType extends StepProps {
  descriptionText: string;
  actioncurrent?: number;
  actionlist?: IActionItemType[];
  formList?: IFormItemType[];
}

export interface ICreateCaseParamsType {
  clientName: string;
  visaType: string;
}

export interface ICaseDocumentResultType {
  success: boolean;
  caseId: string;
  message: string;
  totalFiles: number;
  acceptedFiles: number;
  rejectedFiles: number;
  receivedAt: string;
  acceptedDocuments: ICaseDocumentType[];
  rejectedDocuments: ICaseDocumentType[];
}
