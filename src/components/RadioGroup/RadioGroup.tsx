import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {radioGroupRecipe} from 'components/RadioGroup/RadioGroup.recipe';
import isReactNode from '../../internal/isReactNode';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputStatus,
} from '../Field';
import {
  RadioGroupContext,
  type RadioGroupOrientation,
  type RadioGroupSize,
} from './RadioGroupContext';

export type {RadioGroupOrientation} from './RadioGroupContext';

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
   * Whether all radio items are disabled.
   * @default false
   */
  isDisabled?: boolean;
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
}: RadioGroupProps): React.JSX.Element {
  const nameId = useId();
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const contextValue = useMemo(
    () => ({
      isDisabled,
      isRequired,
      name: nameId,
      onChange,
      orientation,
      size,
      value,
    }),
    [isDisabled, isRequired, nameId, onChange, orientation, size, value],
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
        aria-required={isRequired ?? undefined}
        className={radioGroupRecipe({orientation})}
        id={inputId}
        role="radiogroup">
        <RadioGroupContext value={contextValue}>{children}</RadioGroupContext>
      </div>
    </Field>
  );
}

RadioGroup.displayName = 'RadioGroup';
