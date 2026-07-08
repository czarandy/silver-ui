import type {CSSProperties, Ref} from 'react';
import {skeletonRecipe} from 'components/Skeleton/Skeleton.recipe';
import {cx} from 'utils/cx';

export type SkeletonRadius = 0 | 1 | 2 | 3 | 4 | 'none' | 'rounded';

export interface SkeletonProps {
  /**
   * Accessible label for the loading placeholder.
   * @default 'Loading'
   */
  'aria-label'?: string;
  /**
   * Additional CSS class names applied to the skeleton.
   */
  className?: string;
  /**
   * Test ID applied to the skeleton.
   */
  'data-testid'?: string;
  /**
   * Skeleton height. Numbers are treated as pixels.
   * @default '100%'
   */
  height?: number | string;
  /**
   * Border radius token.
   * @default 3
   */
  radius?: SkeletonRadius;
  /**
   * Ref forwarded to the skeleton element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Animation stagger index for lists of skeletons. Controls the delay
   * before the shimmer animation starts, creating a wave effect.
   * @default 0
   */
  staggerIndex?: number;
  /**
   * Inline styles applied to the skeleton.
   */
  style?: CSSProperties;
  /**
   * Skeleton width. Numbers are treated as pixels.
   * @default '100%'
   */
  width?: number | string;
}

const delayTime = 1000;
const staggerTime = 100;

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A pulsing placeholder used while content is loading.
 *
 * For containers with multiple skeletons, set `aria-busy="true"` on the
 * parent element so assistive technology knows to wait for content.
 */
export function Skeleton({
  'aria-label': ariaLabel = 'Loading',
  className,
  'data-testid': dataTestId,
  height = '100%',
  radius = 3,
  ref,
  staggerIndex = 0,
  style,
  width = '100%',
}: SkeletonProps): React.JSX.Element {
  const clampedIndex = Math.max(0, staggerIndex);

  return (
    <div
      aria-label={ariaLabel}
      className={cx(skeletonRecipe({radius}), className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={{
        ...style,
        width: formatSize(width),
        height: formatSize(height),
        animationDelay: `${delayTime + staggerTime * clampedIndex}ms`,
      }}
    />
  );
}

Skeleton.displayName = 'Skeleton';
