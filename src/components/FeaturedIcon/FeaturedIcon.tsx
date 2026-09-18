import type {CSSProperties, HTMLAttributes, Ref} from 'react';
import {featuredIconRecipe} from 'components/FeaturedIcon/FeaturedIcon.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import {cx} from 'utils/cx';

export type FeaturedIconColor =
  | 'accent'
  | 'blue'
  | 'cyan'
  | 'error'
  | 'gray'
  | 'green'
  | 'info'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'success'
  | 'teal'
  | 'warning'
  | 'yellow';

export type FeaturedIconSize = 'sm' | 'md' | 'lg';

export interface FeaturedIconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'color'
> {
  /**
   * Accessible label. When omitted the icon is treated as decorative and
   * hidden from assistive technology.
   */
  'aria-label'?: string;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Color of the tinted background and icon.
   * @default 'accent'
   */
  color?: FeaturedIconColor;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Lucide icon component to render.
   */
  icon: IconComponent;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Size of the circle; the icon scales with it.
   * @default 'md'
   */
  size?: FeaturedIconSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * An icon inside a tinted circle, used to headline empty, success, and error
 * states, dialogs, and feature callouts.
 */
export function FeaturedIcon({
  'aria-label': ariaLabel,
  className,
  color = 'accent',
  'data-testid': dataTestId,
  icon,
  ref,
  size = 'md',
  style,
  ...htmlProps
}: FeaturedIconProps): React.JSX.Element {
  const isDecorative = ariaLabel == null;

  return (
    <span
      {...htmlProps}
      aria-hidden={isDecorative ? true : undefined}
      aria-label={ariaLabel}
      className={cx(featuredIconRecipe({color, size}), className)}
      data-testid={dataTestId}
      ref={ref}
      role={isDecorative ? undefined : 'img'}
      style={style}>
      <Icon icon={icon} size={size} />
    </span>
  );
}

FeaturedIcon.displayName = 'FeaturedIcon';
