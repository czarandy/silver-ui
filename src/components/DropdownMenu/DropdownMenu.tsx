/* eslint-disable @eslint-react/no-array-index-key, @typescript-eslint/no-base-to-string */
import {ChevronDown} from 'lucide-react';
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {Button, type ButtonProps, type ButtonSize} from '../Button';
import {Divider} from '../Divider';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {Text} from '../Text';
import {DropdownMenuContext} from './DropdownMenuContext';
import {DropdownMenuItem} from './DropdownMenuItem';

export interface DropdownMenuItemData {
  description?: ReactNode;
  icon?: ReactNode;
  isDisabled?: boolean;
  label: ReactNode;
  onClick?: () => void;
}

export interface DropdownMenuDivider {
  type: 'divider';
}

export interface DropdownMenuSection {
  items: ReadonlyArray<DropdownMenuItemData>;
  title?: string;
  type: 'section';
}

export type DropdownMenuOption =
  | DropdownMenuDivider
  | DropdownMenuItemData
  | DropdownMenuSection;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type DropdownMenuButtonProps = DistributiveOmit<ButtonProps, 'onClick'>;

export interface DropdownMenuProps {
  /**
   * Trigger button props.
   */
  button?: DropdownMenuButtonProps;
  /**
   * Compound menu children. Used when items is omitted.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the menu surface.
   */
  className?: string;
  /**
   * Test ID applied to the trigger button.
   */
  'data-testid'?: string;
  /**
   * Whether to autofocus menu content after opening.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to render a chevron in the trigger.
   * @default true
   */
  hasChevron?: boolean;
  /**
   * Controlled open state.
   */
  isMenuOpen?: boolean;
  /**
   * Data-driven menu items.
   */
  items?: ReadonlyArray<DropdownMenuOption>;
  /**
   * Menu surface width.
   */
  menuWidth?: number | string;
  /**
   * Called when the trigger is clicked.
   */
  onClick?: () => void;
  /**
   * Called when the menu open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the trigger button.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the menu surface.
   */
  style?: CSSProperties;
}

const styles = {
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    overflowY: 'auto',
    p: '1',
  }),
  section: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
  heading: css({
    px: '2',
    py: '1',
    userSelect: 'none',
  }),
  divider: css({
    my: '1',
  }),
} as const;

function formatWidth(value: number | string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

function renderItems(items: ReadonlyArray<DropdownMenuOption>): ReactNode {
  return items.map((item, index) => {
    if ('type' in item && item.type === 'divider') {
      return <Divider className={styles.divider} key={`divider-${index}`} />;
    }

    if ('type' in item) {
      return (
        <div
          aria-label={item.title}
          className={styles.section}
          key={`section-${item.title ?? index}`}
          role="group">
          {item.title != null ? (
            <Text
              as="span"
              className={styles.heading}
              color="secondary"
              type="supporting">
              {item.title}
            </Text>
          ) : null}
          {item.items.map(sectionItem => (
            <DropdownMenuItem
              description={sectionItem.description}
              icon={sectionItem.icon}
              isDisabled={sectionItem.isDisabled}
              key={String(sectionItem.label)}
              label={sectionItem.label}
              onClick={sectionItem.onClick}
            />
          ))}
        </div>
      );
    }

    return (
      <DropdownMenuItem
        description={item.description}
        icon={item.icon}
        isDisabled={item.isDisabled}
        key={String(item.label)}
        label={item.label}
        onClick={item.onClick}
      />
    );
  });
}

const defaultButton = {label: 'Menu'} satisfies DropdownMenuButtonProps;

/**
 * Button-triggered menu for grouped actions.
 */
export function DropdownMenu({
  button = defaultButton,
  children,
  className,
  'data-testid': dataTestId,
  hasChevron = true,
  hasAutoFocus = true,
  isMenuOpen,
  items,
  menuWidth,
  onClick,
  onOpenChange,
  ref,
  style,
}: DropdownMenuProps): React.JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isMenuOpen !== undefined;
  const isOpen = isControlled ? isMenuOpen : internalOpen;
  const menuSize: ButtonSize = button.size ?? 'md';
  const contextValue = useMemo(
    () => ({
      closeMenu: () => {
        if (isControlled) {
          onOpenChange?.(false);
        } else {
          setInternalOpen(false);
        }
      },
      menuSize,
    }),
    [isControlled, menuSize, onOpenChange],
  );
  const menuContent = items == null ? children : renderItems(items);

  return (
    <Popover
      className={className}
      content={
        <DropdownMenuContext value={contextValue}>
          <div className={styles.menu} role="menu">
            {menuContent}
          </div>
        </DropdownMenuContext>
      }
      hasAutoFocus={hasAutoFocus}
      hasCloseButton={false}
      isOpen={isOpen}
      onOpenChange={nextOpen => {
        if (isControlled) {
          onOpenChange?.(nextOpen);
        } else {
          setInternalOpen(nextOpen);
        }
      }}
      style={{width: formatWidth(menuWidth), ...style}}>
      <Button
        {...button}
        data-testid={dataTestId}
        endContent={
          button.endContent ??
          (hasChevron && !button.isIconOnly ? (
            <Icon icon={ChevronDown} size="sm" />
          ) : undefined)
        }
        onClick={onClick}
        ref={ref}
        tooltip={isOpen ? undefined : button.tooltip}
      />
    </Popover>
  );
}

DropdownMenu.displayName = 'DropdownMenu';
