'use client';

import {useMemo, useRef, type ReactNode, type RefCallback} from 'react';
import {useTableContext} from 'components/Table/TableContext';
import {defaultCellRenderer} from 'components/Table/columnUtils';
import {markColumnWrapper} from 'components/Table/columnWrapperOrder';
import {renderDefaultCellContent} from 'components/Table/renderDefaultCellContent';
import {
  createRowClickRef,
  linkedRowClassName,
  registerRowClickPlugin,
  rowControlCellClassName,
} from 'components/Table/rowClick';
import type {
  BodyCellRenderProps,
  BodyRowRenderProps,
  TableColumn,
  TablePlugin,
} from 'components/Table/types';
import useConstant from 'hooks/useConstant';
import {ActionElement} from 'internal/ActionElement';
import {
  forwardSurfaceEvent,
  type SurfaceMouseEventType,
} from 'internal/forwardSurfaceEvent';
import useLatest from 'internal/useLatest';
import {cva} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface UseTableRowLinkConfig<T extends Record<string, unknown>> {
  /**
   * Key of the column whose cell content renders as each row's link. Choose a
   * column whose content contains no other links or controls and is never
   * empty, since the link takes its accessible name from it. Rows are not
   * clickable while the column is not shown (for example, hidden through
   * column settings), and a row whose value in a column without `renderCell`
   * is empty renders no link.
   */
  columnKey: string;
  /**
   * Destination for a row. Rows without one render no link and are not
   * clickable. Rows re-render whenever this function changes identity, so
   * define it outside the component or wrap it in `useCallback`.
   */
  getRowHref: (item: T) => string | null | undefined;
  /**
   * Keys of columns whose cells don't activate the row link, such as an actions
   * column. Buttons and links anywhere in a row already keep their own clicks;
   * this also covers the space around them.
   */
  ignoredColumnKeys?: ReadonlyArray<string>;
}

// The link carries no link styling: the row's pointer cursor and the table's
// `hasHover` fill already mark it as clickable.
const rowLinkRecipe = cva({
  base: {
    display: 'block',
    minWidth: 0,
    color: 'inherit',
    textDecoration: 'none',
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  },
  variants: {
    // The cell's own ellipsis does not reach text inside a block link.
    isTruncated: {
      true: {overflow: 'hidden', textOverflow: 'ellipsis'},
      false: {},
    },
  },
});

function RowLink({
  children,
  href,
  linkRef,
}: {
  children: ReactNode;
  href: string;
  linkRef: RefCallback<HTMLElement>;
}): ReactNode {
  const isTruncated = useTableContext()?.textOverflow === 'truncate';
  return (
    <ActionElement
      className={rowLinkRecipe({isTruncated})}
      data-table-row-link=""
      href={href}
      ref={linkRef}>
      {children}
    </ActionElement>
  );
}

function DefaultRowLinkContent<T extends Record<string, unknown>>({
  columnKey,
  item,
}: {
  columnKey: string;
  item: T;
}): ReactNode {
  const textOverflow = useTableContext()?.textOverflow ?? 'wrap';
  return renderDefaultCellContent(item, columnKey, textOverflow);
}

/**
 * Table plugin that makes whole rows navigate. Each linked row renders its
 * `columnKey` cell content as a link (honoring `LinkProvider`), and clicks on
 * the rest of the row are forwarded to that link, so router navigation,
 * modifier clicks, and middle clicks behave as they do on the link itself. The
 * link remains the row's keyboard and screen-reader control.
 *
 * A handler inside the row opts out of navigating by calling
 * `stopPropagation()` or `preventDefault()`. A forwarded click reaches the
 * table's ancestors twice: once as the original click and once from the link.
 *
 * A row has at most one whole-row click action, so this plugin cannot be
 * combined with `hasRowClickExpansion`; doing so throws in development.
 *
 * ```tsx
 * const getThreadHref = (thread: Thread) => `/threads/${thread.id}`;
 *
 * function Threads({threads}: {threads: Thread[]}) {
 *   const rowLink = useTableRowLink({columnKey: 'title', getRowHref: getThreadHref});
 *   return (
 *     <Table columns={columns} data={threads} hasHover plugins={{rowLink}} />
 *   );
 * }
 * ```
 */
