import {
  ICaseDocumentResultType,
  ICaseItemType,
  ICaseStreamParamsType,
  ICreateCaseParamsType,
  IOcrDocumentsParamsType,
} from '@/types/case';
import {
  IGetWorkflowDefinitionsParamsType,
  IGetWorkflowDetailParamsType,
  IGetWorkflowListParamsType,
  IWorkflowType,
} from '@/types/casePilot';
import { IMarkDocumentValid } from '@/types/document';
import { IFilesPDFHighlightParamsType } from '@/types/file';
import ApiRequest from '../axios';
import {
  mockCaseCreate,
  mockCaseDetail,
  mockCaseList,
  mockCaseStream,
  mockGetWorkflowDetail,
  mockGetWorkflowList,
  mockUploadDocument,
  mockWorkflowDefinitions,
} from '../mock/case';

const IS_MOCK_LIST: string[] =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        // 'createCase',
        // 'getWorkflowDefinitions',
        // 'queryCaseList',
        // 'queryCaseDetail',
        // 'getWorkflowList',
        // 'caseStream',
        // 'uploadDocument',
      ];

const CaseApi = {
  case: '/legalcase/cases',
  caseDetail: '/legalcase/cases/:caseId',
  caseStream: '/legalcase/cases/:caseId/stream',
  documents: '/legalcase/cases/:caseId/documents',
  profileFields: '/legalcase/cases/:caseId/profile/fields',
  profileField: '/legalcase/cases/:caseId/profile/fields/:fieldPath',
  profileSchema: '/legalcase/cases/:caseId/profile/schema',
  fieldSchema: '/legalcase/cases/:caseId/profile/fields/:fieldPath/schema',
  missingFieldsEmail: '/legalcase/cases/:caseId/profile/missing-fields-email',
  applyDummyData: '/legalcase/cases/:caseId/profile/fields/:fieldPath/apply-dummy-data',
  // workflows: '/workflows/:workflowId',
  // workflowsStep: '/workflows/:workflowId/steps/:stepKey',
};

const WorkflowApi = {
  workflowsDefinitions: '/workflows/definitions',
  workflowsList: '/workflows/user/:userId/case/:caseId',
  workflowsDetail: '/workflows/:workflowId',
};

const StorageApi = {
  filesThirdPart: '/storage/v1/files/third-part',
  filesPDFHighlight: '/storage/v1/files/pdf-highlight',
};

export const DocumentsApi = {
  markValid: '/legalcase/cases/:caseId/documents/:documentId/mark-valid',
  uploadSingle: '/legalcase/cases/:caseId/documents/single',
  uploadOnly: '/legalcase/cases/:caseId/documents/upload',
  documents: '/legalcase/cases/:caseId/documents/:documentId',
};

// const baseUrl = process.env.LOCAL_BASE_URL
//   ? `${process.env.LOCAL_BASE_URL}:7878`
//   : `${process.env.NEXT_PUBLIC_API_URL}/api`;
const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const baseUrlAi = `${process.env.NEXT_PUBLIC_API_URL}/api/ai`;

export const createCase = async (
  params: ICreateCaseParamsType
): Promise<ICaseItemType> => {
  const { clientName, visaType } = params;

  if (IS_MOCK_LIST.includes('createCase')) {
    return new Promise(resolve => {
      resolve(mockCaseCreate as any);
    });
  }

  return ApiRequest.post(`${baseUrl}${CaseApi.case}`, {
    clientName,
    visaType,
  });
};

export const getWorkflowDefinitions = async (
  params: IGetWorkflowDefinitionsParamsType
): Promise<any> => {
  if (IS_MOCK_LIST.includes('getWorkflowDefinitions')) {
    return new Promise(resolve => {
      resolve(mockWorkflowDefinitions);
    });
  }

  return ApiRequest.get(`${baseUrlAi}${WorkflowApi.workflowsDefinitions}`, params);
};

