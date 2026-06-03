import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefCallback,
} from 'react';
import {css} from 'styled-system/css';
import {mergeRefs} from '../../../../internal/mergeRefs';
import {CheckboxInput} from '../../../CheckboxInput';
import {pixel} from '../../columnUtils';
import type {BodyRowRenderProps, TableColumn, TablePlugin} from '../../types';

export interface UseTableSelectionConfig<T extends Record<string, unknown>> {
  getIsAllSelected: () => boolean;
  getIsIndeterminate?: () => boolean;
  getIsItemEnabled?: (item: T) => boolean;
  getIsItemSelectable?: (item: T) => boolean;
  getIsItemSelected: (item: T) => boolean;
  onSelectAll: (event: {isAllSelected: boolean}) => void;
  onSelectItem: (event: {isSelected: boolean; item: T}) => void;
}

const styles = {
  center: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  selectedRow: css({
    bg: 'bg.selected',
  }),
} as const;

const SELECTION_COLUMN_KEY = '__table_selection';

interface SelectionStore<T extends Record<string, unknown>> {
  getConfig: () => UseTableSelectionConfig<T>;
  notify: () => void;
  subscribe: (listener: () => void) => () => void;
}

function createSelectionStore<T extends Record<string, unknown>>(configRef: {
  current: UseTableSelectionConfig<T>;
}): SelectionStore<T> {
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

function applyRowSelectionStyle(
  element: HTMLTableRowElement,
  isSelected: boolean,
): void {
  element.classList.toggle(styles.selectedRow, isSelected);
  if (isSelected) {
    element.setAttribute('aria-selected', 'true');
  } else {
    element.removeAttribute('aria-selected');
  }
}

const ITEM_SELECTED = 1;
const ITEM_SELECTABLE = 2;
const ITEM_ENABLED = 4;

function getItemSelectionSnapshot<T extends Record<string, unknown>>(
  config: UseTableSelectionConfig<T>,
  item: T,
): number {
  const isSelected = config.getIsItemSelected(item);
  const isSelectable = config.getIsItemSelectable?.(item) ?? true;
  const isEnabled = config.getIsItemEnabled?.(item) ?? true;

  return (
    (isSelected ? ITEM_SELECTED : 0) |
    (isSelectable ? ITEM_SELECTABLE : 0) |
    (isEnabled ? ITEM_ENABLED : 0)
  );
}

const SELECT_NONE = 0;
const SELECT_INDETERMINATE = 1;
const SELECT_ALL = 2;

const SelectionStoreContext = createContext<SelectionStore<
  Record<string, unknown>
> | null>(null);
SelectionStoreContext.displayName = 'TableSelectionStoreContext';

function SelectAllCheckbox<T extends Record<string, unknown>>(): ReactNode {
  const store = use(SelectionStoreContext) as SelectionStore<T> | null;
  if (store == null) {
    return null;
  }

  return <SelectAllCheckboxInner store={store} />;
}

function SelectAllCheckboxInner<T extends Record<string, unknown>>({
  store,
}: {
  store: SelectionStore<T>;
}): ReactNode {
  const getSnapshot = useCallback(() => {
    const config = store.getConfig();
    if (config.getIsAllSelected()) {
      return SELECT_ALL;
    }
    return config.getIsIndeterminate?.() === true
      ? SELECT_INDETERMINATE
      : SELECT_NONE;
  }, [store]);
  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  const isAllSelected = state === SELECT_ALL;

  return (
    <CheckboxInput
      isLabelHidden
      label="Select all rows"
      onChange={() => {
        store.getConfig().onSelectAll({
          isAllSelected: !isAllSelected,
        });
      }}
      size="sm"
      value={
        isAllSelected
          ? true
          : state === SELECT_INDETERMINATE
            ? 'indeterminate'
            : false
      }
    />
  );
}

function SelectionCellContent<T extends Record<string, unknown>>({
  item,
}: {
  item: T;
}): ReactNode {
  const store = use(SelectionStoreContext) as SelectionStore<T> | null;
  if (store == null) {
    return null;
  }

  return <SelectionCellContentInner item={item} store={store} />;
}

function SelectionCellContentInner<T extends Record<string, unknown>>({
  item,
  store,
}: {
  item: T;
  store: SelectionStore<T>;
}): ReactNode {
  const getSnapshot = useCallback(
    () => getItemSelectionSnapshot(store.getConfig(), item),
    [item, store],
  );
  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
  const isSelected = (state & ITEM_SELECTED) !== 0;
  const isSelectable = (state & ITEM_SELECTABLE) !== 0;
  const isEnabled = (state & ITEM_ENABLED) !== 0;

  if (!isSelectable) {
    return null;
  }

  return (
    <CheckboxInput
      isDisabled={!isEnabled}
      isLabelHidden
      label="Select row"
      onChange={() => {
        store.getConfig().onSelectItem({isSelected: !isSelected, item});
      }}
      size="sm"
      value={isSelected}
    />
  );
}

export function useTableSelection<T extends Record<string, unknown>>(
  config: UseTableSelectionConfig<T>,
): TablePlugin<T> {
  /* eslint-disable @eslint-react/refs -- external store keeps plugin identity stable while exposing the latest selection config */
  const configRef = useRef(config);
  configRef.current = config;

  const storeRef = useRef<SelectionStore<T> | null>(null);
  storeRef.current ??= createSelectionStore(configRef);
  const store = storeRef.current;
  /* eslint-enable @eslint-react/refs */

  useEffect(() => {
    store.notify();
  });

  const selectionColumn = useMemo(
    (): TableColumn<T> => ({
      header: (
        <div className={styles.center}>
          <SelectAllCheckbox<T> />
        </div>
      ),
      key: SELECTION_COLUMN_KEY,
      renderCell: item => (
        <div className={styles.center}>
          <SelectionCellContent item={item} />
        </div>
      ),
      resizable: false,
      width: pixel(36),
    }),
    [],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode): ReactNode {
        return (
          <SelectionStoreContext
            value={store as unknown as SelectionStore<Record<string, unknown>>}>
            {children}
          </SelectionStoreContext>
        );
      },
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        let unsubscribe: (() => void) | null = null;
        const selectionRef: RefCallback<HTMLTableRowElement> = element => {
          unsubscribe?.();
          unsubscribe = null;

          if (element == null) {
            return;
          }

          applyRowSelectionStyle(
            element,
            store.getConfig().getIsItemSelected(item),
          );
          unsubscribe = store.subscribe(() => {
            if (!element.isConnected) {
              unsubscribe?.();
              unsubscribe = null;
              return;
            }
            applyRowSelectionStyle(
              element,
              store.getConfig().getIsItemSelected(item),
            );
          });
        };

        return {
          ...props,
          ref:
            props.ref == null
              ? selectionRef
              : mergeRefs(props.ref, selectionRef),
        };
      },
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        return [selectionColumn, ...columns];
      },
    }),
    [selectionColumn, store],
  );
}
