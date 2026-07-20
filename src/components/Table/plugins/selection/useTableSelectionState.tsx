'use client';

import {useCallback, useMemo} from 'react';
import type {UseTableSelectionConfig} from 'components/Table/plugins/selection/useTableSelection';

export interface UseTableSelectionStateConfig<
  T extends Record<string, unknown>,
> {
  data: T[];
  getIsItemEnabled?: (item: T) => boolean;
  getIsItemSelectable?: (item: T) => boolean;
  idKey: (keyof T & string) | ((item: T) => string);
  selectedKeys: Set<string>;
  setSelectedKeys: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface UseTableSelectionStateResult<
  T extends Record<string, unknown>,
> {
  selectionConfig: UseTableSelectionConfig<T>;
}

const stableTrue = () => true;

export function useTableSelectionState<T extends Record<string, unknown>>({
  data,
  getIsItemEnabled = stableTrue,
  getIsItemSelectable = stableTrue,
  idKey,
  selectedKeys,
  setSelectedKeys,
}: UseTableSelectionStateConfig<T>): UseTableSelectionStateResult<T> {
  const getId = useCallback(
    (item: T): string =>
      typeof idKey === 'function' ? idKey(item) : String(item[idKey]),
    [idKey],
  );

  const getIsActionable = useCallback(
    (item: T) => getIsItemSelectable(item) && getIsItemEnabled(item),
    [getIsItemEnabled, getIsItemSelectable],
  );
  const actionableIDs = useMemo(
    () => new Set(data.filter(getIsActionable).map(getId)),
    [data, getId, getIsActionable],
  );
  const frozenSelectedIDs = useMemo(() => {
    const frozen = new Set<string>();
    for (const id of selectedKeys) {
      if (!actionableIDs.has(id)) {
        frozen.add(id);
      }
    }
    return frozen;
  }, [actionableIDs, selectedKeys]);
  const allSelectableIDs = useMemo(
    () => new Set([...selectedKeys, ...actionableIDs]),
    [actionableIDs, selectedKeys],
  );

  const onSelectAll = useCallback(
    ({isAllSelected}: {isAllSelected: boolean}) => {
      setSelectedKeys(isAllSelected ? allSelectableIDs : frozenSelectedIDs);
    },
    [allSelectableIDs, frozenSelectedIDs, setSelectedKeys],
  );
  const onSelectItem = useCallback(
    ({isSelected, item}: {isSelected: boolean; item: T}) => {
      setSelectedKeys(previous => {
        const next = new Set(previous);
        const id = getId(item);
        if (isSelected) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [getId, setSelectedKeys],
  );
  const getIsAllSelected = useCallback(
    () => actionableIDs.size > 0 && allSelectableIDs.size === selectedKeys.size,
    [actionableIDs.size, allSelectableIDs, selectedKeys],
  );
  const getIsIndeterminate = useCallback(() => {
    const selectedActionableCount = data.filter(
      item => getIsActionable(item) && selectedKeys.has(getId(item)),
    ).length;
    return (
      selectedActionableCount > 0 &&
      selectedActionableCount < actionableIDs.size
    );
  }, [actionableIDs.size, data, getId, getIsActionable, selectedKeys]);

  const selectionConfig = useMemo(
    (): UseTableSelectionConfig<T> => ({
      getIsAllSelected,
      getIsIndeterminate,
      getIsItemEnabled,
      getIsItemSelectable,
      getIsItemSelected: item => selectedKeys.has(getId(item)),
      onSelectAll,
      onSelectItem,
    }),
    [
      getId,
      getIsAllSelected,
      getIsIndeterminate,
      getIsItemEnabled,
      getIsItemSelectable,
      onSelectAll,
      onSelectItem,
      selectedKeys,
    ],
  );

  return {selectionConfig};
}
