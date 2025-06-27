import { ICaseItemType } from './case';

export enum PilotStatusEnum {
  INIT = 'INIT',
  OPEN = 'OPEN',
  START = 'START',
  QUERY_WORKFLOW = 'QUERY_WORKFLOW',
  QUERY = 'QUERY',
  ANALYSIS = 'ANALYSIS',
  ACTION = 'ACTION',
  WAIT = 'WAIT',
  HOLD = 'HOLD',
  MANUAL = 'MANUAL',
  NOT_SUPPORT = 'NOT_SUPPORT',
  COMING_SOON = 'COMING_SOON',
  PAUSE = 'PAUSE',
  COMPLETED = 'COMPLETED',
}

export enum PilotModeEnum {
  NOT_INSTALL = 'NOT_INSTALL',
  PREPARING = 'PREPARING',
  READY = 'READY',
  RUNNING = 'RUNNING',
}

export enum WorkflowTypeEnum {
  VISA = 'visa',
  PASSPORT = 'passport',
  IMMIGRATION = 'immigration',
  STUDENT_VISA = 'student_visa',
  WORK_PERMIT = 'work_permit',
  FAMILY_VISA = 'family_visa',
}

export interface IPilotType {
  pilotId: string;
  pilotTimer: NodeJS.Timeout | null;
  pilotTabInfo: Record<string, unknown>;
  pilotStatus: PilotStatusEnum;
  pilotLastMessage: string;
  pilotRepeatHash: string;
  pilotRepeatCurrent: number;
  pilotThirdPartUrl: string;
  pilotCookie: string;
  pilotCsrfToken: string;
  pilotCaseInfo: ICaseItemType | null;
  pilotWorkflowInfo: IWorkflowType | null;
  pilotRefreshTS?: number;
}

export interface IStepResultType {
  result: boolean;
}

export interface ISelectorResult {
  [key: string]: unknown;
}

export interface IGetWorkflowDefinitionsParamsType {
  page: number;
  page_size: number;
  workflow_type: WorkflowTypeEnum;
}

export interface IGetWorkflowListParamsType {
  userId: string;
  caseId: string;
}

export interface IGetWorkflowDetailParamsType {
  workflowId: string;
}

export interface IGetWorkflowStepDataParamsType {
  workflowId: string;
  stepKey: string;
}

export interface ICreateWorkflowParamsType {
  user_id: string;
  case_id: string;
  workflow_definition_id: string;
}

export interface IWorkflowsProcessFormParamsType {
  workflowId: string;
  message: string;
  fill_data: Record<string, unknown>;
}

export interface IWorkflowsUploadProgressFileParamsType {
  workflowId: string;
  fileId: string;
}

export interface IWorkflowStepDataFormDataType {
  question: {
    answer: {
      data: {
        name: string;
        value: string;
        check: number;
        selector: string;
      }[];
      selector: string;
      type?: string; //'radio';
    };
    data: {
      name: string;
    };
    type?: string; // "interrupt";
  };
  _metadata?: {
    id: string;
    field_selector: string;
    field_name: string;
    field_type: string;
    field_label: string;
    required: boolean;
    options: unknown[];
    confidence: number;
    reasoning: string;
    needs_intervention: boolean;
    has_valid_answer: boolean;
    grouped_fields: unknown;
  };
}

export interface IWorkflowStepDataType {
  actions: unknown[];
  form_data: IWorkflowStepDataFormDataType[];
  metadata: unknown;
  questions: unknown[];
  history?: unknown[];
}

export interface IWorkflowStepType {
  step_instance_id: string;
  workflow_instance_id: string;
  step_key: string; // 'applicant_setup';
  name: string;
  order: number;
  status: string; // 'ACTIVE' | 'PENDING';
  data: IWorkflowStepDataType | null;
  next_step_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_details: null;
}

export interface IWorkflowDummyDataType {
  answer: string;
  processed_at: string;
  question: string;
  step_key: string;
}

export interface IWorkflowType {
  workflow_instance_id: string;
  user_id: string;
  case_id?: string;
  status: string; // 'IN_PROGRESS' | "PENDING";
  current_step_key: string; // 'applicant_setup';
  created_at: string | null;
  updated_at: string | null;
  completed_at: string | null;
  dummy_data_usage?: IWorkflowDummyDataType[];
  progress_file_id?: string;
  workflow_definition_id?: string;
  steps?: IWorkflowStepType[];
  pilotInfo?: IPilotType;
}
