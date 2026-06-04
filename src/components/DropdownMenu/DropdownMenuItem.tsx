import type {CSSProperties, ReactNode, Ref} from 'react';
import {css, cva} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {Item} from '../Item';
import {useDropdownMenuContext} from './DropdownMenuContext';

export interface DropdownMenuItemProps {
  /**
   * Additional CSS class names applied to the item.
   */
  className?: string;
  /**
   * Test ID applied to the item.
   */
  'data-testid'?: string;
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
  /**
   * Trailing content.
   */
  endContent?: ReactNode;
  /**
   * Icon rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Item label.
   */
  label: string;
  /**
   * Called when the item is selected.
   */
  onClick?: () => void;
  /**
   * Ref forwarded to the item button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Inline styles applied to the item.
   */
  style?: CSSProperties;
}

const menuItemRecipe = cva({
  base: {
    display: 'block',
    w: 'full',
    borderRadius: 'md',
    color: 'fg',
    cursor: 'pointer',
    fontFamily: 'body',
    textAlign: 'start',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffsetTight',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  variants: {
    size: {
      sm: {
        minH: 'component.sm',
        '& > *': {py: '0.5', px: '1.5', gap: '1.5'},
      },
      md: {
        minH: 'component.md',
        '& > *': {py: '1.5', px: '2'},
      },
      lg: {
        minH: 'component.lg',
        '& > *': {py: '2.5', px: '2.5', gap: '2.5'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const styles = {
  icon: css({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'fg.muted',
  }),
} as const;

/**
 * Action item inside a `DropdownMenu`.
 */
export function DropdownMenuItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  icon,
  isDisabled = false,
  label,
  onClick,
  ref,
  style,
}: DropdownMenuItemProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const menuSize = context?.menuSize ?? 'md';

  return (
    <button
      className={cx(menuItemRecipe({size: menuSize}), className)}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={() => {
        onClick?.();
        context?.closeMenu();
      }}
      ref={ref}
      role="menuitem"
      style={style}
      type="button">
      <Item
        as="span"
        description={description}
        endContent={endContent}
        label={label}
        startContent={
          icon != null ? (
            <span className={styles.icon}>
              <Icon color="secondary" icon={icon} size="sm" />
            </span>
          ) : null
        }
      />
    </button>
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';
