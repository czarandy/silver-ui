'use client';

import {useMemo, useRef, type ReactNode, type RefCallback} from 'react';
import {useTableContext} from 'components/Table/TableContext';
import {renderDefaultCellContent} from 'components/Table/renderDefaultCellContent';
import {
  clickableRowClassName,
  createRowClickRef,
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
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface UseTableRowLinkConfig<T extends Record<string, unknown>> {
  /**
   * Key of the column whose cell content renders as each row's link. Choose a
   * column whose content contains no other links or controls. While the column
   * is not shown (for example, hidden through column settings), rows are not
   * clickable.
   */
  columnKey: string;
  /**
   * Destination for a row. Rows without one render no link and are not
   * clickable. Rows re-render when this function changes identity, so define it
   * outside the component or wrap it in `useCallback` when the table's
   * `plugins` are memoized.
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
const linkClassName = css({
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
  return (
    <ActionElement className={linkClassName} href={href} ref={linkRef}>
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
 * Register it under the `rowLink` key so it runs before the table's other
 * plugins. A row has at most one whole-row click action, so this plugin cannot
 * be combined with `hasRowClickExpansion`; doing so throws in development.
 *
 * ```tsx
 * const rowLink = useTableRowLink<Thread>({
 *   columnKey: 'title',
 *   getRowHref: thread => `/threads/${thread.id}`,
 * });
 * return (
 *   <Table columns={columns} data={threads} hasHover plugins={{rowLink}} />
 * );
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
    hasLinkColumn: boolean;
    input: TableColumn<T>[];
    output: TableColumn<T>[];
  } | null>(null);

  return useMemo((): TablePlugin<T> => {
    const ignoredColumns = new Set(
      ignoredColumnKeys === '' ? [] : ignoredColumnKeys.split('\n'),
    );
    const hasLinkColumn = (): boolean =>
      wrappedColumnsCacheRef.current?.hasLinkColumn === true;

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
              const content =
                renderCell == null ? (
                  <DefaultRowLinkContent columnKey={column.key} item={item} />
                ) : (
                  renderCell(item)
                );
              const href = getRowHref(item);
              return href == null ? (
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
          hasLinkColumn: columns.some(column => column.key === columnKey),
          input: columns,
          output,
        };
        return output;
      },
      transformBodyCell(
        props: BodyCellRenderProps,
        column: TableColumn<T>,
      ): BodyCellRenderProps {
        if (!ignoredColumns.has(column.key) || !hasLinkColumn()) {
          return props;
        }

        return {
          ...props,
          className: cx(props.className, rowControlCellClassName),
        };
      },
      transformBodyRow(props: BodyRowRenderProps, item: T): BodyRowRenderProps {
        if (!hasLinkColumn() || configRef.current.getRowHref(item) == null) {
          return props;
        }

        const forward = (event: MouseEvent, type: SurfaceMouseEventType) => {
          forwardSurfaceEvent({
            allowAuxClick: true,
            control: linkElements.get(item) ?? null,
            event,
            shouldStopPropagation: false,
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
    };
    return registerRowClickPlugin(plugin, 'row link (useTableRowLink)');
  }, [configRef, ignoredColumnKeys, linkElements]);
}
