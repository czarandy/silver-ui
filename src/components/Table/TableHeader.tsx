import type {CSSProperties, ReactNode, Ref} from 'react';

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
 * Wraps table header rows in a `<thead>` element.
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
      {children}
    </thead>
  );
}

TableHeader.displayName = 'TableHeader';
