import { create } from 'zustand';
import { logger } from './middleware/logger';

interface LogState {
  logs: any;
  addLog: (log: Omit<any, 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>()(
  logger(
    set => ({
      logs: {},
      addLog: log =>
        set(() => ({
          logs: { ...log, timestamp: Date.now() },
        })),
      clearLogs: () => set({ logs: {} }),
    }),
    'logStoreLogger'
  )
);
