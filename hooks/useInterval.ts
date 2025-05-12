import { useEffect, useRef } from 'react';

export function useInterval(
  callback: () => void,
  wait: number | null,
  immediate: boolean = false
) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (wait !== null) {
      if (immediate) {
        tick();
      }
      const id = setInterval(tick, wait);
      return () => clearInterval(id);
    }
  }, [wait, immediate]);
}
