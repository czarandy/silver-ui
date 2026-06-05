import {Temporal} from '@js-temporal/polyfill';
import {Clock, X} from 'lucide-react';
import {
  useId,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import {Button} from '../Button';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {inputRecipe, inputStyles} from '../Field/inputStyles';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';

const styles = {
  input: css({
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  }),
} as const;

export type PlainTime = Temporal.PlainTime;

export type TimeInputProps = {
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
   * Field label.
   */
  label: string;
  /**
   * Icon shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Latest allowed time.
   */
  max?: PlainTime;
  /**
   * Earliest allowed time.
   */
  min?: PlainTime;
  /**
   * Called when the input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when the time value changes.
   */
  onChange: (value: PlainTime | undefined) => void;
  /**
   * Called when the input gains focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
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
   * Controlled time value.
   */
  value: PlainTime | undefined;
} & FieldNecessity;

function toInputString(
  time: PlainTime | undefined,
  hasSeconds: boolean,
): string {
  if (time == null) {
    return '';
  }
  return time.toString({
    smallestUnit: hasSeconds ? 'second' : 'minute',
  });
}

function fromInputString(value: string): PlainTime | undefined {
  if (value === '') {
    return undefined;
  }
  try {
    return Temporal.PlainTime.from(value);
  } catch {
    return undefined;
  }
}

/**
 * Time picker input field with optional seconds granularity.
 */
export function TimeInput({
  label,
  value,
  onBlur,
  onChange,
  onFocus,
  hasSeconds = false,
  hasClear = false,
  hasAutoFocus = false,
  min,
  max,
  step,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  htmlName,
  status,
  labelIcon,
  labelTooltip,
  placeholder = 'Select a time',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TimeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <Field
      className={className}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
      <div
        className={inputRecipe({
          size,
          status: status?.type,
          isDisabled,
        })}>
        <span className={inputStyles.iconSlot}>
          <Icon icon={Clock} size="sm" />
        </span>
        <input
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || undefined}
          aria-required={isRequired ?? undefined}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={cx(inputStyles.control, styles.input)}
          data-autofocus={hasAutoFocus || undefined}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          max={toInputString(max, hasSeconds)}
          min={toInputString(min, hasSeconds)}
          name={htmlName}
          onBlur={onBlur}
          onChange={event => onChange(fromInputString(event.target.value))}
          onFocus={onFocus}
          placeholder={placeholder}
          ref={ref}
          step={step ?? (hasSeconds ? 1 : 60)}
          type="time"
          value={toInputString(value, hasSeconds)}
        />
        {hasClear && value != null && !isDisabled ? (
          <Button
            icon={X}
            isIconOnly
            label={`Clear ${label}`}
            onClick={() => onChange(undefined)}
            size="sm"
            variant="ghost"
          />
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
