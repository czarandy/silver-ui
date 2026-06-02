import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {Item} from '../Item';

export interface SelectOptionProps {
  /**
   * Additional CSS class names applied to the option layout.
   */
  className?: string;
  /**
   * Test ID applied to the option layout.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Trailing content.
   */
  endContent?: ReactNode;
  /**
   * Icon displayed before the label.
   */
  icon?: IconComponent;
  /**
   * Primary label.
   */
  label: ReactNode;
  /**
   * Ref forwarded to the layout root.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the layout root.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'flex',
    minW: 0,
    p: 0,
  }),
  icon: css({
    display: 'inline-flex',
    flexShrink: 0,
    color: 'fg.muted',
  }),
} as const;

/**
 * Helper layout for custom Select option rendering.
 */
export function SelectOption({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  icon,
  label,
  ref,
  style,
}: SelectOptionProps): React.JSX.Element {
  return (
    <Item
      as="span"
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      description={description}
      endContent={endContent}
      label={label}
      ref={ref}
      startContent={
        icon != null ? (
          <span className={styles.icon}>
            <Icon color="secondary" icon={icon} size="sm" />
          </span>
        ) : null
      }
      style={style}
    />
  );
}

SelectOption.displayName = 'SelectOption';
