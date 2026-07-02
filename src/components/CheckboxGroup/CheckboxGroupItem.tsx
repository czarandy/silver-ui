'use client';

import {use, type CSSProperties, type ReactNode, type Ref} from 'react';
import {CheckboxGroupContext} from 'components/CheckboxGroup/CheckboxGroupContext';
import {CheckboxInput, type CheckboxInputProps} from 'components/CheckboxInput';

export interface CheckboxGroupItemProps {
  /**
   * Additional CSS class names applied to the item root.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the item label.
   */
  description?: ReactNode;
  /**
   * Content rendered after the label and description.
   */
  endContent?: ReactNode;
  /**
   * Where to place `endContent` within the item.
   * @default 'inline'
   */
  endContentPosition?: CheckboxInputProps['endContentPosition'];
  /**
   * Whether this checkbox item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Label text for the checkbox item.
   */
  label: string;
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Content rendered after the checkbox control and before the label.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the item root.
   */
  style?: CSSProperties;
  /**
   * Value represented by this checkbox item.
   */
  value: string;
}

/**
 * An individual checkbox option within a `CheckboxGroup`.
 */
export function CheckboxGroupItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  endContentPosition = 'inline',
  isDisabled: isItemDisabled = false,
  label,
  ref,
  startContent,
  style,
  value,
}: CheckboxGroupItemProps): React.JSX.Element {
  const context = use(CheckboxGroupContext);
  if (context == null) {
    throw new Error('CheckboxGroupItem must be used within a CheckboxGroup');
  }

  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.selectedValues.has(value);

  return (
    <CheckboxInput
      className={className}
      data-testid={dataTestId}
      description={description}
      endContent={endContent}
      endContentPosition={endContentPosition}
      htmlName={context.htmlName}
      htmlValue={value}
      isDisabled={isDisabled}
      label={label}
      onChange={checked => context.onChange(value, checked)}
      ref={ref}
      size={context.size}
      startContent={startContent}
      style={style}
      value={isChecked}
      width={context.orientation === 'horizontal' ? 'auto' : 'full'}
    />
  );
}

CheckboxGroupItem.displayName = 'CheckboxGroupItem';
