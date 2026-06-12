import {useMemo} from 'react';
import type {UseTableColumnSettingsStateConfig} from 'components/Table/plugins/columnSettings/useTableColumnSettingsState';
import type {TableColumn, TablePlugin} from 'components/Table/types';

export interface TableColumnSettingsOption<TColumnKey extends string = string> {
  group?: string;
  isAlwaysVisible?: boolean;
  key: TColumnKey;
  label: string;
}

export type UseTableColumnSettingsConfig<TColumnKey extends string = string> =
  UseTableColumnSettingsStateConfig<TColumnKey>;

export function useTableColumnSettings<
  T extends Record<string, unknown>,
  TColumnKey extends string = string,
>(config: UseTableColumnSettingsConfig<TColumnKey>): TablePlugin<T> {
  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        const activeSet = new Set(config.activeColumnKeys);
        const orderMap = new Map(
          config.activeColumnKeys.map((key, index) => [key, index]),
        );
        return columns
          .filter(column => activeSet.has(column.key as TColumnKey))
          .sort(
            (a, b) =>
              (orderMap.get(a.key as TColumnKey) ?? Infinity) -
              (orderMap.get(b.key as TColumnKey) ?? Infinity),
          );
      },
    }),
    [config],
  );
}
