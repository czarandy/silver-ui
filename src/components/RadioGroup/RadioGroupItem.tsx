'use client';

import {use, useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {Item} from 'components/Item';
import {radioGroupItemRecipe} from 'components/RadioGroup/RadioGroup.recipe';
import {RadioGroupContext} from 'components/RadioGroup/RadioGroupContext';
import isReactNode from 'internal/isReactNode';

export interface RadioGroupItemProps {
  /**
   * Additional CSS class names applied to the item root.
   */
  className?: string;
  /**
   * Test ID applied to the item root.
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
   * Whether this radio item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Label text for the radio item.
   */
  label: string;
  /**
   * Ref forwarded to the item root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Content rendered after the radio control and before the label.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the item root.
   */
  style?: CSSProperties;
  /**
   * Value represented by this radio item.
   */
  value: string;
}

/**
 * An individual radio option within a `RadioGroup`.
 */
export function RadioGroupItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  isDisabled: isItemDisabled = false,
  label,
  ref,
  startContent,
  style,
  value,
}: RadioGroupItemProps): React.JSX.Element {
  const context = use(RadioGroupContext);
  if (context == null) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const id = useId();
  const descriptionId = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;
  const classes = radioGroupItemRecipe({size, isChecked, isDisabled});
  const control = (
    <span className={classes.controlWrap}>
      <input
        aria-describedby={isReactNode(description) ? descriptionId : undefined}
        checked={isChecked}
        className={classes.input}
        disabled={isDisabled}
        id={id}
        name={context.name}
        onChange={() => context.onChange(value)}
        required={context.isRequired}
        type="radio"
        value={value}
      />
      <span aria-hidden="true" className={classes.radio}>
        {isChecked ? <span className={classes.dot} /> : null}
      </span>
    </span>
  );

  return (
    <Item
      className={className}
      data-testid={dataTestId}
      description={
        isReactNode(description) ? (
          <span id={descriptionId}>{description}</span>
        ) : undefined
      }
      endContent={endContent}
      endContentPosition="inline"
      isDisabled={isDisabled}
      label={
        <label className={classes.label} htmlFor={id}>
          {label}
        </label>
      }
      leadingContent={control}
      ref={ref}
      startContent={startContent}
      style={style}
      width={context.orientation === 'horizontal' ? 'auto' : 'full'}
    />
  );
}

RadioGroupItem.displayName = 'RadioGroupItem';
