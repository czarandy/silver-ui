import type {Ref} from 'react';
import {
  Stack,
  type StackCrossAlignment,
  type StackMainAlignment,
  type StackProps,
} from 'components/Stack/internal/Stack';

export interface VStackProps extends Omit<
  StackProps,
  'direction' | 'hAlign' | 'vAlign'
> {
  align?: StackCrossAlignment;
  hAlign?: StackCrossAlignment;
  justify?: StackMainAlignment;
  ref?: Ref<HTMLElement>;
  vAlign?: StackMainAlignment;
}

/**
 * A vertical flex container that lays out children in a column with a
 * consistent gap.
 */
export function VStack({
  align,
  className,
  'data-testid': dataTestId,
  hAlign,
  justify,
  ref,
  style,
  vAlign,
  ...props
}: VStackProps): React.JSX.Element {
  return (
    <Stack
      {...props}
      className={className}
      data-testid={dataTestId}
      direction="vertical"
      hAlign={hAlign ?? align}
      ref={ref}
      style={style}
      vAlign={vAlign ?? justify}
    />
  );
}

VStack.displayName = 'VStack';