export const queryCaseList = async (): Promise<{ content: ICaseItemType[] }> => {
  if (IS_MOCK_LIST.includes('queryCaseList')) {
    return new Promise(resolve => {
      resolve({ content: mockCaseList });
    });
  }

  return ApiRequest.get(`${baseUrl}${CaseApi.case}`);
};

export const queryCaseDetail = async (params: {
  caseId: string;
}): Promise<ICaseItemType> => {
  const { caseId } = params || {};

  if (IS_MOCK_LIST.includes('queryCaseDetail')) {
    return new Promise(resolve => {
      resolve(mockCaseDetail);
    });
  }

  return ApiRequest.get(`${baseUrl}${CaseApi.caseDetail}`.replace(':caseId', caseId));
};

export const getWorkflowList = async (
  params: IGetWorkflowListParamsType
): Promise<IWorkflowType[]> => {
  const { userId = '', caseId = '' } = params;

  if (IS_MOCK_LIST.includes('getWorkflowList')) {
    return new Promise(resolve => {
      resolve(mockGetWorkflowList);
    });
  }

  return ApiRequest.get(
    `${baseUrlAi}${WorkflowApi.workflowsList}`
      .replace(':userId', userId)
      .replace(':caseId', caseId)
  );
};

export const getWorkflowDetail = async (
  params: IGetWorkflowDetailParamsType
): Promise<IWorkflowType> => {
  const { workflowId = '' } = params;

  if (IS_MOCK_LIST.includes('getWorkflowDetail')) {
    return new Promise(resolve => {
      resolve(mockGetWorkflowDetail as IWorkflowType);
    });
  }

  return ApiRequest.get(
    `${baseUrlAi}${WorkflowApi.workflowsDetail}`.replace(':workflowId', workflowId)
  );
};

