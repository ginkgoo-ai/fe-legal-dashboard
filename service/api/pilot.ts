interface IChatParamsType {
  caseId: string;
}

export const PilotApi = {
  caseStream: '/cases/:caseId/stream',
  documents: '/cases/:caseId/stream',
};

const caseStream = async (
  params: IChatParamsType,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<IChatParamsType> }> => {
  const { caseId } = params;

  const controller = new AbortController();

  onRequest?.(controller);

  let res = '';

  const request = new Promise<IChatParamsType>((resolve, reject) => {
    console.log('process.env.APP_ENV', process.env.APP_ENV);
    const baseUrl =
      process.env.APP_ENV === 'local'
        ? 'http://192.168.31.147:7878'
        : process.env.NEXT_PUBLIC_API_URL;

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
                res = '';
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

  return {
    cancel: () => controller.abort(),
    request,
  };
};

export { caseStream };
