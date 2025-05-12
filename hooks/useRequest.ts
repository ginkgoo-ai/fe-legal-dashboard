import { isEqual } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * data: request result
 * error: error message
 * loading: loading status
 */
interface RequestResult<T, P extends any[]> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refresh: () => void;
  run: (...args: P) => void;
  runAsync: (...args: P) => Promise<void>;
}

interface RequestOptions<D, P extends any[]> {
  /**
   * @description 请求参数 默认 []
   */
  params?: P;
  /**
   * @description 是否手动触发请求
   */
  manual?: boolean;
  /**
   * @description 是否立即触发请求（只作用于首次）
   */
  immediate?: boolean;

  /**
   * TODO: 错误重试次数
   * @description 错误重试次数
   */
  errorRetryCount?: number;

  /**
   * @description 更新依赖
   * 不受 manual 和 immediate 影响，依赖更新的优先级要高于 immediate
   */
  deps?: any[];

  /**
   * @description 缓存 key
   */
  cacheKey?: string;

  /**
   * @description 缓存过期时间
   */
  staleTime?: number;

  /**
   * @description 请求条件判断函数
   */
  ready?: () => boolean;

  /**
   * @description 请求前回调
   */
  onBefore?: () => void;

  /**
   * @description 请求成功回调
   */
  onSuccess?: (data: D) => void;

  /**
   * @description 请求失败回调
   */
  onError?: (error: Error) => void;

  /**
   * @description 请求结束回调
   */
  onFinally?: () => void;
}

export type UseRequestHook<D, P extends any[]> = (deps?: any[]) => RequestResult<D, P>;

const cacheMap = new Map<
  string,
  {
    data: any;
    params: any;
    timestamp: number;
    staleTime: number;
  }
>();

/**
 * @description 请求钩子
 * 其中， deps 优先级 > immediate > manual
 * @param requestFn 请求函数
 * @param options 请求配置
 * @param deps 更新依赖
 * @returns 请求结果
 */
function useRequest<D, P extends any[]>(requestFn: (...args: P) => Promise<D>, options?: RequestOptions<D, P>): RequestResult<D, P> {
  const [data, setData] = useState<D | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const isFirstRef = useRef(true);

  // 记录上一次 params
  const lastParamsRef = useRef<P | undefined>(undefined);

  // 记录上一次 deps
  const lastDepsRef = useRef<any[] | undefined>(undefined);

  // 记录错误重试次数
  const errorRetryCountRef = useRef(0);

  const {
    manual,
    immediate,
    errorRetryCount = 3,
    params = [],
    deps,
    cacheKey,
    staleTime = 1000 * 60 * 3,
    onBefore,
    onSuccess,
    onError,
    onFinally,
    ready,
  } = options ?? {};

  // 异步请求，抛出具体错误，返回 Promise
  const runAsync = useCallback(
    async (...args: P) => {
      setLoading(true);
      lastParamsRef.current = args;

      // 请求前回调
      onBefore?.();

      try {
        let cachedData: D | null;

        if (cacheKey) {
          const cache = cacheMap.get(cacheKey);

          if (cache) {
            cachedData = cache.data;

            if (!cachedData) {
              return;
            }

            // 缓存未过期且调用参数相同, 使用缓存数据
            if (Date.now() - cache.timestamp <= cache.staleTime && isEqual(cache.params, args)) {
              setData(cachedData);
              setLoading(false);
              onSuccess?.(cachedData);
              onFinally?.();
            }
          }
        }

        const result = await requestFn(...args);

        setData(result);
        setError(null);

        errorRetryCountRef.current = 0;
        // 请求成功回调
        onSuccess?.(result);

        if (cacheKey) {
          cacheMap.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            staleTime,
            params: args,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Request failed"));
        setData(null);

        errorRetryCountRef.current++;
        // 请求失败回调
        onError?.(err instanceof Error ? err : new Error("Request failed"));

        if (cacheKey) {
          cacheMap.delete(cacheKey);
        }

        throw err;
      } finally {
        setLoading(false);
        onFinally?.();
      }
    },
    [requestFn, cacheKey, staleTime, onSuccess, onError, onFinally]
  );

  const run = useCallback(
    (...args: P) => {
      // 错误重试次数限制
      if (errorRetryCountRef.current >= errorRetryCount) {
        return;
      }

      runAsync(...args);
    },
    [runAsync]
  );

  const refresh = useCallback(() => {
    // 错误重试次数限制
    if (errorRetryCountRef.current >= errorRetryCount) {
      return;
    }

    // 默认使用上一次的 params
    if (lastParamsRef.current) {
      run(...lastParamsRef.current);
      return;
    }

    if (params) {
      run(...(params as P));
      return;
    }
  }, [run, params]);

  const errorRetry = useCallback(() => {
    if (errorRetryCountRef.current && errorRetryCountRef.current < errorRetryCount) {
      run(...(params as P));
      return;
    }

    if (errorRetryCountRef.current >= errorRetryCount) {
      return;
    }
  }, [params]);

  useEffect(() => {
    const runRequest = () => {
      // 添加条件判断
      if (ready && !ready()) {
        return;
      }

      run(...(params as P));
    };

    // 错误重试次数限制
    // TODO: 是否需要重置
    errorRetry();

    // 仅当 deps 存在时，且 deps 更新时，才执行请求
    if (deps && !isEqual(deps, lastDepsRef.current)) {
      lastDepsRef.current = deps;
      runRequest();
      return;
    }

    // 开启 immediate 或未开启 manual，优先立即执行(只作用于首次)
    // TODO: 优化，存在立马执行两次的情况
    if (isFirstRef.current && (immediate || !manual) && !deps) {
      isFirstRef.current = false;
      runRequest();
      return;
    }

    if (manual) {
      return;
    }

    // 关闭 manual 后，只允许依赖 deps 更新，或主动调用 run 函数触发更新
    return;
  }, [deps, immediate, manual, params, ready]);

  return { data, error, loading, runAsync, run, refresh };
}

export default useRequest;
