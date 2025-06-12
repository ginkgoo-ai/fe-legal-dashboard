import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

export function useInit(effect: EffectCallback, deps?: DependencyList) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      effect();
    }
  }, deps);
}
