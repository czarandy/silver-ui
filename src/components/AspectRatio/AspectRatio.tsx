import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {aspectRatioRecipe} from './AspectRatio.recipe';

/**
 * Maintains a fixed width-to-height ratio for media or embedded content.
 */
export interface AspectRatioProps {
  /**
   * Content positioned to fill the ratio box.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Width divided by height, such as `16 / 9`, `4 / 3`, or `1`.
   */
  ratio: number;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
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
  ref,
  ratio,
  style,
}: AspectRatioProps): React.JSX.Element {
  return (
    <div
      className={cx(aspectRatioRecipe(), className)}
      data-testid={dataTestId}
      ref={ref}
      style={{aspectRatio: ratio, ...style}}>
      <div className={styles.child}>{children}</div>
    </div>
  );
}

AspectRatio.displayName = 'AspectRatio';
