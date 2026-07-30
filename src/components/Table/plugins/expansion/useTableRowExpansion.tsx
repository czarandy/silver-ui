'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefCallback,
} from 'react';
import {Icon} from 'components/Icon';
import {defaultCellRenderer, pixel} from 'components/Table/columnUtils';
import {rowExpansionRecipe} from 'components/Table/plugins/expansion/RowExpansion.recipe';
import type {
  BodyRowRenderProps,
  TableColumn,
  TablePlugin,
} from 'components/Table/types';
import useConstant from 'hooks/useConstant';
import {LogicalChevronEnd} from 'internal/LogicalChevron';
import {mergeRefs} from 'internal/mergeRefs';
import useLatest from 'internal/useLatest';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface UseTableRowExpansionConfig<T extends Record<string, unknown>> {
  /**
   * The set of currently-expanded row keys.
   */
  expandedKeys: ReadonlySet<string>;
  /**
   * Returns the nesting depth of a row (0 = top level).
   */
  getDepth: (item: T) => number;
  /**
   * Accessible name for the expand-all header toggle.
   * @default 'Expand all rows' / 'Collapse all rows'
   */
  getExpandAllLabel?: (isAllExpanded: boolean | 'indeterminate') => string;
  /**
   * Accessible name for a row's expander control.
   * @default 'Expand row' / 'Collapse row'
   */
  getExpanderLabel?: (item: T, isExpanded: boolean) => string;
  /**
   * Returns whether a row can be expanded.
   */
  getIsRowExpandable: (item: T) => boolean;
  /**
   * Derives a stable unique key from a row.
   */
  getRowKey: (item: T) => string;
  /**
   * Shows an expand-all toggle in the expansion column header. Requires
   * `isAllExpanded` and `onToggleExpandAll`.
   * @default false
   */
  hasExpandAllToggle?: boolean;
  /**
   * Toggles expansion when an expandable row is clicked, in addition to the
   * chevron.
   * @default false
   */
  hasRowClickExpansion?: boolean;
  /**
   * State of the expand-all toggle.
   */
  isAllExpanded?: boolean | 'indeterminate';
  /**
   * Called when the expand-all toggle is clicked.
   */
  onToggleExpandAll?: (isExpanded: boolean) => void;
  /**
   * Called when a row's expansion is toggled.
   */
  onToggleRow: (key: string) => void;
}

const styles = {
  center: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  clickableRow: css({
    cursor: 'pointer',
  }),
} as const;

const EXPANSION_COLUMN_KEY = '__table_expansion';

type ExpansionIndentStyle = CSSProperties & {
  '--table-expansion-indent': number;
};

// Clicks originating from interactive content (the expander itself, links,
// selection checkboxes, …) must not toggle the row.
const INTERACTIVE_TARGET_SELECTOR =
  'a, button, input, select, textarea, [role="button"], [role="checkbox"]';

interface ExpansionStore<T extends Record<string, unknown>> {
  getConfig: () => UseTableRowExpansionConfig<T>;
  notify: () => void;
  subscribe: (listener: () => void) => () => void;
}

