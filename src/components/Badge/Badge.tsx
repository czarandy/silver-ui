import type {CSSProperties, Ref} from 'react';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {badgeRecipe} from './Badge.recipe';

export type BadgeSize = 'sm' | 'md' | 'lg';

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
   * ARIA role for the badge element.
   */
  role?: string;
  /**
   * Badge size.
   * @default 'md'
   */
  size?: BadgeSize;
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
  variant = 'neutral',
}: BadgeProps): React.JSX.Element {
  return (
    <span
      aria-label={ariaLabel}
      className={cx(badgeRecipe({size, variant}), className)}
      data-testid={dataTestId}
      ref={ref}
      role={role}
      style={style}>
      {icon != null ? (
        <Icon aria-hidden="true" color="inherit" icon={icon} size={size} />
      ) : null}
      {label}
    </span>
  );
}

Badge.displayName = 'Badge';
