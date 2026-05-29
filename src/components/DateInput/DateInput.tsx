import {CalendarIcon, X} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import type {ISODateString} from '../../internal/dateTypes';
import {
  plainDateFromISO,
  DATE_FORMAT_LONG,
  plainDateFormat,
} from '../../internal/plainDate';
import {Button} from '../Button';
import {Calendar} from '../Calendar';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';

export type {ISODateString} from '../../internal/dateTypes';

export interface DateInputProps {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Predicate functions that constrain which dates are selectable.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Whether to show a clear button when a value is selected.
   * @default false
   */
  hasClear?: boolean;
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
   * Whether the input is in a loading state.
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
   * Field label text.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Maximum selectable date (ISO string).
   */
  max?: ISODateString;
  /**
   * Minimum selectable date (ISO string).
   */
  min?: ISODateString;
  /**
   * Number of calendar months shown in the popover.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the selected date changes.
   */
  onChange?: (value: ISODateString | undefined) => void;
  /**
   * Placeholder text shown when no date is selected.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size of the input.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the input wrapper.
   */
  style?: CSSProperties;
  /**
   * Currently selected date (ISO string).
   */
  value?: ISODateString;
}

function formatDate(value: ISODateString | undefined): string {
  return value == null
    ? ''
    : plainDateFormat(plainDateFromISO(value), DATE_FORMAT_LONG);
}

/**
 * A date picker input that opens a calendar popover for selecting a single date.
 */
export function DateInput({
  label,
  value,
  onChange,
  min,
  max,
  dateConstraints,
  numberOfMonths = 1,
  placeholder = 'Select a date',
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  hasClear = false,
  status,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DateInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = useMemo(() => formatDate(value), [value]);

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
        <Popover
          content={
            <Calendar
              dateConstraints={dateConstraints}
              focusDate={value}
              max={max}
              min={min}
              numberOfMonths={numberOfMonths}
              onChange={nextValue => {
                onChange?.(nextValue);
                setIsOpen(false);
              }}
              value={value}
            />
          }
          hasAutoFocus
          isEnabled={!isDisabled && !isLoading}
          isOpen={isOpen}
          label={`Choose ${label}`}
          onOpenChange={setIsOpen}>
          <Button
            icon={CalendarIcon}
            isDisabled={isDisabled || isLoading}
            isIconOnly
            label={`Choose ${label}`}
            size="sm"
            variant="ghost"
          />
        </Popover>
        <input
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || undefined}
          aria-required={isRequired || undefined}
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled || isLoading}
          id={inputId}
          placeholder={placeholder}
          readOnly
          ref={ref}
          type="text"
          value={displayValue}
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

DateInput.displayName = 'DateInput';
