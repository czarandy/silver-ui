import type {TablePlugin} from 'components/Table/types';

type ColumnWrapperKind = 'expansion' | 'rowLink';

const columnWrapperKinds = new WeakMap<object, ColumnWrapperKind>();

/**
 * Marks a plugin that wraps a content column's `renderCell`, so `Table` can
 * order wrappers that must nest a particular way.
 */
export function markColumnWrapper<T extends Record<string, unknown>>(
  plugin: TablePlugin<T>,
  kind: ColumnWrapperKind,
): TablePlugin<T> {
  columnWrapperKinds.set(plugin, kind);
  return plugin;
}

/**
 * Moves row links ahead of the first expansion plugin, whatever their keys or
 * array order. A row link then wraps its column's content before expansion adds
 * its indent and chevron, which keeps the chevron button out of the link.
 */
export function orderColumnWrappers<T extends Record<string, unknown>>(
  plugins: TablePlugin<T>[],
): TablePlugin<T>[] {
  const firstExpansionIndex = plugins.findIndex(
    plugin => columnWrapperKinds.get(plugin) === 'expansion',
  );
  if (firstExpansionIndex === -1) {
    return plugins;
  }
  const lateRowLinks = plugins.filter(
    (plugin, index) =>
      index > firstExpansionIndex &&
      columnWrapperKinds.get(plugin) === 'rowLink',
  );
  if (lateRowLinks.length === 0) {
    return plugins;
  }

  const ordered = plugins.filter(plugin => !lateRowLinks.includes(plugin));
  ordered.splice(firstExpansionIndex, 0, ...lateRowLinks);
  return ordered;
}
