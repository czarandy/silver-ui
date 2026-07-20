'use client';

import {
  useId,
  type FieldsetHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import type {FieldNecessity, InputStatus} from 'components/Field';
import {fieldRecipe} from 'components/Field/Field.recipe';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {fieldsetRecipe} from 'components/Fieldset/Fieldset.recipe';
import {VStack, type StackGap} from 'components/Stack';
import {Text} from 'components/Text';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

type NativeFieldsetProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'children' | 'data-testid' | 'disabled'
>;

export type FieldsetProps = NativeFieldsetProps &
  FieldNecessity & {
    /**
     * Separately labeled fields grouped by the fieldset.
     */
    children: ReactNode;
    /**
     * Test ID applied to the native fieldset element.
     */
    'data-testid'?: string;
    /**
     * Supporting text rendered below the legend.
     */
    description?: ReactNode;
    /**
     * Gap between child fields.
     * @default 4
     */
    gap?: StackGap;
    /**
     * Whether native form controls in the fieldset are disabled.
     * @default false
     */
    isDisabled?: boolean;
    /**
     * Text used by the native legend to name the fieldset.
     */
    legend: string;
    /**
     * Ref forwarded to the native fieldset element.
     */
    ref?: Ref<HTMLFieldSetElement>;
    /**
     * Validation summary displayed below the grouped fields. The status is
     * not propagated to child controls.
     */
    status?: InputStatus;
  };

/**
 * Groups separately labeled fields under a native legend with normal vertical
 * layout and optional native disabled cascading.
 */
export function Fieldset({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  children,
  className,
  'data-testid': dataTestId,
  description,
  gap = 4,
  isDisabled = false,
  isOptional = false,
  isRequired = false,
  legend,
  ref,
  status,
  style,
  ...fieldsetProps
}: FieldsetProps): React.JSX.Element {
  const fieldsetId = useId();
  const descriptionId = isReactNode(description)
    ? `${fieldsetId}-description`
    : undefined;
  const statusId = getStatusMessageID(fieldsetId, status);
  const describedBy = getDescribedBy(ariaDescribedBy, descriptionId, statusId);
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;
  const classes = fieldsetRecipe({
    isDisabled,
    statusType: status?.type,
  });
  const statusClass = fieldRecipe({
    statusType: status?.type,
    statusVariant: 'detached',
  }).status;

  return (
    <fieldset
      {...fieldsetProps}
      aria-describedby={describedBy}
      aria-invalid={status?.type === 'error' ? true : ariaInvalid}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      disabled={isDisabled}
      ref={ref}
      style={style}>
      <legend className={classes.legend}>
        <span className={classes.legendContent}>
          <Text as="span" color="inherit" type="label">
            {legend}
          </Text>
          {statusText != null ? (
            <Text
              as="span"
              className={classes.indicator}
              color="inherit"
              size="xs"
              type="supporting">
              <span aria-hidden="true"> · </span>
              {statusText}
            </Text>
          ) : null}
        </span>
      </legend>
      {isReactNode(description) ? (
        <Text
          as="p"
          className={classes.description}
          color="inherit"
          id={descriptionId}
          type="supporting">
          {description}
        </Text>
      ) : null}
      <VStack className={classes.content} gap={gap}>
        {children}
      </VStack>
      {status?.message != null ? (
        <div
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
          className={statusClass}
          id={statusId}
          role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </div>
      ) : null}
    </fieldset>
  );
}

Fieldset.displayName = 'Fieldset';
