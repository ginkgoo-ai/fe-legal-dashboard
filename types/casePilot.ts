export interface IGetWorkflowListType {
  workflowId: string;
}

export interface IWorkflowStepType {
  step_instance_id: string;
  workflow_instance_id: string;
  step_key: string; // 'applicant_setup';
  name: string;
  order: number;
  status: string; // 'ACTIVE';
  data: null;
  next_step_url: string;
  started_at: string;
  completed_at: string;
  error_details: null;
}

export interface IWorkflowType {
  workflow_instance_id: string;
  user_id: string;
  status: string; // 'IN_PROGRESS';
  current_step_key: string; // 'applicant_setup';
  created_at: string;
  updated_at: string;
  completed_at: string;
  workflow_definition_id: string;
  steps: IWorkflowStepType[];
}
