import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export type BadgeVariant =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

export interface BadgeProps {
  /**
   * Additional CSS class names applied to the badge.
   */
  className?: string;
  /**
   * Test ID applied to the badge.
   */
  'data-testid'?: string;
  /**
   * Optional icon rendered before the label.
   */
  icon?: ReactNode;
  /**
   * Badge text or count.
   */
  label: ReactNode;
  /**
   * Ref forwarded to the badge element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the badge.
   */
  style?: CSSProperties;
  /**
   * Visual style.
   * @default 'neutral'
   */
  variant?: BadgeVariant;
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
    h: '5',
    px: '2',
    borderRadius: 'full',
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'none',
    fontWeight: 'medium',
    whiteSpace: 'nowrap',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  variant: {
    neutral: css({bg: 'silver-neutral.100', color: 'fg'}),
    info: css({bg: 'primary', color: 'white'}),
    success: css({bg: 'green.600', color: 'white'}),
    warning: css({bg: 'yellow.400', color: 'yellow.950'}),
    error: css({bg: 'red.600', color: 'white'}),
    blue: css({bg: 'blue.100', color: 'blue.800'}),
    cyan: css({bg: 'cyan.100', color: 'cyan.800'}),
    green: css({bg: 'green.100', color: 'green.800'}),
    orange: css({bg: 'orange.100', color: 'orange.800'}),
    pink: css({bg: 'pink.100', color: 'pink.800'}),
    purple: css({bg: 'purple.100', color: 'purple.800'}),
    red: css({bg: 'red.100', color: 'red.800'}),
    teal: css({bg: 'teal.100', color: 'teal.800'}),
    yellow: css({bg: 'yellow.100', color: 'yellow.800'}),
  } satisfies Record<BadgeVariant, string>,
} as const;

/**
 * A compact status label, category marker, or count.
 */
export function Badge({
  className,
  'data-testid': dataTestId,
  icon,
  label,
  ref,
  style,
  variant = 'neutral',
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cx(styles.root, styles.variant[variant], className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon}
      {label}
    </span>
  );
}

Badge.displayName = 'Badge';
