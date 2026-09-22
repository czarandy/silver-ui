import type {CSSProperties, ReactNode, Ref} from 'react';
import type {BadgeColor} from 'components/Badge/Badge';
import {statusDotRecipe} from 'components/StatusDot/StatusDot.recipe';
import type {StatusDotSize} from 'components/StatusDot/StatusDot.types';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

/**
 * Compact, unlabelled presence indicator. For a labelled status chip, use
 * Badge instead.
 */
export interface StatusDotProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Visual color. Accepts the same colors as Badge.
   * @default 'success'
   */
  color?: BadgeColor;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Renders a background-colored ring around the dot so it punches out of
   * the element behind it, as when overlapping an Avatar. Default is
   * `false`.
   */
  hasRing?: boolean;
  /**
   * Optional icon rendered inside `md` and `lg` dots.
   */
  icon?: ReactNode;
  /**
   * Accessible label describing the status, such as "Online".
   */
  label: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Visual size of the dot: `sm` is 10px with no icon, `md` is 20px, and
   * `lg` is 32px. Default is `md`.
   */
  size?: StatusDotSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Standalone status indicator dot for presence and connection states.
 */
export function StatusDot({
  className,
  color = 'success',
  'data-testid': dataTestId,
  hasRing = false,
  icon,
  label,
  ref,
  size = 'md',
  style,
}: StatusDotProps): React.JSX.Element {
  const classes = statusDotRecipe({hasRing, size, color});
  const isIconVisible = size !== 'sm';
  const hasVisibleIcon = isNonEmptyReactNode(icon) && isIconVisible;

  if (process.env.NODE_ENV !== 'production') {
    if (isNonEmptyReactNode(icon) && !isIconVisible) {
      console.warn(
        'StatusDot: `icon` is not visible at size `sm`. Use size `md` or ' +
          '`lg`, or remove the `icon` prop.',
      );
    }
  }

  return (
    <div
      aria-label={label}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      role="img"
      style={style}>
      {hasVisibleIcon ? (
        <span aria-hidden="true" className={classes.icon}>
          {icon}
        </span>
      ) : null}
    </div>
  );
}

StatusDot.displayName = 'StatusDot';
