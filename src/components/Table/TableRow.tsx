'use client';

import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  Ref,
} from 'react';
import {tableRecipe} from 'components/Table/Table.recipe';
import {useTableContext} from 'components/Table/TableContext';
import {
  createTableRowLinkRegistry,
  TableRowLinkContext,
} from 'components/Table/TableRowLinkContext';
import useConstant from 'hooks/useConstant';
import useMergeRefs from 'hooks/useMergeRefs';
import {useTableSection} from 'internal/TableSectionContext';
import {forwardSurfaceEvent} from 'internal/forwardSurfaceEvent';
import {cx} from 'utils/cx';

export interface TableRowProps {
  /**
   * Cell elements rendered inside the row.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tr.
   */
  className?: string;
  /**
   * Test ID applied to the tr.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the tr element.
   */
  ref?: Ref<HTMLTableRowElement>;
  /**
   * Inline styles applied to the tr.
   */
  style?: CSSProperties;
}

/**
 * Table row with hover and striped styling from context. Header and footer
 * rows are not interactive, so they render without that styling even when the
 * surrounding table enables it.
 *
 * A body row that contains a `TableRowLink` becomes clickable: clicks on the
 * row surface are forwarded to that link.
 */
export function TableRow({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableRowProps): React.JSX.Element {
  const context = useTableContext();
  const isBodyRow = useTableSection() === 'body';
  const rowLinks = useConstant(createTableRowLinkRegistry);
  const mergedRef = useMergeRefs(ref, rowLinks.rowRef);
  const classes = tableRecipe({
    isStriped: isBodyRow && context?.isStriped,
    hasHover: isBodyRow && context?.hasHover,
  });

  if (!isBodyRow) {
    return (
      <tr
        className={cx(classes.row, className)}
        data-part="row"
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {children}
      </tr>
    );
  }

  const handleSurfaceEvent = (
    event: ReactMouseEvent<HTMLTableRowElement>,
    type: 'auxclick' | 'click',
  ) => {
    forwardSurfaceEvent({
      allowAuxClick: true,
      control: rowLinks.getLink(),
      event,
      type,
    });
  };

  return (
    <tr
      className={cx(classes.row, className)}
      data-part="row"
      data-testid={dataTestId}
      onAuxClick={event => handleSurfaceEvent(event, 'auxclick')}
      onClick={event => handleSurfaceEvent(event, 'click')}
      ref={mergedRef}
      style={style}>
      <TableRowLinkContext value={rowLinks}>{children}</TableRowLinkContext>
    </tr>
  );
}

TableRow.displayName = 'TableRow';
