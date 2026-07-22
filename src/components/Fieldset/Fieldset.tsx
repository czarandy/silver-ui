'use client';

import {
  useId,
  useMemo,
  type FieldsetHTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import type {FieldNecessity, InputStatus} from 'components/Field';
import {fieldRecipe} from 'components/Field/Field.recipe';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {fieldsetRecipe} from 'components/Fieldset/Fieldset.recipe';
import {
  FieldsetContext,
  useFieldset,
} from 'components/Fieldset/FieldsetContext';
import {VStack} from 'components/Stack';
import {Text} from 'components/Text';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
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
     * Whether form controls in the fieldset are disabled. Native controls are
     * disabled through the fieldset element; silver-ui inputs also receive the
     * state through context.
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
 * layout and disabled cascading to both native and silver-ui controls.
 */
export function Fieldset({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  children,
  className,
  'data-testid': dataTestId,
  description,
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
  const parentFieldset = useFieldset();
  const effectiveDisabled = isDisabled || parentFieldset?.isDisabled === true;
  const descriptionId = isNonEmptyReactNode(description)
    ? `${fieldsetId}-description`
    : undefined;
  const statusId = getStatusMessageID(fieldsetId, status);
  const describedBy = getDescribedBy(ariaDescribedBy, descriptionId, statusId);
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;
  const classes = fieldsetRecipe({
    isDisabled: effectiveDisabled,
    statusType: status?.type,
  });
  const contextValue = useMemo(
    () => ({isDisabled: effectiveDisabled}),
    [effectiveDisabled],
  );

  return (
    <fieldset
      {...fieldsetProps}
      aria-describedby={describedBy}
      aria-invalid={status?.type === 'error' ? true : ariaInvalid}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      disabled={effectiveDisabled}
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
              color="secondary"
              size="xs"
              type="supporting">
              <span aria-hidden="true"> · </span>
              {statusText}
            </Text>
          ) : null}
        </span>
      </legend>
      {isNonEmptyReactNode(description) ? (
        <Text
          as="p"
          className={classes.description}
          color="secondary"
          id={descriptionId}
          type="supporting">
          {description}
        </Text>
      ) : null}
      <FieldsetContext value={contextValue}>
        <VStack className={classes.content} gap={4}>
          {children}
        </VStack>
      </FieldsetContext>
      {status?.message != null ? (
        <div
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
          className={
            fieldRecipe({
              statusType: status.type,
              statusVariant: 'detached',
            }).status
          }
          id={statusId}
          role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </div>
      ) : null}
    </fieldset>
  );
}

Fieldset.displayName = 'Fieldset';