export const caseStream = async (
  params: ICaseStreamParamsType,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<null> }> => {
  const { caseId } = params;
  const controller = new AbortController();
  const request = new Promise<null>((resolve, reject) => {
    if (IS_MOCK_LIST.includes('caseStream')) {
      onProgress?.(mockCaseStream);
      return;
    }

    fetch(`${baseUrl}${CaseApi.caseStream}`.replace(':caseId', caseId), {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
      },
    })
      .then(response => {
        if (response.status === 403) {
          window.location.replace('/403');
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let buffer = '';
        const push = () => {
          reader
            ?.read()
            .then(({ done, value }) => {
              if (done) {
                if (buffer.trim()) {
                  try {
                    const lastMessage = buffer.trim();
                    if (lastMessage.startsWith('data:')) {
                      onProgress?.(lastMessage.slice(5).trim());
                    }
                  } catch (e) {
                    console.error('解析最终数据失败:', e, '原始数据:', buffer);
                  }
                }
                resolve(null);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              const messages = buffer.split('\n\n');

              buffer = messages.pop() || '';

              for (const message of messages) {
                if (!message.trim()) continue;

                const data = message.replace(/^data:\s*/gm, '').trim();
                if (data) {
                  try {
                    onProgress?.(data);
                  } catch (e) {
                    console.error('解析数据失败:', e, '原始数据:', data);
                  }
                }
              }

              push();
            })
            .catch(error => {
              if (error.name === 'AbortError') {
                resolve({} as any);
              } else {
                reject(error);
              }
            });
        };

        push();
      })
      .catch(error => {
        console.error('caseStream', error);
        resolve(null);
      });
  });

  onRequest?.(controller);

  return {
    cancel: () => controller.abort(),
    request,
  };
};

export const ocrDocuments = async (
  params: IOcrDocumentsParamsType
): Promise<string[]> => {
  const { caseId, storageIds = [] } = params;

  return ApiRequest.post(`${baseUrl}${CaseApi.documents}`.replace(':caseId', caseId), {
    storageIds,
  });
};

export const uploadDocument = async (params: {
  caseId: string;
  files: File[];
}): Promise<ICaseDocumentResultType> => {
  const { caseId, files } = params || {};
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  if (IS_MOCK_LIST.includes('uploadDocument')) {
    return new Promise(resolve => {
      resolve(mockUploadDocument);
    });
  }

  return ApiRequest.post(
    `${baseUrl}${CaseApi.documents}`.replace(':caseId', caseId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const uploadDocumentOnlyUpload = async (params: {
  caseId: string;
  files: File[];
}): Promise<ICaseDocumentResultType> => {
  const { caseId, files } = params || {};
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return ApiRequest.post(
    `${baseUrl}${DocumentsApi.uploadOnly}`.replace(':caseId', caseId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const processDocument = async (params: {
  caseId: string;
  documentIds: string[];
  description: string;
}): Promise<ICaseDocumentResultType> => {
  const { caseId, documentIds, description } = params;

  return ApiRequest.post(`${baseUrl}${CaseApi.documents}`.replace(':caseId', caseId), {
    documentIds,
    description,
  });
};

export const postFilesPDFHighlight = async (
  params: IFilesPDFHighlightParamsType
): Promise<BlobPart> => {
  // const { fileId, highlightData } = params;

  return ApiRequest.post(`${baseUrl}${StorageApi.filesPDFHighlight}`, params, {
    headers: {
      Accept: 'application/octet-stream',
    },
    responseType: 'blob',
  });
};

export const markValid = async (
  caseId: string,
  documentId: string,
  params: IMarkDocumentValid
) => {
  return ApiRequest.post(
    `${baseUrl}${DocumentsApi.markValid.replace(':caseId', caseId).replace(':documentId', documentId)}`,
    params
  );
};

export const uploadDocumentSingle = async (caseId: string, params: { file: File }) => {
  const { file } = params;

  const formData = new FormData();
  formData.append('file', file);

  return ApiRequest.post(
    `${baseUrl}${DocumentsApi.uploadSingle.replace(':caseId', caseId)}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const removeDocument = async (caseId: string, documentId: string) => {
  return ApiRequest.delete(
    `${baseUrl}${DocumentsApi.documents.replace(':caseId', caseId).replace(':documentId', documentId)}`
  );
};

export const updateMultipleProfileFields = async (
  caseId: string,
  params: Record<string, any>
): Promise<{
  successfulResults: any[];
  failedResults: any[];
  failedUpdates: number;
  successfulUpdates: number;
}> => {
  return ApiRequest.put(
    `${baseUrl}${CaseApi.profileFields.replace(':caseId', caseId)}`,
    params
  );
};

export const updateProfileField = async (
  caseId: string,
  fieldPath: string,
  params: Record<string, any>
): Promise<Record<string, any>> => {
  return ApiRequest.put(
    `${baseUrl}${CaseApi.profileField.replace(':caseId', caseId).replace(':fieldPath', fieldPath)}`,
    params
  );
};

export const getProfileSchema = async (caseId: string): Promise<Record<string, any>> => {
  return ApiRequest.get(`${baseUrl}${CaseApi.profileSchema.replace(':caseId', caseId)}`);
};

export const getFieldSchema = async (
  caseId: string,
  fieldPath: string
): Promise<{
  fieldDefinition: Record<string, any>;
  fieldPath: string;
}> => {
  return ApiRequest.get(
    `${baseUrl}${CaseApi.fieldSchema.replace(':caseId', caseId).replace(':fieldPath', fieldPath)}`
  );
};

export const getMissingFieldEmailTemplate = async (
  caseId: string
): Promise<{
  subject: string;
  htmlBody: string;
  textBody: string;
}> => {
  return ApiRequest.get(
    `${baseUrl}${CaseApi.missingFieldsEmail.replace(':caseId', caseId)}`
  );
};

export const applyDummyData = async (
  caseId: string,
  fieldPath: string
): Promise<Record<string, any>> => {
  return ApiRequest.post(
    `${baseUrl}${CaseApi.applyDummyData.replace(':caseId', caseId).replace(':fieldPath', fieldPath)}`,
    {}
  );
};
