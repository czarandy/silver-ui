import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {Field, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {RadioGroupContext, type RadioGroupSize} from './RadioGroupContext';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioGroupProps {
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
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the radio group is required.
   * @default false
   */
  isRequired?: boolean;
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
}

const styles = {
  group: css({
    display: 'flex',
  }),
  vertical: css({
    flexDirection: 'column',
    gap: '2',
  }),
  horizontal: css({
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: '5',
    rowGap: '2',
  }),
} as const;

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
  isOptional = false,
  isRequired = false,
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
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const contextValue = useMemo(
    () => ({
      isDisabled,
      isRequired,
      name: nameId,
      onChange,
      size,
      status,
      value,
    }),
    [isDisabled, isRequired, nameId, onChange, size, status, value],
  );

  return (
    <Field
      className={className}
      data-testid={dataTestId}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      isOptional={isOptional}
      isRequired={isRequired}
      label={label}
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
        aria-label={label}
        aria-required={isRequired || undefined}
        className={
          orientation === 'vertical'
            ? `${styles.group} ${styles.vertical}`
            : `${styles.group} ${styles.horizontal}`
        }
        id={inputId}
        role="radiogroup">
        <RadioGroupContext value={contextValue}>{children}</RadioGroupContext>
      </div>
    </Field>
  );
}

RadioGroup.displayName = 'RadioGroup';
