'use client';

import {useMemo} from 'react';
import type {TablePlugin} from 'components/Table/types';

const CANONICAL_PLUGIN_ORDER = [
  'columnSettings',
  'sort',
  'selection',
  'filtering',
  'columnResize',
  'pagination',
] as const;

const CANONICAL_PLUGIN_KEYS = new Set<string>(CANONICAL_PLUGIN_ORDER);

function orderNamedPlugins<T extends Record<string, unknown>>(
  userPlugins: Record<string, TablePlugin<T>>,
): TablePlugin<T>[] {
  const entries = Object.entries(userPlugins);
  const pluginsByName = new Map(entries);
  const orderedPlugins = CANONICAL_PLUGIN_ORDER.filter(key =>
    pluginsByName.has(key),
  ).map(key => pluginsByName.get(key) as TablePlugin<T>);
  const customPlugins = entries
    .filter(([key]) => !CANONICAL_PLUGIN_KEYS.has(key))
    .map(([, plugin]) => plugin);

  return [...orderedPlugins, ...customPlugins];
}

export function useBaseTablePlugins<T extends Record<string, unknown>>(
  userPlugins?: Record<string, TablePlugin<T>> | TablePlugin<T>[],
): TablePlugin<T>[] {
  return useMemo(
    () =>
      Array.isArray(userPlugins)
        ? userPlugins
        : orderNamedPlugins(userPlugins ?? {}),
    [userPlugins],
  );
}
