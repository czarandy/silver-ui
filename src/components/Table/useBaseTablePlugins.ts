import {useMemo} from 'react';
import type {TablePlugin} from './types';

export function useBaseTablePlugins<T extends Record<string, unknown>>(
  basePlugins: TablePlugin<T>[],
  userPlugins?: Record<string, TablePlugin<T>> | TablePlugin<T>[],
): TablePlugin<T>[] {
  return useMemo(() => {
    const plugins = Array.isArray(userPlugins)
      ? userPlugins
      : Object.values(userPlugins ?? {});
    return [...basePlugins, ...plugins];
  }, [basePlugins, userPlugins]);
}