function createExpansionStore<T extends Record<string, unknown>>(configRef: {
  current: UseTableRowExpansionConfig<T>;
}): ExpansionStore<T> {
  const listeners = new Set<() => void>();

  return {
    getConfig: () => configRef.current,
    notify: () => {
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const ROW_EXPANDED = 1;
const ROW_EXPANDABLE = 2;

// Depth is packed above the two flag bits so one integer captures everything
// a cell renders from; `useSyncExternalStore` then bails out on unchanged
// primitives instead of diffing objects.
function getRowExpansionSnapshot<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
  item: T,
): number {
  const isExpanded = config.expandedKeys.has(config.getRowKey(item));
  const isExpandable = config.getIsRowExpandable(item);
  return (
    config.getDepth(item) * 4 +
    (isExpandable ? ROW_EXPANDABLE : 0) +
    (isExpanded ? ROW_EXPANDED : 0)
  );
}

const EXPAND_ALL_HIDDEN = 0;
const EXPAND_ALL_NONE = 1;
const EXPAND_ALL_INDETERMINATE = 2;
const EXPAND_ALL_ALL = 3;

const ExpansionStoreContext = createContext<ExpansionStore<
  Record<string, unknown>
> | null>(null);
ExpansionStoreContext.displayName = 'TableExpansionStoreContext';

function getExpanderLabel<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
  item: T,
  isExpanded: boolean,
): string {
  return (
    config.getExpanderLabel?.(item, isExpanded) ??
    (isExpanded ? 'Collapse row' : 'Expand row')
  );
}

function ExpansionChevron({
  isExpanded,
  label,
  onToggle,
}: {
  isExpanded: boolean;
  label: string;
  onToggle: () => void;
}): ReactNode {
  const classes = rowExpansionRecipe({isExpanded});
  return (
    <button
      aria-expanded={isExpanded}
      aria-label={label}
      className={classes.toggleButton}
      onClick={event => {
        event.stopPropagation();
        onToggle();
      }}
      type="button">
      <span className={classes.toggleIcon}>
        <Icon icon={LogicalChevronEnd} size="sm" />
      </span>
    </button>
  );
}

function ExpandAllToggle<T extends Record<string, unknown>>(): ReactNode {
  const store = use(ExpansionStoreContext) as ExpansionStore<T> | null;
  if (store == null) {
    return null;
  }

  return <ExpandAllToggleInner store={store} />;
}

function ExpandAllToggleInner<T extends Record<string, unknown>>({
  store,
}: {
  store: ExpansionStore<T>;
}): ReactNode {
  const getSnapshot = useCallback(() => {
    const config = store.getConfig();
    if (
      config.hasExpandAllToggle !== true ||
      config.isAllExpanded === undefined ||
      config.onToggleExpandAll == null
    ) {
      return EXPAND_ALL_HIDDEN;
    }
    return config.isAllExpanded === true
      ? EXPAND_ALL_ALL
      : config.isAllExpanded === 'indeterminate'
        ? EXPAND_ALL_INDETERMINATE
        : EXPAND_ALL_NONE;
  }, [store]);
  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  if (state === EXPAND_ALL_HIDDEN) {
    return null;
  }

  const isAllExpanded = state === EXPAND_ALL_ALL;
  const classes = rowExpansionRecipe({isExpanded: isAllExpanded});
  const label =
    store
      .getConfig()
      .getExpandAllLabel?.(
        isAllExpanded
          ? true
          : state === EXPAND_ALL_INDETERMINATE
            ? 'indeterminate'
            : false,
      ) ?? (isAllExpanded ? 'Collapse all rows' : 'Expand all rows');
  return (
    <button
      aria-expanded={isAllExpanded}
      aria-label={label}
      className={classes.toggleButton}
      onClick={() => {
        store.getConfig().onToggleExpandAll?.(!isAllExpanded);
      }}
      type="button">
      <span className={classes.toggleIcon}>
        <Icon icon={LogicalChevronEnd} size="sm" />
      </span>
    </button>
  );
}

function ExpansionColumnCell<T extends Record<string, unknown>>({
  item,
}: {
  item: T;
}): ReactNode {
  const store = use(ExpansionStoreContext) as ExpansionStore<T> | null;
  if (store == null) {
    return null;
  }

  return <ExpansionColumnCellInner item={item} store={store} />;
}

function ExpansionColumnCellInner<T extends Record<string, unknown>>({
  item,
  store,
}: {
  item: T;
  store: ExpansionStore<T>;
}): ReactNode {
  const getSnapshot = useCallback(
    () => getRowExpansionSnapshot(store.getConfig(), item),
    [item, store],
  );
  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  const depth = Math.floor(state / 4);
  const isExpandable = (state & ROW_EXPANDABLE) !== 0;
  const isExpanded = (state & ROW_EXPANDED) !== 0;

  // Child rows show their chevron inline in the first content column instead.
  if (depth > 0 || !isExpandable) {
    return null;
  }

  const config = store.getConfig();
  return (
    <ExpansionChevron
      isExpanded={isExpanded}
      label={getExpanderLabel(config, item, isExpanded)}
      onToggle={() => {
        const currentConfig = store.getConfig();
        currentConfig.onToggleRow(currentConfig.getRowKey(item));
      }}
    />
  );
}

function ExpansionInlineCell<T extends Record<string, unknown>>({
  children,
  item,
}: {
  children: ReactNode;
  item: T;
}): ReactNode {
  const store = use(ExpansionStoreContext) as ExpansionStore<T> | null;
  if (store == null) {
    return children;
  }

  return (
    <ExpansionInlineCellInner item={item} store={store}>
      {children}
    </ExpansionInlineCellInner>
  );
}

function ExpansionInlineCellInner<T extends Record<string, unknown>>({
  children,
  item,
  store,
}: {
  children: ReactNode;
  item: T;
  store: ExpansionStore<T>;
}): ReactNode {
  const getSnapshot = useCallback(
    () => getRowExpansionSnapshot(store.getConfig(), item),
    [item, store],
  );
  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  const depth = Math.floor(state / 4);
  if (depth === 0) {
    return children;
  }

  const isExpandable = (state & ROW_EXPANDABLE) !== 0;
  const isExpanded = (state & ROW_EXPANDED) !== 0;
  const config = store.getConfig();
  const classes = rowExpansionRecipe({isExpanded});
  const indentStyle: ExpansionIndentStyle = {
    '--table-expansion-indent': depth - 1,
  };
  return (
    <div className={classes.cell} style={indentStyle}>
      {isExpandable ? (
        <ExpansionChevron
          isExpanded={isExpanded}
          label={getExpanderLabel(config, item, isExpanded)}
          onToggle={() => {
            const currentConfig = store.getConfig();
            currentConfig.onToggleRow(currentConfig.getRowKey(item));
          }}
        />
      ) : (
        <span className={classes.toggleSpacer} />
      )}
      {children}
    </div>
  );
}

/**
 * Table plugin for expandable rows with inherited columns: child rows use the
 * same columns as their parents, indented by depth in the first content
 * column, with a chevron control column prepended. Pair with
 * `useTableRowExpansionState`, which flattens the tree and derives this
 * config from a single set of expanded keys:
 *
 * ```tsx
 * const {data, expansionConfig} = useTableRowExpansionState({...});
 * const expansion = useTableRowExpansion(expansionConfig);
 * return <Table data={data} columns={columns} plugins={{expansion}} />;
 * ```
 */
export function useTableRowExpansion<T extends Record<string, unknown>>(
  config: UseTableRowExpansionConfig<T>,
): TablePlugin<T> {
  const configRef = useLatest(config);
  const store = useConstant(() => createExpansionStore(configRef));

  // Re-notify subscribers only when the expansion config changes. `config` is
  // memoized upstream by `useTableRowExpansionState`, so unrelated parent
  // re-renders skip the notification.
  useEffect(() => {
    store.notify();
  }, [config, store]);

  const expansionColumn = useMemo(
    (): TableColumn<T> => ({
      header: (
        <div className={styles.center}>
          <ExpandAllToggle<T> />
        </div>
      ),
      key: EXPANSION_COLUMN_KEY,
      renderCell: item => (
        <div className={styles.center}>
          <ExpansionColumnCell item={item} />
        </div>
      ),
      resizable: false,
      width: pixel(40),
    }),
    [],
  );

  // The wrapped columns must keep identity while the incoming columns do:
  // `Table` compares transformed columns element-wise, and a fresh wrapper
  // object per render would re-render every row on every render.
  const wrappedColumnsCacheRef = useRef<{
    input: TableColumn<T>[];
    output: TableColumn<T>[];
  } | null>(null);

  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode): ReactNode {
        return (
          <ExpansionStoreContext
            value={store as unknown as ExpansionStore<Record<string, unknown>>}>
            {children}
          </ExpansionStoreContext>
        );
      },
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        const cache = wrappedColumnsCacheRef.current;
        if (cache != null) {
          const isCacheHit =
            cache.input.length === columns.length &&
            cache.input.every((column, index) => column === columns[index]);
          if (isCacheHit) {
            return cache.output;
          }
        }

        // Indentation and inline chevrons land in the first content column;
        // columns injected by other plugins (`__`-prefixed) are skipped.
        const firstContentColumnKey = columns.find(
          column => !column.key.startsWith('__'),
        )?.key;
        const wrappedColumns = columns.map(column => {
          if (column.key !== firstContentColumnKey) {
            return column;
          }
          const renderCell = column.renderCell;
          return {
            ...column,
            renderCell: (item: T): ReactNode => (
              <ExpansionInlineCell item={item}>
                {renderCell == null
                  ? defaultCellRenderer(item, column.key)
                  : renderCell(item)}
              </ExpansionInlineCell>
            ),
          };
        });
        const output = [expansionColumn, ...wrappedColumns];
        wrappedColumnsCacheRef.current = {input: columns, output};
        return output;
      },
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        const currentConfig = configRef.current;
        if (
          currentConfig.hasRowClickExpansion !== true ||
          !currentConfig.getIsRowExpandable(item)
        ) {
          return props;
        }

        // `TableRow` forwards only className/style/ref to the `<tr>`, so the
        // click behavior attaches at the DOM level, mirroring how the
        // selection plugin applies row styling.
        let removeClickListener: (() => void) | null = null;
        const clickRef: RefCallback<HTMLTableRowElement> = element => {
          removeClickListener?.();
          removeClickListener = null;

          if (element == null) {
            return;
          }

          const handleClick = (event: MouseEvent): void => {
            const target = event.target as HTMLElement | null;
            if (target?.closest(INTERACTIVE_TARGET_SELECTOR) != null) {
              return;
            }
            const clickConfig = configRef.current;
            clickConfig.onToggleRow(clickConfig.getRowKey(item));
          };
          element.addEventListener('click', handleClick);
          removeClickListener = () => {
            element.removeEventListener('click', handleClick);
          };
        };

        return {
          ...props,
          className: cx(props.className, styles.clickableRow),
          ref: props.ref == null ? clickRef : mergeRefs(props.ref, clickRef),
        };
      },
    }),
    [configRef, expansionColumn, store],
  );
}
