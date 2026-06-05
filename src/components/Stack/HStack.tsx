import type {Ref} from 'react';
import {
  Stack,
  type StackCrossAlignment,
  type StackMainAlignment,
  type StackProps,
} from './internal/Stack';

export interface HStackProps extends Omit<
  StackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  align?: StackCrossAlignment;
  hAlign?: StackMainAlignment;
  justify?: StackMainAlignment;
  ref?: Ref<HTMLElement>;
  vAlign?: StackCrossAlignment;
}

export function HStack({
  align,
  className,
  'data-testid': dataTestId,
  hAlign,
  justify,
  ref,
  style,
  vAlign,
  ...props
}: HStackProps): React.JSX.Element {
  return (
    <Stack
      {...props}
      className={className}
      data-testid={dataTestId}
      direction="horizontal"
      hAlign={hAlign ?? justify}
      ref={ref}
      style={style}
      vAlign={vAlign ?? align}
    />
  );
}

HStack.displayName = 'HStack';
