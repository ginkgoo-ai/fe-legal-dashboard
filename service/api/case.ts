import ApiRequest from '../axios';
import { mockCaseStream } from '../mock/case';

interface ICaseStreamParamsType {
  caseId: string;
}

interface IOcrDocumentsParamsType {
  caseId: string;
  storageIds: string[];
}

export const PilotApi = {
  caseStream: '/legalcase/cases/:caseId/stream',
  documents: '/legalcase/cases/:caseId/documents',
  // workflows: '/workflows/:workflowId',
  // workflowsStep: '/workflows/:workflowId/steps/:stepKey',
};

// const baseUrl = process.env.LOCAL_BASE_URL
//   ? `${process.env.LOCAL_BASE_URL}:7878`
//   : `${process.env.NEXT_PUBLIC_API_URL}/api`;
const baseUrl = process.env.LOCAL_BASE_URL
  ? `${process.env.LOCAL_BASE_URL}:6011`
  : `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IS_MOCK = true;

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

    fetch(`${baseUrl}${PilotApi.caseStream}`.replace(':caseId', caseId), {
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

        function push() {
          reader
            ?.read()
            .then(({ done, value }) => {
              if (done) {
                resolve(null);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.split('data:')[1];

                  console.log('line', line);

                  if (data && data.trim()) {
                    res += data;
                    try {
                      onProgress?.(res);
                      res = '';
                    } catch (e) {
                      console.error('解析数据失败:', e, '原始数据:', data);
                    }
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
        }

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

// export const getWorkflowList = async (
//   params: IGetWorkflowListType
// ): Promise<IWorkflowType> => {
//   const { workflowId = '' } = params;

//   if (IS_MOCK) {
//     return new Promise(resolve => {
//       resolve(mockGetWorkflowList);
//     });
//   }

//   return ApiRequest.get(
//     `${baseUrl}${PilotApi.workflows}`.replace(':workflowId', workflowId)
//   );
// };

// export const getWorkflowStepData = async (
//   params: IGetWorkflowStepDataType
// ): Promise<IWorkflowStepDataType> => {
//   const { workflowId = '', stepKey = '' } = params;

//   if (IS_MOCK) {
//     return new Promise(resolve => {
//       resolve(mockGetWorkflowStepData);
//     });
//   }

//   return ApiRequest.get(
//     `${baseUrl}${PilotApi.workflowsStep}`
//       .replace(':workflowId', workflowId)
//       .replace(':stepKey', stepKey)
//   );
// };

export const ocrDocuments = async (
  params: IOcrDocumentsParamsType
): Promise<string[]> => {
  const { caseId, storageIds = [] } = params;

  return ApiRequest.post(`${baseUrl}${PilotApi.documents}`.replace(':caseId', caseId), {
    storageIds,
  });
};
