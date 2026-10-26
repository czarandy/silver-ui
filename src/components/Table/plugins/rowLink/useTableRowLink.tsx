'use client';

import {useMemo, useRef, type ReactNode} from 'react';
import {Link} from 'components/Link';
import {defaultCellRenderer} from 'components/Table/columnUtils';
import {
  clickableRowClassName,
  createRowClickRef,
} from 'components/Table/rowClick';
import type {
  BodyRowRenderProps,
  TableColumn,
  TablePlugin,
} from 'components/Table/types';
import useConstant from 'hooks/useConstant';
import {
  forwardSurfaceEvent,
  type SurfaceMouseEventType,
} from 'internal/forwardSurfaceEvent';
import useLatest from 'internal/useLatest';
import {cx} from 'utils/cx';

export interface UseTableRowLinkConfig<T extends Record<string, unknown>> {
  /**
   * Key of the column whose cell content renders as each row's link. Choose a
   * column whose content contains no other links or controls.
   */
  columnKey: string;
  /**
   * Destination for a row. Rows without one render no link and are not
   * clickable.
   */
  getRowHref: (item: T) => string | null | undefined;
}

/**
 * Table plugin that makes whole rows navigate. Each linked row renders its
 * `columnKey` cell content as a `Link` (honoring `LinkProvider`), and clicks on
 * the rest of the row are forwarded to that link, so router navigation,
 * modifier clicks, and middle clicks behave as they do on the link itself. The
 * link remains the row's keyboard and screen-reader control.
 *
 * A row has at most one whole-row click action, so this plugin cannot be
 * combined with `hasRowClickExpansion`; doing so throws in development.
 *
 * ```tsx
 * const rowLink = useTableRowLink<Thread>({
 *   columnKey: 'title',
 *   getRowHref: thread => `/threads/${thread.id}`,
 * });
 * return <Table columns={columns} data={threads} plugins={{rowLink}} />;
 * ```
 */
export function useTableRowLink<T extends Record<string, unknown>>(
  config: UseTableRowLinkConfig<T>,
): TablePlugin<T> {
  const configRef = useLatest(config);
  const linkElements = useConstant(() => new WeakMap<T, HTMLElement>());

  // The wrapped columns must keep identity while the incoming columns do:
  // `Table` compares transformed columns element-wise, and a fresh wrapper
  // object per render would re-render every row on every render.
  const wrappedColumnsCacheRef = useRef<{
    columnKey: string;
    input: TableColumn<T>[];
    output: TableColumn<T>[];
  } | null>(null);

  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        const {columnKey} = configRef.current;
        const cache = wrappedColumnsCacheRef.current;
        if (
          cache?.columnKey === columnKey &&
          cache.input.length === columns.length &&
          cache.input.every((column, index) => column === columns[index])
        ) {
          return cache.output;
        }

        if (!columns.some(column => column.key === columnKey)) {
          const message = `useTableRowLink: no column has the key "${columnKey}".`;
          if (process.env.NODE_ENV !== 'production') {
            throw new Error(message);
          }
          console.error(message);
        }

        const output = columns.map(column => {
          if (column.key !== columnKey) {
            return column;
          }
          const renderCell = column.renderCell;
          return {
            ...column,
            renderCell: (item: T): ReactNode => {
              const content =
                renderCell == null
                  ? defaultCellRenderer(item, column.key)
                  : renderCell(item);
              const href = configRef.current.getRowHref(item);
              if (href == null) {
                return content;
              }
              return (
                <Link
                  href={href}
                  ref={element => {
                    if (element == null) {
                      return;
                    }
                    linkElements.set(item, element);
                    return () => {
                      if (linkElements.get(item) === element) {
                        linkElements.delete(item);
                      }
                    };
                  }}>
                  {content}
                </Link>
              );
            },
          };
        });
        wrappedColumnsCacheRef.current = {columnKey, input: columns, output};
        return output;
      },
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        if (configRef.current.getRowHref(item) == null) {
          return props;
        }

        const forward = (event: MouseEvent, type: SurfaceMouseEventType) => {
          forwardSurfaceEvent({
            allowAuxClick: true,
            control: linkElements.get(item) ?? null,
            event,
            type,
          });
        };
        return {
          ...props,
          className: cx(props.className, clickableRowClassName),
          ref: createRowClickRef(
            'row link (useTableRowLink)',
            () => ({
              onAuxClick: event => forward(event, 'auxclick'),
              onClick: event => forward(event, 'click'),
            }),
            props.ref,
          ),
        };
      },
    }),
    [configRef, linkElements],
  );
}
