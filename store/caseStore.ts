import { ICaseItemType } from '@/types/case';
import { create } from 'zustand';
import { logger } from './middleware/logger';

interface CaseState {
  caseInfo: ICaseItemType | null;
  setCaseInfo: (caseInfo: ICaseItemType | null) => void;
  clearCase: () => void;
  caseTimestamp: number | null;
  refreshCaseTimestamp: () => void;
}

export const useCaseStore = create<CaseState>()(
  logger(
    set => ({
      caseInfo: null,
      setCaseInfo: caseInfo =>
        set({
          caseInfo: caseInfo ? caseInfo : null,
        }),
      clearCase: () => set({ caseInfo: null }),
      caseTimestamp: null,
      refreshCaseTimestamp: () => set({ caseTimestamp: Date.now() }),
    }),
    'caseStoreLogger'
  )
);
