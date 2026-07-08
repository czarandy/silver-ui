import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
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

const styles = {
  base: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    bg: 'primary',
    color: 'fg.onPrimary',
    flexShrink: 0,
    w: 'component.sm',
    h: 'component.sm',
  }),
};

/**
 * Circular icon container for navigation headers.
 * Wraps an icon with a circular accent-colored background.
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
      className={cx(styles.base, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {icon}
    </span>
  );
}

NavIcon.displayName = 'NavIcon';
