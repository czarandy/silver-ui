'use client';

import type {CSSProperties, Ref} from 'react';
import {Icon, type IconComponent} from 'components/Icon';
import {segmentedControlRecipe} from 'components/SegmentedControl/SegmentedControl.recipe';
import {useSegmentedControlContext} from 'components/SegmentedControl/SegmentedControlContext';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {cx} from 'utils/cx';

export interface SegmentedControlItemProps<TValue extends string = string> {
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
  value: TValue;
}

/**
 * Individual segment within a `SegmentedControl`.
 */
export function SegmentedControlItem<TValue extends string = string>({
  className,
  'data-testid': dataTestId,
  icon,
  isDisabled = false,
  isLabelHidden = false,
  label,
  ref,
  style,
  value,
}: SegmentedControlItemProps<TValue>): React.JSX.Element {
  const context = useSegmentedControlContext();
  const isSelected = context.value === value;
  const isItemDisabled = context.isDisabled || isDisabled;
  const classes = segmentedControlRecipe({
    size: context.size,
    layout: context.layout,
    isSelected,
    isDisabled: isItemDisabled,
  });

  return (
    <button
      aria-checked={isSelected}
      aria-disabled={isItemDisabled || undefined}
      aria-label={isLabelHidden ? label : undefined}
      className={cx(classes.item, className)}
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
        <span className={classes.icon}>
          <Icon icon={icon} size={context.size} />
        </span>
      ) : null}
      {isLabelHidden ? <VisuallyHidden>{label}</VisuallyHidden> : label}
    </button>
  );
}

SegmentedControlItem.displayName = 'SegmentedControlItem';
