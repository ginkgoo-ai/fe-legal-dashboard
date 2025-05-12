export interface FetchStreamParams {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, any>;
  onDealChunk?: (chunk: string) => string;
  onChunk: (text: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export interface ApplicationError extends Error {
  info: string;
  status: number;
}