export function useTableRowLink<T extends Record<string, unknown>>(
  config: UseTableRowLinkConfig<T>,
): TablePlugin<T> {
  const configRef = useLatest(config);
  const linkElements = useConstant(() => new WeakMap<T, HTMLElement>());
  // Joined so an inline array keeps the plugin stable while its keys don't
  // change.
  const ignoredColumnKeys = (config.ignoredColumnKeys ?? []).join('\n');

  // The wrapped columns must keep identity while their inputs do: `Table`
  // compares transformed columns element-wise, and a fresh wrapper object per
  // render would re-render every row on every render. A new `getRowHref` is a
  // new input, so rows pick up changed destinations.
  const wrappedColumnsCacheRef = useRef<{
    columnKey: string;
    getRowHref: UseTableRowLinkConfig<T>['getRowHref'];
    input: TableColumn<T>[];
    output: TableColumn<T>[];
  } | null>(null);

  return useMemo((): TablePlugin<T> => {
    const ignoredColumns = new Set(
      ignoredColumnKeys === '' ? [] : ignoredColumnKeys.split('\n'),
    );

    const createLinkRef =
      (item: T): RefCallback<HTMLElement> =>
      element => {
        if (element == null) {
          return;
        }
        linkElements.set(item, element);
        return () => {
          if (linkElements.get(item) === element) {
            linkElements.delete(item);
          }
        };
      };

    const plugin: TablePlugin<T> = {
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        const {columnKey, getRowHref} = configRef.current;
        const cache = wrappedColumnsCacheRef.current;
        if (
          cache?.columnKey === columnKey &&
          cache.getRowHref === getRowHref &&
          cache.input.length === columns.length &&
          cache.input.every((column, index) => column === columns[index])
        ) {
          return cache.output;
        }

        const output = columns.map(column => {
          if (column.key !== columnKey) {
            return column;
          }
          const renderCell = column.renderCell;
          return {
            ...column,
            renderCell: (item: T): ReactNode => {
              const href = getRowHref(item);
              if (renderCell != null) {
                const content = renderCell(item);
                return href == null ? (
                  content
                ) : (
                  <RowLink href={href} linkRef={createLinkRef(item)}>
                    {content}
                  </RowLink>
                );
              }

              const content = (
                <DefaultRowLinkContent columnKey={column.key} item={item} />
              );
              // An empty value would make a link with no accessible name.
              return href == null ||
                defaultCellRenderer(item, column.key) === '' ? (
                content
              ) : (
                <RowLink href={href} linkRef={createLinkRef(item)}>
                  {content}
                </RowLink>
              );
            },
          };
        });
        wrappedColumnsCacheRef.current = {
          columnKey,
          getRowHref,
          input: columns,
          output,
        };
        return output;
      },
      transformBodyCell(
        props: BodyCellRenderProps,
        column: TableColumn<T>,
      ): BodyCellRenderProps {
        if (!ignoredColumns.has(column.key)) {
          return props;
        }

        return {
          ...props,
          className: cx(props.className, rowControlCellClassName),
        };
      },
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        if (configRef.current.getRowHref(item) == null) {
          return props;
        }

        const forward = (
          event: MouseEvent,
          row: HTMLTableRowElement,
          type: SurfaceMouseEventType,
        ) => {
          forwardSurfaceEvent({
            allowAuxClick: true,
            control: linkElements.get(item) ?? null,
            event,
            surface: row,
            type,
          });
        };
        return {
          ...props,
          className: cx(props.className, linkedRowClassName),
          ref: createRowClickRef(
            'row link (useTableRowLink)',
            () => ({
              onAuxClick: (event, row) => forward(event, row, 'auxclick'),
              onClick: (event, row) => forward(event, row, 'click'),
            }),
            props.ref,
          ),
        };
      },
    };
    markColumnWrapper(plugin, 'rowLink');
    return registerRowClickPlugin(plugin, 'row link (useTableRowLink)');
  }, [configRef, ignoredColumnKeys, linkElements]);
}
