import {ChevronDown} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {Button, type ButtonProps, type ButtonSize} from 'components/Button';
import {ButtonGroup} from 'components/ButtonGroup';
import {DropdownMenu, type DropdownMenuOption} from 'components/DropdownMenu';
import type {IconComponent} from 'components/Icon';

/**
 * A directly-clickable primary action paired with an attached chevron toggle
 * that opens a menu of related actions. A thin composition of `ButtonGroup`,
 * `Button`, and `DropdownMenu`.
 */
export interface SplitButtonProps extends Pick<
  ButtonProps,
  'endContent' | 'isLoading' | 'onClick' | 'startContent'
> {
  /**
   * Compound menu content (`<DropdownMenuItem>`), an alternative to `items`.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the primary action button.
   */
  'data-testid'?: string;
  /**
   * Whether to auto-focus the first menu item on open.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Icon rendered before the primary action's label.
   */
  icon?: IconComponent;
  /**
   * Whether both the primary action and the menu toggle are disabled.
   */
  isDisabled?: boolean;
  /**
   * Controlled open state of the menu.
   */
  isMenuOpen?: boolean;
  /**
   * Data-driven menu items (alternative to `children`).
   */
  items?: ReadonlyArray<DropdownMenuOption>;
  /**
   * Visible text for the primary action. Also used as the group's accessible
   * label.
   */
  label: string;
  /**
   * Accessible label for the chevron toggle that opens the menu.
   * @default 'More actions'
   */
  menuLabel?: string;
  /**
   * Width of the menu surface.
   */
  menuWidth?: number | string;
  /**
   * Called when the menu open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the primary action button.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Default size for both buttons.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Visual style variant shared by both buttons.
   * @default 'secondary'
   */
  variant?: ButtonProps['variant'];
}

/**
 * A directly-clickable primary action paired with an attached chevron toggle
 * that opens a menu of related actions.
 */
export function SplitButton({
  children,
  className,
  'data-testid': dataTestId,
  endContent,
  hasAutoFocus,
  icon,
  isDisabled = false,
  isLoading,
  isMenuOpen,
  items,
  label,
  menuLabel = 'More actions',
  menuWidth,
  onClick,
  onOpenChange,
  ref,
  size = 'md',
  startContent,
  style,
  variant = 'secondary',
}: SplitButtonProps): React.JSX.Element {
  return (
    <ButtonGroup
      className={className}
      isDisabled={isDisabled}
      label={label}
      size={size}
      style={style}>
      <Button
        data-testid={dataTestId}
        endContent={endContent}
        icon={icon}
        isLoading={isLoading}
        label={label}
        onClick={onClick}
        ref={ref}
        startContent={startContent}
        variant={variant}
      />
      <DropdownMenu
        button={{
          icon: ChevronDown,
          isIconOnly: true,
          label: menuLabel,
          variant,
        }}
        hasAutoFocus={hasAutoFocus}
        hasChevron={false}
        isMenuOpen={isMenuOpen}
        items={items}
        menuWidth={menuWidth}
        onOpenChange={onOpenChange}>
        {children}
      </DropdownMenu>
    </ButtonGroup>
  );
}

SplitButton.displayName = 'SplitButton';
