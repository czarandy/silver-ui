import type {ComponentPropsWithRef} from 'react';
import {aspectRatioRecipe} from 'components/AspectRatio/AspectRatio.recipe';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

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

const rootClass = aspectRatioRecipe();

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
  const isValidRatio = Number.isFinite(ratio) && ratio > 0;

  if (process.env.NODE_ENV !== 'production') {
    if (!isValidRatio) {
      throw new Error(
        `AspectRatio: \`ratio\` must be a finite positive number, received ${String(ratio)}.`,
      );
    }
  }

  const resolvedRatio = isValidRatio ? ratio : 1;

  return (
    <div
      {...rest}
      className={cx(rootClass, className)}
      data-testid={dataTestId}
      ref={ref}
      style={{...style, aspectRatio: resolvedRatio}}>
      <div className={styles.child}>{children}</div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
