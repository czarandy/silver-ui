import type {CSSProperties, ReactNode, Ref} from 'react';

export interface TableFooterProps {
  /**
   * Footer row elements rendered inside the tfoot.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tfoot.
   */
  className?: string;
  /**
   * Test ID applied to the tfoot.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the tfoot element.
   */
  ref?: Ref<HTMLTableSectionElement>;
  /**
   * Inline styles applied to the tfoot.
   */
  style?: CSSProperties;
}

/**
 * Wraps table footer rows in a `<tfoot>` element.
 */
export function TableFooter({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableFooterProps): React.JSX.Element {
  return (
    <tfoot
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </tfoot>
  );
}

TableFooter.displayName = 'TableFooter';
