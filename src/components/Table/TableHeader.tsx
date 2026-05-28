import type {CSSProperties, ReactNode, Ref} from 'react';

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLTableSectionElement>;
  style?: CSSProperties;
}

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
