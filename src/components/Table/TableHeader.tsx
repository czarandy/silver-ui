import type {CSSProperties, ReactNode, Ref} from 'react';
import {TableSectionProvider} from 'internal/TableSectionContext';

export interface TableHeaderProps {
  /**
   * Header row elements rendered inside the thead.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the thead.
   */
  className?: string;
  /**
   * Test ID applied to the thead.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the thead element.
   */
  ref?: Ref<HTMLTableSectionElement>;
  /**
   * Inline styles applied to the thead.
   */
  style?: CSSProperties;
}

/**
 * Wraps table header rows in a `<thead>` element. Rows rendered inside opt out
 * of the table's hover and striping styling.
 */
export function TableHeader({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableHeaderProps): React.JSX.Element {
  return (
    <thead
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <TableSectionProvider section="header">{children}</TableSectionProvider>
    </thead>
  );
}

TableHeader.displayName = 'TableHeader';
