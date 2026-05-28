import {Menu} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Button} from '../Button';
import {Icon} from '../Icon';

export interface MobileNavToggleProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  label?: string;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
}

export function MobileNavToggle({
  children,
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
      icon={children ?? <Icon icon={Menu} />}
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
