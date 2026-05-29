import {Menu} from 'lucide-react';
import type {CSSProperties, Ref} from 'react';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Button} from '../Button';

export interface MobileNavToggleProps {
  className?: string;
  'data-testid'?: string;
  label?: string;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
}

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
      data-testid={dataTestId ?? 'mobile-nav-toggle'}
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
