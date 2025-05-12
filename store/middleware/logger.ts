import { StateCreator, StoreMutatorIdentifier } from "zustand";

type Logger = <T, Mps extends [StoreMutatorIdentifier, unknown][] = [], Mcs extends [StoreMutatorIdentifier, unknown][] = []>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

export const logger: Logger = (f, name) => (set, get, store) => {
  const loggedSet: any = (...args: Parameters<typeof set>) => {
    const before = get();
    set.apply(this, args);
    const after = get();
    console.info(`[Store Update][${name}]`, {
      before,
      after,
      action: args[0],
    });
  };

  return f(loggedSet, get, store);
};
