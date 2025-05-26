import { ExtensionsInfo } from '@/types/extensions';
import { create } from 'zustand';
import { logger } from './middleware/logger';

interface ExtensionsState {
  extensionsInfo: ExtensionsInfo | null;
  setExtensionsInfo: (extensions: ExtensionsInfo | null) => void;
  clearExtensionsInfo: () => void;
}

export const useExtensionsStore = create<ExtensionsState>()(
  logger(
    set => ({
      extensionsInfo: null,
      setExtensionsInfo: extensions =>
        set({
          extensionsInfo: extensions,
        }),
      clearExtensionsInfo: () => set({ extensionsInfo: null }),
    }),
    'extensionsStoreLogger'
  )
);
