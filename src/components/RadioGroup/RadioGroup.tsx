'use client';

import {
  useId,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputStatus,
} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {useFieldset} from 'components/Fieldset';
import {radioGroupRecipe} from 'components/RadioGroup/RadioGroup.recipe';
import {
  RadioGroupContext,
  type RadioGroupOrientation,
  type RadioGroupSize,
} from 'components/RadioGroup/RadioGroupContext';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';

export type {RadioGroupOrientation} from 'components/RadioGroup/RadioGroupContext';

export type RadioGroupProps = {
  /**
   * Radio list items to render.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the field root.
   */
  className?: string;
  /**
   * Test ID applied to the field root.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * HTML name attribute shared by radio inputs for native form submission.
   */
  htmlName?: string;
  /**
   * Whether all radio items are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the selected value can be changed by the user.
   * Read-only radio items remain enabled for form submission but cannot be
   * focused or activated.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Label text for the radio group.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Callback fired when the selected value changes.
   * Memoize with `useCallback` to avoid unnecessary re-renders of radio items.
   */
  onChange: (value: string) => void;
  /**
   * Layout direction of the radio items.
   * @default 'vertical'
   */
  orientation?: RadioGroupOrientation;
  /**
   * Ref forwarded to the field root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size of the radio controls.
   * @default 'md'
   */
  size?: RadioGroupSize;
  /**
   * Validation status displayed below the group.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * The currently selected value.
   */
  value: string;
} & FieldNecessity;

/**
 * A controlled radio group for single-value selection.
 */
export function RadioGroup({
  children,
  className,
  'data-testid': dataTestId,
  description,
  htmlName,
  isDisabled = false,
  isLabelHidden = false,
  isReadOnly = false,
  isOptional,
  isRequired,
  label,
  labelTooltip,
  onChange,
  orientation = 'vertical',
  ref,
  size = 'md',
  status,
  style,
  value,
}: RadioGroupProps): React.JSX.Element {
  const nameId = useId();
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const fieldset = useFieldset();
  const groupRef = useRef<HTMLDivElement>(null);
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);
  const contextValue = useMemo(
    () => ({
      isDisabled: effectiveDisabled,
      isReadOnly: effectiveReadOnly,
      isRequired,
      name: htmlName ?? nameId,
      onChange: (nextValue: string) => {
        if (!effectiveReadOnly) {
          onChange(nextValue);
        }
      },
      orientation,
      size,
      value,
    }),
    [
      htmlName,
      effectiveDisabled,
      effectiveReadOnly,
      isRequired,
      nameId,
      onChange,
      orientation,
      size,
      value,
    ],
  );

  useEffect(() => {
    if (effectiveReadOnly) {
      groupRef.current
        ?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
        .forEach(input => input.blur());
    }
  }, [effectiveReadOnly]);

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <Field
      className={className}
      data-testid={dataTestId}
      inputId={inputId}
      isDisabled={effectiveDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelAs="span"
      labelId={labelId}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      statusVariant="detached"
      style={style}>
      <div
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-labelledby={labelId}
        aria-orientation={orientation}
        aria-readonly={effectiveReadOnly || undefined}
        aria-required={isRequired ?? undefined}
        className={radioGroupRecipe({orientation})}
        id={inputId}
        ref={groupRef}
        role="radiogroup">
        <RadioGroupContext value={contextValue}>{children}</RadioGroupContext>
      </div>
    </Field>
  );
}

RadioGroup.displayName = 'RadioGroup';
