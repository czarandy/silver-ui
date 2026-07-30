'use client';

import {useCallback, useMemo, useState} from 'react';
import type {UseTableRowExpansionConfig} from 'components/Table/plugins/expansion/useTableRowExpansion';

export interface UseTableRowExpansionStateConfig<
  T extends Record<string, unknown>,
> {
  /**
   * The un-flattened tree of rows.
   */
  data: T[];
  /**
   * Row keys expanded on first render when `expandedKeys` is uncontrolled.
   */
  defaultExpandedKeys?: Iterable<string>;
  /**
   * Controlled set of expanded row keys.
   */
  expandedKeys?: ReadonlySet<string>;
  /**
   * Returns the child rows of a row. Leaf rows return `undefined` or `[]`.
   */
  getChildren: (item: T) => ReadonlyArray<T> | undefined;
  /**
   * Controls which rows can be expanded. Rows that return `false` never show
   * a chevron and are skipped by expand-all, along with their descendants.
   * @default rows with at least one child
   */
  getIsItemExpandable?: (item: T) => boolean;
  /**
   * Derives a stable unique key from a row.
   */
  getRowKey: (item: T) => string;
  /**
   * Called with the next expanded keys whenever expansion changes.
   */
  onExpandedKeysChange?: (expandedKeys: ReadonlySet<string>) => void;
}

export interface UseTableRowExpansionStateResult<
  T extends Record<string, unknown>,
> {
  /**
   * The flattened, currently-visible rows. Pass to `<Table data>`.
   */
  data: T[];
  /**
   * The resolved set of expanded row keys.
   */
  expandedKeys: ReadonlySet<string>;
  /**
   * Ready-to-use config for `useTableRowExpansion`.
   */
  expansionConfig: UseTableRowExpansionConfig<T>;
  /**
   * Whether every expandable row is expanded.
   */
  isAllExpanded: boolean | 'indeterminate';
  /**
   * Expands (`true`) or collapses (`false`) every expandable row.
   */
  onToggleExpandAll: (isExpanded: boolean) => void;
  /**
   * Toggles the expansion of a single row.
   */
  onToggleRow: (key: string) => void;
}

const warnedCycleKeys = new Set<string>();

function warnCyclicRow(key: string): void {
  if (process.env.NODE_ENV !== 'production' && !warnedCycleKeys.has(key)) {
    warnedCycleKeys.add(key);
    console.warn(
      `[Table] Row "${key}" is reachable from its own descendants; ` +
        'skipping the cyclic edge. Row expansion expects tree-shaped data.',
    );
  }
}

/**
 * Manages row-expansion state and flattens the visible tree for `<Table>`.
 *
 * The Table renders a flat array, so hierarchical data must be flattened
 * before it is passed in: parents first, followed by the children of each
 * expanded row, depth-first. This hook owns that flattening plus the
 * expansion state, and bundles everything `useTableRowExpansion` needs into
 * `expansionConfig`.
 *
 * Tree walks tolerate cyclic references in the input: an edge that points
 * back to a row already on the current ancestor path is skipped (with a dev
 * warning). Shared children reachable from several parents are not cycles
 * and appear under each expanded parent — their visible rows then collide on
 * `getRowKey`, so keys must be unique per visible row.
 */
