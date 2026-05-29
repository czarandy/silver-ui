import type {CSSProperties, Ref} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {useSegmentedControlContext} from './SegmentedControlContext';

export interface SegmentedControlItemProps {
  /**
   * Additional CSS class names applied to the segment.
   */
  className?: string;
  /**
   * Test ID applied to the segment.
   */
  'data-testid'?: string;
  /**
   * Icon element displayed before the label.
   */
  icon?: IconComponent;
  /**
   * Whether this segment is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Accessible and visible label for the segment.
   */
  label: string;
  /**
   * Ref forwarded to the segment button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Inline styles applied to the segment.
   */
  style?: CSSProperties;
  /**
   * Unique value represented by this segment.
   */
  value: string;
}

const styles = {
  item: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
    borderWidth: 0,
    borderStyle: 'none',
    bg: 'transparent',
    color: 'fg.muted',
    cursor: 'pointer',
    fontFamily: 'body',
    fontWeight: 'medium',
    lineHeight: 'normal',
    transitionProperty: 'background-color, color, box-shadow',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    _hover: {
      bg: 'bg.subtle',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  selected: css({
    bg: 'bg',
    color: 'fg',
    fontWeight: 'semibold',
    boxShadow: 'sm',
    _hover: {
      bg: 'bg',
    },
  }),
  disabled: css({
    color: 'silver-neutral.400',
    cursor: 'default',
    _hover: {
      bg: 'transparent',
    },
  }),
  fill: css({
    flex: 1,
  }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  size: {
    sm: css({
      h: '7',
      px: '2',
      borderRadius: 'sm',
      fontSize: 'sm',
      '--segmented-control-icon-size': '14px',
    }),
    md: css({
      h: '9',
      px: '3',
      borderRadius: 'sm',
      fontSize: 'sm',
      '--segmented-control-icon-size': '16px',
    }),
    lg: css({
      h: '11',
      px: '3',
      borderRadius: 'md',
      fontSize: 'md',
      '--segmented-control-icon-size': '18px',
    }),
  },
} as const;

/**
 * Individual segment within a `SegmentedControl`.
 */
export function SegmentedControlItem({
  className,
  'data-testid': dataTestId,
  icon,
  isDisabled = false,
  isLabelHidden = false,
  label,
  ref,
  style,
  value,
}: SegmentedControlItemProps): React.JSX.Element {
  const context = useSegmentedControlContext();
  const isSelected = context.value === value;
  const isItemDisabled = context.isDisabled || isDisabled;

  return (
    <button
      aria-checked={isSelected}
      aria-disabled={isItemDisabled || undefined}
      aria-label={isLabelHidden ? label : undefined}
      className={cx(
        styles.item,
        styles.size[context.size],
        context.layout === 'fill' ? styles.fill : undefined,
        isSelected ? styles.selected : undefined,
        isItemDisabled ? styles.disabled : undefined,
        className,
      )}
      data-testid={dataTestId}
      data-value={value}
      onClick={() => {
        if (!isItemDisabled && !isSelected) {
          context.onChange(value);
        }
      }}
      ref={ref}
      role="radio"
      style={style}
      tabIndex={isSelected ? 0 : -1}
      type="button">
      {icon != null ? (
        <span className={styles.icon}>
          <Icon icon={icon} size="sm" />
        </span>
      ) : null}
      {isLabelHidden ? <VisuallyHidden>{label}</VisuallyHidden> : label}
    </button>
  );
}

SegmentedControlItem.displayName = 'SegmentedControlItem';
