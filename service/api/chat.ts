import { ChatParams } from '@/types';

const ChatApi = {
  chat: '/api/ai/assistant',
};

const chat = async (
  { chatId, message, types, file }: ChatParams,
  onRequest?: (controller: AbortController) => void,
  onProgress?: (text: string) => void
): Promise<{ cancel: () => void; request: Promise<ChatParams> }> => {
  const controller = new AbortController();
  const formData = new FormData();

  formData.append('chatId', chatId);
  formData.append('message', message);
  file && formData.append('file', file);
  types?.forEach(type => {
    formData.append('types', type);
  });

  onRequest?.(controller);

  let res = '';

  const request = new Promise<ChatParams>((resolve, reject) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${ChatApi.chat}`, {
      method: 'POST',
      body: formData,
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

export { chat };
