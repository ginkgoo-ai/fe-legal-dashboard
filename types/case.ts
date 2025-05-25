import { StepProps } from 'antd';

export enum CaseStreamStatusEnum {
  INIT = 'INIT',
  STREAMING = 'STREAMING',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export enum CaseStatusEnum {
  ANALYZING = 'ANALYZING',
  PROGRESS = 'PROGRESS',
  READY = 'READY',
  AUTO_FILLING = 'AUTO_FILLING',
  HOLD = 'HOLD',
  FINAL_REVIEW = 'FINAL_REVIEW',
  DEFAULT = 'DEFAULT',
}

export enum PilotStatusEnum {
  INIT = 'INIT',
  OPEN = 'OPEN',
  QUERY = 'QUERY',
  ANALYSIS = 'ANALYSIS',
  ACTION = 'ACTION',
  WAIT = 'WAIT',
  HOLD = 'HOLD',
  MANUAL = 'MANUAL',
  NOT_SUPPORT = 'NOT_SUPPORT',
  COMING_SOON = 'COMING_SOON',
}

export type ActionResultType = 'success' | 'notFound' | '';

export interface ICaseItemType {
  id: string;
  title: string;
  caseName: string;
  caseType: string;
  status: CaseStatusEnum;
  createdAt: string;
  updatedAt: string;
  caseStatusForFront?: {
    colorBackground: string;
    colorText: string;
    text: string;
  };
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

export interface IStepActionType {
  actioncurrent?: number;
  actionresult?: 'success' | 'error';
  actiontimestamp?: string;
  actionlist?: IActionItemType[];
}

export interface IStepItemType extends StepProps {
  descriptionText: string;
  actioncurrent: number;
  actionlist: IActionItemType[];
}

export interface IPilotType {
  caseId: string;
  fill_data: Record<string, unknown>;
  tabInfo: {
    [key: string]: unknown;
  };
  timer: NodeJS.Timeout | null;
  pilotStatus: PilotStatusEnum;
  stepListCurrent: number;
  stepListItems: IStepItemType[];
  repeatHash: string;
  repeatCurrent: number;
  pdfUrl: string;
  cookiesStr: string;
}