export function useTableRowExpansionState<T extends Record<string, unknown>>({
  data: treeData,
  defaultExpandedKeys,
  expandedKeys: controlledExpandedKeys,
  getChildren,
  getIsItemExpandable,
  getRowKey,
  onExpandedKeysChange,
}: UseTableRowExpansionStateConfig<T>): UseTableRowExpansionStateResult<T> {
  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<
    ReadonlySet<string>
  >(() => new Set(defaultExpandedKeys));
  const expandedKeys = controlledExpandedKeys ?? uncontrolledExpandedKeys;
  const commitExpandedKeys = useCallback(
    (nextKeys: ReadonlySet<string>) => {
      if (controlledExpandedKeys == null) {
        setUncontrolledExpandedKeys(nextKeys);
      }
      onExpandedKeysChange?.(nextKeys);
    },
    [controlledExpandedKeys, onExpandedKeysChange],
  );

  const getIsRowExpandable = useCallback(
    (item: T): boolean =>
      getIsItemExpandable == null
        ? (getChildren(item)?.length ?? 0) > 0
        : getIsItemExpandable(item),
    [getChildren, getIsItemExpandable],
  );

  const {depthMap, rows} = useMemo(() => {
    const flattenedRows: T[] = [];
    const depths = new Map<string, number>();
    // Keys on the current ancestor path — guards against cyclic data.
    const path = new Set<string>();
    const walk = (items: ReadonlyArray<T>, depth: number): void => {
      for (const item of items) {
        const key = getRowKey(item);
        if (path.has(key)) {
          warnCyclicRow(key);
          continue;
        }
        flattenedRows.push(item);
        depths.set(key, depth);
        if (expandedKeys.has(key)) {
          const children = getChildren(item);
          if (children != null && children.length > 0) {
            path.add(key);
            walk(children, depth + 1);
            path.delete(key);
          }
        }
      }
    };
    walk(treeData, 0);
    return {depthMap: depths, rows: flattenedRows};
  }, [expandedKeys, getChildren, getRowKey, treeData]);

  // Every expandable key in the whole tree, expanded or not — drives
  // expand-all. Subtrees under non-expandable rows are unreachable and
  // excluded.
  const allExpandableKeys = useMemo(() => {
    const keys: string[] = [];
    const path = new Set<string>();
    const walk = (items: ReadonlyArray<T>): void => {
      for (const item of items) {
        const key = getRowKey(item);
        if (path.has(key)) {
          warnCyclicRow(key);
          continue;
        }
        if (!getIsRowExpandable(item)) {
          continue;
        }
        keys.push(key);
        const children = getChildren(item);
        if (children != null && children.length > 0) {
          path.add(key);
          walk(children);
          path.delete(key);
        }
      }
    };
    walk(treeData);
    return keys;
  }, [getChildren, getIsRowExpandable, getRowKey, treeData]);

  const getDepth = useCallback(
    (item: T): number => depthMap.get(getRowKey(item)) ?? 0,
    [depthMap, getRowKey],
  );

  const onToggleRow = useCallback(
    (key: string) => {
      const nextKeys = new Set(expandedKeys);
      if (!nextKeys.delete(key)) {
        nextKeys.add(key);
      }
      commitExpandedKeys(nextKeys);
    },
    [commitExpandedKeys, expandedKeys],
  );

  const isAllExpanded: boolean | 'indeterminate' = useMemo(() => {
    if (allExpandableKeys.length === 0) {
      return false;
    }
    let expandedCount = 0;
    for (const key of allExpandableKeys) {
      if (expandedKeys.has(key)) {
        expandedCount += 1;
      }
    }
    if (expandedCount === 0) {
      return false;
    }
    return expandedCount === allExpandableKeys.length ? true : 'indeterminate';
  }, [allExpandableKeys, expandedKeys]);

  const onToggleExpandAll = useCallback(
    (isExpanded: boolean) => {
      commitExpandedKeys(isExpanded ? new Set(allExpandableKeys) : new Set());
    },
    [allExpandableKeys, commitExpandedKeys],
  );

  const expansionConfig = useMemo(
    (): UseTableRowExpansionConfig<T> => ({
      expandedKeys,
      getDepth,
      getIsRowExpandable,
      getRowKey,
      isAllExpanded,
      onToggleExpandAll,
      onToggleRow,
    }),
    [
      expandedKeys,
      getDepth,
      getIsRowExpandable,
      getRowKey,
      isAllExpanded,
      onToggleExpandAll,
      onToggleRow,
    ],
  );

  return {
    data: rows,
    expandedKeys,
    expansionConfig,
    isAllExpanded,
    onToggleExpandAll,
    onToggleRow,
  };
}
