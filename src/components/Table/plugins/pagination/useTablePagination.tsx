'use client';

import {useMemo, type ReactNode} from 'react';
import {Pagination, type PaginationProps} from 'components/Pagination';
import type {TablePlugin} from 'components/Table/types';
import {css} from 'styled-system/css';

export interface UseTablePaginationConfig {
  align?: 'center' | 'end' | 'start';
  hasMore?: boolean;
  label?: string;
  onPageChange: (page: number) => void;
  page: number;
  pageSize?: number;
  position?: 'above' | 'below' | 'both' | 'none';
  size?: 'lg' | 'md' | 'sm';
  totalItems?: number;
  totalPages?: number;
  variant?: 'compact' | 'count' | 'none' | 'pages';
}

const styles = {
  align: {
    center: css({justifyContent: 'center'}),
    end: css({justifyContent: 'flex-end'}),
    start: css({justifyContent: 'flex-start'}),
  },
  below: css({mt: '2'}),
  root: css({display: 'flex'}),
  above: css({mb: '2'}),
} as const;

export function useTablePagination<T extends Record<string, unknown>>({
  align = 'center',
  hasMore,
  label = 'Table pagination',
  onPageChange,
  page,
  pageSize = 10,
  position = 'below',
  size = 'md',
  totalItems,
  totalPages,
  variant = 'pages',
}: UseTablePaginationConfig): TablePlugin<T> {
  const computedTotalPages =
    totalPages ??
    (totalItems == null ? undefined : Math.ceil(totalItems / pageSize));
  const paginationProps = useMemo(
    (): PaginationProps => ({
      hasMore,
      label,
      onChange: onPageChange,
      page,
      pageSize,
      size,
      ...(totalItems != null
        ? {totalItems}
        : computedTotalPages != null
          ? {totalPages: computedTotalPages}
          : {}),
      variant,
    }),
    [
      computedTotalPages,
      hasMore,
      label,
      onPageChange,
      page,
      pageSize,
      size,
      totalItems,
      variant,
    ],
  );
  return useMemo(
    (): TablePlugin<T> => ({
      transformTableContext(children: ReactNode): ReactNode {
        const current = {align, paginationProps, position};
        if (current.position === 'none') {
          return children;
        }
        if (computedTotalPages === 1 && hasMore !== true) {
          return children;
        }

        const makePagination = (side: 'above' | 'below') => (
          <div
            className={`${styles.root} ${styles.align[current.align]} ${
              side === 'above' ? styles.above : styles.below
            }`}>
            <Pagination {...current.paginationProps} />
          </div>
        );

        return (
          <>
            {current.position === 'above' || current.position === 'both'
              ? makePagination('above')
              : null}
            {children}
            {current.position === 'below' || current.position === 'both'
              ? makePagination('below')
              : null}
          </>
        );
      },
    }),
    [align, computedTotalPages, hasMore, paginationProps, position],
  );
}
