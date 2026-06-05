import {Menu} from 'lucide-react';
import type {CSSProperties, Ref} from 'react';
import {useAppShellMobile} from '../../components/AppShell/AppShellMobileContext';
import {Button} from '../../components/Button';

/**
 * Props for {@link MobileNavToggle}.
 */
export interface MobileNavToggleProps {
  /**
   * Additional CSS class names applied to the toggle button.
   */
  className?: string;
  /**
   * Test ID applied to the toggle button.
   */
  'data-testid'?: string;
  /**
   * Accessible label for the toggle button.
   * @default 'Open navigation'
   */
  label?: string;
  /**
   * Ref forwarded to the toggle button.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the toggle button.
   */
  style?: CSSProperties;
}

/**
 * Hamburger-style button that toggles the mobile navigation drawer.
 * Renders nothing when the viewport is above the mobile breakpoint or
 * mobile navigation is disabled.
 */
export function MobileNavToggle({
  className,
  'data-testid': dataTestId,
  label = 'Open navigation',
  ref,
  style,
}: MobileNavToggleProps): React.JSX.Element | null {
  const {isMobile, isMobileNavEnabled, toggleMobileNav} = useAppShellMobile();

  if (!isMobile || !isMobileNavEnabled) {
    return null;
  }

  return (
    <Button
      className={className}
      data-testid={dataTestId}
      icon={Menu}
      isIconOnly
      label={label}
      onClick={toggleMobileNav}
      ref={ref}
      style={style}
      variant="ghost"
    />
  );
}

MobileNavToggle.displayName = 'MobileNavToggle';
