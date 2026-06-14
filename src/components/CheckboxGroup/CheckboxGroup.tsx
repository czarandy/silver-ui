import {
  useCallback,
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {checkboxGroupRecipe} from 'components/CheckboxGroup/CheckboxGroup.recipe';
import {
  CheckboxGroupContext,
  type CheckboxGroupOrientation,
  type CheckboxGroupSize,
} from 'components/CheckboxGroup/CheckboxGroupContext';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputStatus,
} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import isReactNode from 'internal/isReactNode';

export type {CheckboxGroupOrientation} from 'components/CheckboxGroup/CheckboxGroupContext';

export type CheckboxGroupProps = {
  /**
   * Checkbox items to render.
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
   * HTML name attribute shared by checkbox inputs for native form submission.
   */
  htmlName?: string;
  /**
   * Whether all checkbox items are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Label text for the checkbox group.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Callback fired when the selected values change.
   * Memoize with `useCallback` to avoid unnecessary re-renders of checkbox items.
   */
  onChange: (value: string[]) => void;
  /**
   * Layout direction of the checkbox items.
   * @default 'vertical'
   */
  orientation?: CheckboxGroupOrientation;
  /**
   * Ref forwarded to the field root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size of the checkbox controls.
   * @default 'md'
   */
  size?: CheckboxGroupSize;
  /**
   * Validation status displayed below the group.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * The currently selected values.
   */
  value: string[];
} & FieldNecessity;

/**
 * A controlled checkbox group for multi-value selection.
 */
export function CheckboxGroup({
  children,
  className,
  'data-testid': dataTestId,
  description,
  htmlName,
  isDisabled = false,
  isLabelHidden = false,
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
}: CheckboxGroupProps): React.JSX.Element {
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const handleItemChange = useCallback(
    (itemValue: string, isChecked: boolean) => {
      if (isChecked) {
        onChange(value.includes(itemValue) ? value : [...value, itemValue]);
        return;
      }

      onChange(value.filter(currentValue => currentValue !== itemValue));
    },
    [onChange, value],
  );
  const contextValue = useMemo(
    () => ({
      htmlName,
      isDisabled,
      onChange: handleItemChange,
      orientation,
      size,
      value,
    }),
    [handleItemChange, htmlName, isDisabled, orientation, size, value],
  );

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <Field
      className={className}
      data-testid={dataTestId}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      description={description}
      descriptionID={descriptionID}
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
        className={checkboxGroupRecipe({orientation})}
        id={inputId}
        role="group">
        <CheckboxGroupContext value={contextValue}>
          {children}
        </CheckboxGroupContext>
      </div>
    </Field>
  );
}

CheckboxGroup.displayName = 'CheckboxGroup';
