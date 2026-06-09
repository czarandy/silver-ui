import type {CSSProperties, ReactNode, Ref} from 'react';

export interface InputGroupTextProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}

export function InputGroupText({
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: InputGroupTextProps): React.JSX.Element {
  return (
    <div
      className={className}
      data-silver-input-group-text=""
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </div>
  );
}

InputGroupText.displayName = 'InputGroupText';
