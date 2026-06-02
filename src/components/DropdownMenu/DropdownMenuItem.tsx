import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
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
  label: ReactNode;
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

const styles = {
  root: css({
    all: 'unset',
    boxSizing: 'border-box',
    display: 'block',
    w: 'full',
    borderRadius: 'md',
    color: 'fg',
    cursor: 'pointer',
    fontFamily: 'body',
    textAlign: 'start',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '1px',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),
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
  const size = context?.menuSize ?? 'md';

  return (
    <button
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={() => {
        if (isDisabled) {
          return;
        }
        onClick?.();
        context?.closeMenu();
      }}
      ref={ref}
      role="menuitem"
      style={style}
      type="button">
      <Item
        as="span"
        density={size === 'lg' ? 'default' : 'compact'}
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
