import type {CSSProperties, ReactNode, Ref} from 'react';

export interface TableBodyProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLTableSectionElement>;
  style?: CSSProperties;
}

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
