'use client';

import {useCallback, useMemo} from 'react';
import type {TableColumnSettingsOption} from 'components/Table/plugins/columnSettings/useTableColumnSettings';

export interface UseTableColumnSettingsStateConfig<
  TColumnKey extends string = string,
> {
  activeColumnKeys: ReadonlyArray<TColumnKey>;
  columns: ReadonlyArray<TableColumnSettingsOption<TColumnKey>>;
  defaultColumnKeys?: ReadonlyArray<TColumnKey>;
  onChangeActiveColumnKeys: (keys: ReadonlyArray<TColumnKey>) => void;
}

export interface UseTableColumnSettingsStateReturn<
  TColumnKey extends string = string,
> {
  activeColumnKeys: ReadonlyArray<TColumnKey>;
  columnSettingsConfig: UseTableColumnSettingsStateConfig<TColumnKey>;
  getIsColumnActive: (key: TColumnKey) => boolean;
  getIsColumnToggleable: (key: TColumnKey) => boolean;
  resetToDefault: () => void;
  setActiveColumnKeys: (keys: string[]) => void;
  showAllColumns: () => void;
  toggleColumn: (key: TColumnKey) => void;
}

export function useTableColumnSettingsState<TColumnKey extends string = string>(
  config: UseTableColumnSettingsStateConfig<TColumnKey>,
): UseTableColumnSettingsStateReturn<TColumnKey> {
  const {activeColumnKeys, columns} = config;
  const activeSet = useMemo(
    () => new Set(activeColumnKeys),
    [activeColumnKeys],
  );
  const alwaysVisibleSet = useMemo(
    () =>
      new Set(
        columns
          .filter(column => column.isAlwaysVisible)
          .map(column => column.key),
      ),
    [columns],
  );

  const toggleColumn = useCallback(
    (key: TColumnKey) => {
      if (
        config.columns.some(
          column => column.key === key && column.isAlwaysVisible,
        )
      ) {
        return;
      }
      const currentSet = new Set(config.activeColumnKeys);
      config.onChangeActiveColumnKeys(
        currentSet.has(key)
          ? config.activeColumnKeys.filter(columnKey => columnKey !== key)
          : [...config.activeColumnKeys, key],
      );
    },
    [config],
  );
  const getIsColumnActive = useCallback(
    (key: TColumnKey) => activeSet.has(key),
    [activeSet],
  );
  const getIsColumnToggleable = useCallback(
    (key: TColumnKey) => !alwaysVisibleSet.has(key),
    [alwaysVisibleSet],
  );
  const showAllColumns = useCallback(() => {
    config.onChangeActiveColumnKeys(config.columns.map(column => column.key));
  }, [config]);
  const resetToDefault = useCallback(() => {
    config.onChangeActiveColumnKeys(
      config.defaultColumnKeys ?? config.columns.map(column => column.key),
    );
  }, [config]);
  const setActiveColumnKeys = useCallback(
    (keys: string[]) => {
      const next = new Set(keys as TColumnKey[]);
      for (const column of config.columns) {
        if (column.isAlwaysVisible) {
          next.add(column.key);
        }
      }
      config.onChangeActiveColumnKeys(Array.from(next));
    },
    [config],
  );

  return {
    activeColumnKeys,
    columnSettingsConfig: config,
    getIsColumnActive,
    getIsColumnToggleable,
    resetToDefault,
    setActiveColumnKeys,
    showAllColumns,
    toggleColumn,
  };
}
