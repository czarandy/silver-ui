import type {CSSProperties, ReactNode, Ref} from 'react';

export interface TableBodyProps {
  /**
   * Table row elements rendered inside the body.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tbody.
   */
  className?: string;
  /**
   * Test ID applied to the tbody.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the tbody element.
   */
  ref?: Ref<HTMLTableSectionElement>;
  /**
   * Inline styles applied to the tbody.
   */
  style?: CSSProperties;
}

/**
 * Wraps table body rows in a `<tbody>` element.
 */
export function TableBody({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableBodyProps): React.JSX.Element {
  return (
    <tbody
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </tbody>
  );
}

TableBody.displayName = 'TableBody';
