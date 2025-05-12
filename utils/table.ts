export type SortDirection = 'ASC' | 'DESC' | undefined;

export interface SortState {
  sortField?: string;
  sortDirection?: SortDirection;
}

export const getNextSortState = (
  currentState: SortState,
  newField: string,
): SortState => {
  if (currentState.sortField !== newField) {
    return { sortField: newField, sortDirection: 'ASC' };
  }

  const nextDirection =
    currentState.sortDirection === 'ASC'
      ? 'DESC'
      : currentState.sortDirection === 'DESC'
        ? undefined
        : 'ASC';

  return {
    sortField: nextDirection ? newField : undefined,
    sortDirection: nextDirection,
  };
};
