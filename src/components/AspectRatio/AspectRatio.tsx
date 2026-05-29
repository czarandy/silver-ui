import type {ComponentPropsWithRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {aspectRatioRecipe} from './AspectRatio.recipe';

/**
 * Maintains a fixed width-to-height ratio for media or embedded content.
 */
export interface AspectRatioProps extends ComponentPropsWithRef<'div'> {
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Width divided by height, such as `16 / 9`, `4 / 3`, or `1`.
   */
  ratio: number;
}

const styles = {
  child: css({
    position: 'absolute',
    inset: 0,
    w: '100%',
    h: '100%',
  }),
};

export function AspectRatio({
  children,
  className,
  'data-testid': dataTestId,
  ratio,
  ref,
  style,
  ...rest
}: AspectRatioProps): React.JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      console.warn(
        `AspectRatio: \`ratio\` must be a finite positive number, received ${String(ratio)}.`,
      );
    }
  }

  return (
    <div
      {...rest}
      className={cx(aspectRatioRecipe(), className)}
      data-testid={dataTestId}
      ref={ref}
      style={{...style, aspectRatio: ratio}}>
      <div className={styles.child}>{children}</div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
