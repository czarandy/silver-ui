import type {CSSProperties, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

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

const styles = {
  root: css({
    bg: 'skeleton',
    backgroundImage:
      'linear-gradient(90deg, token(colors.skeleton) 0%, token(colors.skeleton.shimmer) 50%, token(colors.skeleton) 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
    },
  }),
  radius: {
    none: css({borderRadius: 0}),
    0: css({borderRadius: 0}),
    1: css({borderRadius: 'xs'}),
    2: css({borderRadius: 'sm'}),
    3: css({borderRadius: 'md'}),
    4: css({borderRadius: 'lg'}),
    rounded: css({borderRadius: 'full'}),
  } satisfies Record<SkeletonRadius, string>,
} as const;

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
      className={cx(styles.root, styles.radius[radius], className)}
      data-testid={dataTestId}
      ref={ref}
      role="status"
      style={{
        width: formatSize(width),
        height: formatSize(height),
        animationDelay: `${delayTime + staggerTime * clampedIndex}ms`,
        ...style,
      }}
    />
  );
}

Skeleton.displayName = 'Skeleton';
