import { create } from 'zustand';
import { logger } from './middleware/logger';

interface ProfileState {
  schema: Record<string, any> | null;
  fieldSchema: Map<string, any>; // {caseId}-${fieldPath}: value
  setSchema: (schema: Record<string, any> | null) => void;
  clearSchema: () => void;
}

export const useProfileStore = create<ProfileState>()(
  logger(
    set => ({
      schema: null,
      setSchema: schema =>
        set({
          schema: schema ? schema : null,
        }),
      clearSchema: () => set({ schema: null }),
      fieldSchema: new Map(),
    }),
    'profileStoreLogger'
  )
);
