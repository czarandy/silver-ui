'use client';

import {use} from 'react';
import {
  SelectableCard,
  type SelectableCardBaseProps,
} from 'components/Card/SelectableCard';
import {RadioGroupContext} from 'components/RadioGroup/RadioGroupContext';

export type RadioCardProps = SelectableCardBaseProps;

/**
 * A rich Card option that participates in a RadioGroup.
 */
export function RadioCard({
  className,
  'data-testid': dataTestId,
  isDisabled: isItemDisabled = false,
  ref,
  style,
  value,
  ...props
}: RadioCardProps): React.JSX.Element {
  const context = use(RadioGroupContext);
  if (context == null) {
    throw new Error('RadioCard must be used within a RadioGroup');
  }

  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;

  return (
    <SelectableCard
      {...props}
      className={className}
      controlType="radio"
      data-testid={dataTestId}
      htmlName={context.name}
      isChecked={isChecked}
      isDisabled={isDisabled}
      isReadOnly={context.isReadOnly}
      isRequired={context.isRequired}
      onChange={() => context.onChange(value)}
      ref={ref}
      size={context.size}
      style={style}
      value={value}
    />
  );
}

RadioCard.displayName = 'RadioCard';
