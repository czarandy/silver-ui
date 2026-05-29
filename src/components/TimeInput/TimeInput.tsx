import {Clock, X} from 'lucide-react';
import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Spinner} from '../Spinner';

export type ISOTimeString =
  | `${number}${number}:${number}${number}`
  | `${number}${number}:${number}${number}:${number}${number}`;

export interface TimeInputProps {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a clear button when a value is set.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether the input includes a seconds field.
   * @default false
   */
  hasSeconds?: boolean;
  /**
   * HTML name attribute.
   */
  htmlName?: string;
  /**
   * Whether the input is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the input is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Field label.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Latest allowed time.
   */
  max?: ISOTimeString;
  /**
   * Earliest allowed time.
   */
  min?: ISOTimeString;
  /**
   * Called when the time value changes.
   */
  onChange?: (value: ISOTimeString | undefined) => void;
  /**
   * Placeholder text.
   * @default 'Select a time'
   */
  placeholder?: string;
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Step increment in seconds for the time picker.
   */
  step?: number;
  /**
   * Inline styles applied to the input wrapper.
   */
  style?: CSSProperties;
  /**
   * Controlled time value in ISO format.
   */
  value?: ISOTimeString;
}

/**
 * Time picker input field with optional seconds granularity.
 */
export function TimeInput({
  label,
  value,
  onChange,
  hasSeconds = false,
  hasClear = false,
  hasAutoFocus = false,
  min,
  max,
  step,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  htmlName,
  status,
  labelTooltip,
  placeholder = 'Select a time',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TimeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);

  return (
    <Field
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      isOptional={isOptional}
      isRequired={isRequired}
      label={label}
      labelTooltip={labelTooltip}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }>
      <div
        className={cx(
          inputStyles.wrapper,
          inputStyles.size[size],
          status != null ? inputStyles.status[status.type] : undefined,
          isDisabled ? inputStyles.wrapperDisabled : undefined,
          className,
        )}
        style={style}>
        <span className={inputStyles.iconSlot}>
          <Icon icon={Clock} size="sm" />
        </span>
        <input
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || undefined}
          aria-required={isRequired || undefined}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled || isLoading}
          id={inputId}
          max={max}
          min={min}
          name={htmlName}
          onChange={event =>
            onChange?.(
              event.target.value === ''
                ? undefined
                : (event.target.value as ISOTimeString),
            )
          }
          placeholder={placeholder}
          ref={ref}
          step={step ?? (hasSeconds ? 1 : 60)}
          type="time"
          value={value ?? ''}
        />
        {hasClear && value != null && !isDisabled ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={() => onChange?.(undefined)}
            type="button">
            <Icon icon={X} size="sm" />
          </button>
        ) : null}
        {isLoading ? <Spinner size="sm" /> : null}
        {status != null ? (
          <span className={inputStyles.iconSlot}>
            {getStatusIcon(status.type)}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

TimeInput.displayName = 'TimeInput';
