import {ArrowDown, ArrowUp, ChevronsUpDown} from 'lucide-react';
import {useMemo, type ReactNode} from 'react';
import {css} from 'styled-system/css';
import {Icon} from '../../../Icon';
import type {
  HeaderCellRenderProps,
  TableColumn,
  TablePlugin,
} from '../../types';

export type TableSortDirection = 'ascending' | 'descending';

export interface TableSortEntry<TSortKey extends string = string> {
  direction: TableSortDirection;
  sortKey: TSortKey;
}

export type TableSortState<TSortKey extends string = string> =
  TableSortEntry<TSortKey>[];

export interface UseTableSortableConfig<TSortKey extends string = string> {
  hasUnsortedState?: boolean;
  isMultiSortEnabled?: boolean;
  onSortChange: (sort: TableSortState<TSortKey>) => void;
  sort: TableSortState<TSortKey>;
}

const styles = {
  button: css({
    display: 'flex',
    alignItems: 'center',
    gap: '1',
    w: 'full',
    h: 'full',
    p: 0,
    m: 0,
    borderWidth: 0,
    borderRadius: 'sm',
    bg: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'inherit',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  icon: css({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'fg.muted',
  }),
  iconActive: css({
    color: 'primary',
  }),
  label: css({
    minW: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  rank: css({
    color: 'primary',
    fontSize: '2xs',
    lineHeight: 1,
  }),
} as const;

function resolveSortKey<T extends Record<string, unknown>>(
  column: TableColumn<T>,
): string | null {
  if (!column.sortable) {
    return null;
  }
  return column.sortable === true
    ? column.key
    : (column.sortable.sortKey ?? column.key);
}

function getHeaderLabel<T extends Record<string, unknown>>(
  column: TableColumn<T>,
): string {
  return typeof column.header === 'string' ? column.header : column.key;
}

function getNextDirection(
  current: TableSortDirection | null,
  hasUnsortedState: boolean,
): TableSortDirection | null {
  if (current == null) {
    return 'ascending';
  }
  if (current === 'ascending') {
    return 'descending';
  }
  return hasUnsortedState ? null : 'ascending';
}

function SortHeaderButton<T extends Record<string, unknown>>({
  children,
  column,
  config,
}: {
  children: ReactNode;
  column: TableColumn<T>;
  config: UseTableSortableConfig;
}): React.JSX.Element {
  const sortKey = resolveSortKey(column) ?? '';
  const entryIndex = config.sort.findIndex(entry => entry.sortKey === sortKey);
  const entry = entryIndex >= 0 ? config.sort[entryIndex] : null;
  const direction = entry?.direction ?? null;
  const rank =
    config.isMultiSortEnabled === true &&
    config.sort.length > 1 &&
    entryIndex >= 0
      ? entryIndex + 1
      : null;
  const SortIcon =
    direction === 'ascending'
      ? ArrowUp
      : direction === 'descending'
        ? ArrowDown
        : ChevronsUpDown;
  const label = getHeaderLabel(column);
  const ariaLabel =
    direction == null
      ? `Sort by ${label}`
      : `Sort by ${label}, sorted ${direction}${
          rank == null ? '' : `, priority ${rank} of ${config.sort.length}`
        }`;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextConfig = config;
    const isMultiSort =
      event.shiftKey && nextConfig.isMultiSortEnabled === true;
    const allowUnsorted = nextConfig.hasUnsortedState ?? true;

    if (isMultiSort) {
      const index = nextConfig.sort.findIndex(sort => sort.sortKey === sortKey);
      if (index >= 0) {
        const nextDirection = getNextDirection(
          nextConfig.sort[index].direction,
          allowUnsorted,
        );
        const nextSort = [...nextConfig.sort];
        if (nextDirection == null) {
          nextSort.splice(index, 1);
        } else {
          nextSort[index] = {...nextSort[index], direction: nextDirection};
        }
        nextConfig.onSortChange(nextSort);
      } else {
        nextConfig.onSortChange([
          ...nextConfig.sort,
          {direction: 'ascending', sortKey},
        ]);
      }
      return;
    }

    const currentEntry = nextConfig.sort.find(sort => sort.sortKey === sortKey);
    const nextDirection = getNextDirection(
      currentEntry?.direction ?? null,
      allowUnsorted,
    );
    nextConfig.onSortChange(
      nextDirection == null ? [] : [{direction: nextDirection, sortKey}],
    );
  };

  return (
    <button
      aria-label={ariaLabel}
      className={styles.button}
      onClick={handleClick}
      type="button">
      <span className={styles.label}>{children}</span>
      <span
        className={`${styles.icon} ${direction == null ? '' : styles.iconActive}`}>
        <Icon icon={SortIcon} size="sm" />
      </span>
      {rank == null ? null : (
        <span aria-hidden="true" className={styles.rank}>
          {rank}
        </span>
      )}
    </button>
  );
}

export function useTableSortable<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>(config: UseTableSortableConfig<TSortKey>): TablePlugin<T> {
  const sortableConfig = config as unknown as UseTableSortableConfig;

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        const sortKey = resolveSortKey(column);
        if (sortKey == null) {
          return props;
        }
        const entry = sortableConfig.sort.find(
          sort => sort.sortKey === sortKey,
        );
        return {
          ...props,
          content: (
            <SortHeaderButton column={column} config={sortableConfig}>
              {props.content}
            </SortHeaderButton>
          ),
          htmlProps: {
            ...props.htmlProps,
            ...(entry == null ? {} : {'aria-sort': entry.direction}),
          },
        };
      },
    }),
    [sortableConfig],
  );
}
