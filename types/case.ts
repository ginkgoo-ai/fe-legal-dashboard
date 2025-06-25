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
  description: string | null;
  documentChecklist: ICaseDocumentChecklistType;
  documents?: IOcrFileType[];
  documentsCount: number;
  endDate: null;
  eventsCount: number;
  id: string;
  profileChecklist: ICaseProfileChecklistType;
  profileId: string;
  profileName: string | null;
  startDate: string | null;
  status: string;
  title: string;
  travelDate: string | null;
  updatedAt: string;
  visaType: string | null;
  caseStatusForFront?: {
    colorBackground: string;
    colorText: string;
    text: string;
  };
  timestamp?: number;
  profileData?: Record<string, unknown>;
  profileDummyData?: Record<string, unknown>;
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

export interface ICaseDocumentChecklistType {
  documentItems: ICaseDocumentItemType[];
  documentsWithIssues: number;
  totalRequiredDocuments: number;
  uploadedDocuments: number;
}

export interface ICaseDocumentItemType {
  actionNeeded: string;
  documentDisplayName: string;
  documentId: string | null;
  documentType: string;
  hasIssues: boolean;
  isMarkedAsValid: boolean;
  isRequired: boolean;
  isUploaded: boolean;
  markedAsValid: boolean;
  required: boolean;
  uploadStatus: string;
  uploaded: boolean;
  uploadedAt: string | null;
  issues: ICaseDocumentIssueType[];
}

export interface ICaseDocumentIssueType {
  description: string;
  issueType: string;
  severity: string;
  suggestion: string;
}

export enum ICaseDocumentTypeEnum {
  PASSPORT = 'PASSPORT',
  NATIONAL_IDENTIFICATION_CARD = 'NATIONAL_IDENTIFICATION_CARD',
  CERTIFICATE_OF_SPONSORSHIP = 'CERTIFICATE_OF_SPONSORSHIP',
  ENGLISH_LANGUAGE_EVIDENCE = 'ENGLISH_LANGUAGE_EVIDENCE',
  TUBERCULOSIS_TEST_CERTIFICATE = 'TUBERCULOSIS_TEST_CERTIFICATE',
  CRIMINAL_RECORD_CERTIFICATE = 'CRIMINAL_RECORD_CERTIFICATE',
  UTILITY_BILL = 'UTILITY_BILL',
  P60 = 'P60',
  REFEREE_INFO = 'REFEREE_INFO',
  REFEREE_AND_IDENTITY = 'REFEREE_AND_IDENTITY',
  PARENTS_INFO = 'PARENTS_INFO',
  QUESTIONNAIRE = 'QUESTIONNAIRE',
  OTHER = 'OTHER',
}

export const ICaseDocumentTypeMap = {
  [ICaseDocumentTypeEnum.PASSPORT]: 'Passport',
  [ICaseDocumentTypeEnum.NATIONAL_IDENTIFICATION_CARD]: 'National Identification Card',
  [ICaseDocumentTypeEnum.CERTIFICATE_OF_SPONSORSHIP]: 'Certificate of Sponsorship',
  [ICaseDocumentTypeEnum.ENGLISH_LANGUAGE_EVIDENCE]: 'English Language Evidence',
  [ICaseDocumentTypeEnum.TUBERCULOSIS_TEST_CERTIFICATE]: 'Tuberculosis Test Certificate',
  [ICaseDocumentTypeEnum.CRIMINAL_RECORD_CERTIFICATE]: 'Criminal Record Certificate',
  [ICaseDocumentTypeEnum.UTILITY_BILL]: 'Utility Bill',
  [ICaseDocumentTypeEnum.P60]: 'P60',
  [ICaseDocumentTypeEnum.REFEREE_INFO]: 'Referee Info',
  [ICaseDocumentTypeEnum.REFEREE_AND_IDENTITY]: 'Referee and Identity',
  [ICaseDocumentTypeEnum.PARENTS_INFO]: 'Parents Info',
  [ICaseDocumentTypeEnum.QUESTIONNAIRE]: 'Questionnaire',
  [ICaseDocumentTypeEnum.OTHER]: 'Other',
};

export interface ICaseProfileChecklistType {
  completedFields: number;
  totalFields: number;
  completionPercentage: number;
  missingFieldsCount: number;
  profileId: string;
  missingFields: Record<string, ICaseProfileMissingField[]>;
  availableDummyData: Record<string, unknown>;
}

export interface ICaseProfileMissingField {
  category: string;
  displayName: string;
  dummyValue: string;
  fieldPath: string;
  fieldType: string;
  isRequired: boolean;
  required: boolean;
  [key: string]: unknown;
}

export interface ICaseStreamParamsType {
  caseId: string;
}

export interface IOcrDocumentsParamsType {
  caseId: string;
  storageIds: string[];
}
