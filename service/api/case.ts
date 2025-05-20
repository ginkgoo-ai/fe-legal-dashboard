import ApiRequest from '../axios';
interface ICaseStreamParamsType {
  caseId: string;
}

interface IOcrDocumentsParamsType {
  caseId: string;
  storageIds: string[];
}

export const PilotApi = {
  caseStream: '/cases/:caseId/stream',
  documents: '/cases/:caseId/documents',
};

const baseUrl = process.env.LOCAL_BASE_URL
  ? `${process.env.LOCAL_BASE_URL}:7878`
  : process.env.NEXT_PUBLIC_API_URL;

const caseStream = async (
  params: ICaseStreamParamsType,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<ICaseStreamParamsType> }> => {
  let res = '';
  const { caseId } = params;
  const controller = new AbortController();
  const request = new Promise<ICaseStreamParamsType>((resolve, reject) => {
    fetch(`${baseUrl}${PilotApi.caseStream}`.replace(':caseId', caseId), {
      method: 'GET',
      signal: controller.signal,
      // credentials: 'include',
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
                resolve({} as any);
                return;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data:')) {
                  const data = line.split('data:')[1];

                  if (data && data.trim()) {
                    res += data;
                    try {
                      onProgress?.(res);
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
      .catch(reject);
  });

  onRequest?.(controller);

  return {
    cancel: () => controller.abort(),
    request,
  };
};

const ocrDocuments = async (params: IOcrDocumentsParamsType): Promise<string[]> => {
  const { caseId, storageIds = [] } = params;
  return ApiRequest.post(
    `${baseUrl}${PilotApi.documents}`.replace(':caseId', caseId),
    {
      storageIds,
    },
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );
};

export { caseStream, ocrDocuments };
