import {CalendarIcon, X} from 'lucide-react';
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {parseDateInput} from '../../internal/parseDateInput';
import {
  DATE_FORMAT_LONG,
  plainDateFormat,
  plainDateIsAfter,
  plainDateIsBefore,
  type PlainDate,
} from '../../internal/plainDate';
import {Button} from '../Button';
import {Calendar, type CalendarHandle} from '../Calendar';
import {
  Field,
  inputRecipe,
  inputStyles,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';

export type {PlainDate} from '../../internal/plainDate';

const styles = {
  wrapper: css({ps: '1', gap: '1'}),
} as const;

export type DateInputProps = {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Returns true for dates that should be disabled.
   */
  getIsDateDisabled?: (date: PlainDate) => boolean;
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
   * Field label text.
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
   * Maximum selectable date.
   */
  max?: PlainDate;
  /**
   * Minimum selectable date.
   */
  min?: PlainDate;
  /**
   * Called when the selected date changes.
   */
  onChange: (value: PlainDate | undefined) => void;
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
   * Currently selected date.
   */
  value: PlainDate | undefined;
} & FieldNecessity;

function formatDate(value: PlainDate | undefined): string {
  return value == null ? '' : plainDateFormat(value, DATE_FORMAT_LONG);
}

function isDateAllowed(
  date: PlainDate,
  options: {
    getIsDateDisabled?: (date: PlainDate) => boolean;
    max?: PlainDate;
    min?: PlainDate;
  },
): boolean {
  if (options.min != null && plainDateIsBefore(date, options.min)) {
    return false;
  }
  if (options.max != null && plainDateIsAfter(date, options.max)) {
    return false;
  }
  if (options.getIsDateDisabled?.(date)) {
    return false;
  }
  return true;
}

/**
 * A date picker input that combines a text input with a calendar popover.
 * Users can type a date directly or select one from the calendar.
 */
export function DateInput({
  label,
  value,
  onChange,
  min,
  max,
  getIsDateDisabled,
  placeholder = 'Select a date',
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  hasClear = false,
  status,
  labelIcon,
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const calendarRef = useRef<CalendarHandle | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  const displayValue = pendingInput ?? formatDate(value);

  const necessity: FieldNecessity = {isOptional, isRequired};

  const handleCalendarChange = useCallback(
    (nextValue: PlainDate) => {
      onChange(nextValue);
      setPendingInput(null);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value;
      setPendingInput(text);

      const parsed = parseDateInput(text);
      if (
        parsed != null &&
        isDateAllowed(parsed, {min, max, getIsDateDisabled})
      ) {
        onChange(parsed);
        calendarRef.current?.navigateTo(parsed);
      }
    },
    [getIsDateDisabled, max, min, onChange],
  );

  const commitPendingInput = useCallback(() => {
    if (pendingInput == null) {
      return;
    }

    if (pendingInput.trim() === '') {
      if (value != null) {
        onChange(undefined);
      }
      setPendingInput(null);
      return;
    }

    const parsed = parseDateInput(pendingInput);
    if (
      parsed != null &&
      isDateAllowed(parsed, {min, max, getIsDateDisabled})
    ) {
      onChange(parsed);
    }
    setPendingInput(null);
  }, [getIsDateDisabled, max, min, onChange, pendingInput, value]);

  const handleBlur = useCallback(() => {
    commitPendingInput();
  }, [commitPendingInput]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitPendingInput();
      }
    },
    [commitPendingInput],
  );

  const handleClear = useCallback(() => {
    onChange(undefined);
    setPendingInput(null);
    inputRef.current?.focus();
  }, [onChange]);

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
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled: isDisabled,
          }),
          styles.wrapper,
        )}
        ref={wrapperRef}>
        <Popover
          content={
            <Calendar
              getIsDateDisabled={getIsDateDisabled}
              max={max}
              min={min}
              onChange={handleCalendarChange}
              ref={calendarRef}
              value={value}
              viewDate={value}
            />
          }
          hasAutoFocus
          isEnabled={!isDisabled}
          isOpen={isOpen}
          label={`Choose ${label}`}
          onOpenChange={setIsOpen}
          padding="3">
          <Button
            icon={CalendarIcon}
            isDisabled={isDisabled}
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
          aria-required={isRequired ?? undefined}
          autoComplete="off"
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={mergeRefs(ref, inputRef)}
          type="text"
          value={displayValue}
        />
        {hasClear && value != null && !isDisabled && !isLoading ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={handleClear}
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
