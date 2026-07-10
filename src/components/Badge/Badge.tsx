import type {CSSProperties, Ref} from 'react';
import {badgeRecipe} from 'components/Badge/Badge.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import type {ColorName} from 'internal/colorNames';
import {cx} from 'utils/cx';

export type BadgeSize = 'sm' | 'md' | 'lg';

export type BadgeStatusColor =
  'neutral' | 'info' | 'success' | 'warning' | 'error';

export type BadgeColor = ColorName | BadgeStatusColor;

/**
 * A compact status label, category marker, or count.
 */
export interface BadgeProps {
  /**
   * Accessible label for the badge.
   */
  'aria-label'?: string;
  /**
   * Additional CSS class names applied to the badge.
   */
  className?: string;
  /**
   * Visual color.
   * @default 'neutral'
   */
  color?: BadgeColor;
  /**
   * Test ID applied to the badge.
   */
  'data-testid'?: string;
  /**
   * Optional icon rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Badge text or count.
   */
  label: string | number;
  /**
   * Ref forwarded to the badge element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * ARIA role for the badge element. Common choices:
   *
   * - `'status'` — a live region whose content is advisory (e.g. "3 new").
   * - `'alert'` — an urgent, time-sensitive message (e.g. error counts).
   * - `'log'` — appended information such as chat counts or activity feeds.
   *
   * Any valid ARIA role string is accepted.
   */
  role?: 'status' | 'alert' | 'log' | (string & {});
  /**
   * Badge size.
   * @default 'md'
   */
  size?: BadgeSize;
  /**
   * Inline styles applied to the badge.
   */
  style?: CSSProperties;
}

/**
 * A compact status label, category marker, or count.
 */
export function Badge({
  'aria-label': ariaLabel,
  className,
  'data-testid': dataTestId,
  icon,
  label,
  ref,
  role,
  size = 'md',
  style,
  color = 'neutral',
}: BadgeProps): React.JSX.Element {
  const classes = badgeRecipe({size, color});
  return (
    <span
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={style}>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
      ) : null}
      <span className={classes.label}>{label}</span>
    </span>
  );
}

Badge.displayName = 'Badge';
