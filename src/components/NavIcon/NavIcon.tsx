import type {CSSProperties, ReactNode, Ref} from 'react';
import {featuredIconRecipe} from 'components/FeaturedIcon/FeaturedIcon.recipe';
import {cx} from 'utils/cx';

export interface NavIconProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * The icon element to render inside the circular background.
   */
  icon: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

/**
 * Circular icon container for navigation headers.
 * The solid primary, `sm` treatment of FeaturedIcon.
 */
export function NavIcon({
  className,
  'data-testid': dataTestId,
  icon,
  ref,
  style,
}: NavIconProps): React.JSX.Element {
  return (
    <span
      className={cx(
        featuredIconRecipe({size: 'sm', variant: 'solid'}),
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon}
    </span>
  );
}

NavIcon.displayName = 'NavIcon';
