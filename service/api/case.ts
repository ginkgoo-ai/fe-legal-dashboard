import {
  ICaseDocumentResultType,
  ICaseItemType,
  ICreateCaseParamsType,
} from '@/types/case';
import { IGetWorkflowDefinitionsParamsType } from '@/types/casePilot';
import { IMarkDocumentValid } from '@/types/document';
import { IFilesPDFHighlightParamsType } from '@/types/file';
import ApiRequest from '../axios';
import {
  mockCaseDetail,
  mockCaseList,
  mockCaseStream,
  mockUploadDocument,
  mockWorkflowDefinitions,
} from '../mock/case';

interface ICaseStreamParamsType {
  caseId: string;
}

interface IOcrDocumentsParamsType {
  caseId: string;
  storageIds: string[];
}

const CaseApi = {
  case: '/legalcase/cases',
  caseDetail: '/legalcase/cases/:caseId',
  caseStream: '/legalcase/cases/:caseId/stream',
  documents: '/legalcase/cases/:caseId/documents',
  // workflows: '/workflows/:workflowId',
  // workflowsStep: '/workflows/:workflowId/steps/:stepKey',
};

const WorkflowApi = {
  workflowsDefinitions: '/workflows/definitions',
};

const StorageApi = {
  filesThirdPart: '/storage/v1/files/third-part',
  filesPDFHighlight: '/storage/v1/files/pdf-highlight',
};

export const DocumentsApi = {
  markValid: '/legalcase/cases/:caseId/documents/:documentId/mark-valid',
  uploadSingle: '/legalcase/cases/:caseId/documents/single',
  documents: '/legalcase/cases/:caseId/documents/:documentId',
};

// const baseUrl = process.env.LOCAL_BASE_URL
//   ? `${process.env.LOCAL_BASE_URL}:7878`
//   : `${process.env.NEXT_PUBLIC_API_URL}/api`;
const baseUrl = process.env.LOCAL_BASE_URL
  ? `${process.env.LOCAL_BASE_URL}:6011`
  : `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IS_MOCK = false;

export const createCase = async (params: ICreateCaseParamsType) => {
  const { clientName, visaType } = params;

  return ApiRequest.post(`${baseUrl}${CaseApi.case}`, {
    clientName,
    visaType,
  });
};

export const getWorkflowDefinitions = async (
  params: IGetWorkflowDefinitionsParamsType
): Promise<any> => {
  if (IS_MOCK) {
    return new Promise(resolve => {
      resolve(mockWorkflowDefinitions);
    });
  }

  return ApiRequest.get(`${baseUrl}${WorkflowApi.workflowsDefinitions}`, params);
};

export const queryCaseList = async (): Promise<{ content: ICaseItemType[] }> => {
  if (IS_MOCK) {
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

  if (IS_MOCK) {
    return new Promise(resolve => {
      resolve(mockCaseDetail);
    });
  }

  return ApiRequest.get(`${baseUrl}${CaseApi.caseDetail}`.replace(':caseId', caseId));
};

export const caseStream = async (
  params: ICaseStreamParamsType,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<null> }> => {
  let res = '';
  const { caseId } = params;
  const controller = new AbortController();
  const request = new Promise<null>((resolve, reject) => {
    if (IS_MOCK) {
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

  if (IS_MOCK) {
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
