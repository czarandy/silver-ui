'use client';

import {use} from 'react';
import {
  SelectableCard,
  type SelectableCardBaseProps,
} from 'components/Card/SelectableCard';
import {CheckboxGroupContext} from 'components/CheckboxGroup/CheckboxGroupContext';

export type CheckboxCardProps = SelectableCardBaseProps;

/**
 * A rich Card option that participates in a CheckboxGroup.
 */
export function CheckboxCard({
  className,
  'data-testid': dataTestId,
  isDisabled: isItemDisabled = false,
  ref,
  style,
  value,
  ...props
}: CheckboxCardProps): React.JSX.Element {
  const context = use(CheckboxGroupContext);
  if (context == null) {
    throw new Error('CheckboxCard must be used within a CheckboxGroup');
  }

  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.selectedValues.has(value);

  return (
    <SelectableCard
      {...props}
      className={className}
      controlType="checkbox"
      data-testid={dataTestId}
      htmlName={context.htmlName}
      isChecked={isChecked}
      isDisabled={isDisabled}
      onChange={checked => context.onChange(value, checked)}
      ref={ref}
      size={context.size}
      style={style}
      value={value}
    />
  );
}

CheckboxCard.displayName = 'CheckboxCard';
