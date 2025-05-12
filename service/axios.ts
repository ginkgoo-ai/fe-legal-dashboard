import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export type ApiRequest = {
  [K in Lowercase<HttpMethod>]: <T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ) => Promise<T>;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXT_PUBLIC_AUTH_HOST = process.env.NEXT_PUBLIC_AUTH_HOST;

const apiWithoutBaseURLList = ['/logout'];
const apiPrefixWithoutWorkspaceIdList = ['/identity'];
const apiWithoutWorkspaceIdList = ['/workspace/workspaces', '/logout'];

const baseURL = NEXT_PUBLIC_API_URL ? `${NEXT_PUBLIC_API_URL}/api` : '/api';
const timeout = 30000;
const whiteList = ['/oauth2/token'];
const timeoutWhiteList: string[] = ['/ai/assistant'];

export const navigateToLogin = async () => {
  const authUrl = new URL(
    `${NEXT_PUBLIC_AUTH_HOST}/login?redirect_uri=${window.location.href}`
  );

  window.location.replace(authUrl.toString());
};
const getWorkspaceId = () => {
  const value = localStorage.getItem('slate|workspace');
  let id: string | null = null;
  if (value) {
    try {
      id = JSON.parse(value).id;
    } catch (error) {
      console.error(error);
    }
  }
  return id;
};

// axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    withXSRFToken: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // request interceptors
  instance.interceptors.request.use(
    config => {
      if (whiteList.includes(config.url!)) {
        return config;
      }
      if (timeoutWhiteList.includes(config.url!)) {
        return {
          ...config,
          timeout: 300000,
        };
      }
      if (apiWithoutBaseURLList.includes(config.url!)) {
        return {
          ...config,
          baseURL: NEXT_PUBLIC_API_URL,
        };
      }
      if (
        !apiPrefixWithoutWorkspaceIdList.some(api => config.url?.indexOf(api) === 0) &&
        !apiWithoutWorkspaceIdList.some(api => config.url === api)
      ) {
        return {
          ...config,
          headers: new AxiosHeaders({
            ...config.headers,
            // "X-Workspace-Id": getWorkspaceId(),
          }),
        };
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // response interceptors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      const { response } = error;
      if (response) {
        switch (response.status) {
          case 401:
            handle401(error);
            break;
          case 403:
            window.location.replace('/403');
            break;
          case 404:
            // TODO: not found
            break;
          case 500:
            // TODO: server error
            break;
        }

        // TODO: token expired
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const handle401 = (error: AxiosError) => {
  const { config } = error;

  if (config?.headers?.get('X-Authorization-type') === 'share') {
    return Promise.reject(error);
  }
  navigateToLogin();
};

const service = createAxiosInstance();

// request handler
const requestHandler = <T>(handlerParams: {
  method: HttpMethod;
  url: string;
  params?: any;
  config?: AxiosRequestConfig;
}): Promise<T> => {
  const { method, url, params = {}, config = {} } = handlerParams;
  const requestConfig: AxiosRequestConfig = {
    ...config,
    method,
    url,
  };

  if (['GET', 'DELETE', 'HEAD'].includes(method)) {
    requestConfig.params = params;
  } else {
    requestConfig.data = params;
  }

  return service(requestConfig)
    .then((response: AxiosResponse<T>) => response.data)
    .catch((error: AxiosError) => {
      throw error;
    });
};

// api request
const ApiRequest: ApiRequest = ['get', 'post', 'put', 'patch', 'delete', 'head'].reduce(
  (acc, method) => ({
    ...acc,
    [method]: <T>(url: string, params?: any, config?: AxiosRequestConfig) =>
      requestHandler<T>({
        method: method.toUpperCase() as HttpMethod,
        url,
        params,
        config,
      }),
  }),
  {} as ApiRequest
);

export default ApiRequest;
