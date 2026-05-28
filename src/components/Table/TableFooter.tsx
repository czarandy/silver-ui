import type {CSSProperties, ReactNode, Ref} from 'react';

export interface TableFooterProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLTableSectionElement>;
  style?: CSSProperties;
}

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
