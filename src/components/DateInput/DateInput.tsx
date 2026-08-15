'use client';

import {CalendarIcon, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {Calendar, type CalendarHandle} from 'components/Calendar';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from 'components/Field';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from 'components/Field/inputUtils';
import {useFieldset} from 'components/Fieldset';
import type {IconComponent} from 'components/Icon';
import {Popover} from 'components/Popover';
import {Spinner} from 'components/Spinner';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {parseDateInput} from 'internal/parseDateInput';
import {
  plainDateFormatWith,
  plainDateIsAfter,
  plainDateIsBefore,
  type DateFormat,
  type PlainDate,
} from 'internal/plainDate';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type {DateFormat, PlainDate} from 'internal/plainDate';

const styles = {
  wrapper: css({ps: '1', gap: '1'}),
} as const;

export type DateInputProps = {
  /**
   * Additional CSS class names applied to the field root.
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
   * How the committed date is displayed. Accepts a named preset — `'long'`
   * ("January 15, 2026"), `'short'` ("Jan 15, 2026"), or `'iso'`
   * ("2026-01-15") — or a function receiving the selected date. Typed input is
   * always parsed with the same flexible rules regardless of this prop.
   * @default 'long'
   */
  format?: DateFormat;
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
   * Custom HTML id applied to the input element.
   */
  htmlId?: string;
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
   * Whether the value is displayed without allowing focus or interaction.
   * @default false
   */
  isReadOnly?: boolean;
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
  onChange: (value: PlainDate | null) => void;
  /**
   * Placeholder text shown when no date is selected. Typed dates accept a
   * range of formats, including "May 21, 2026", "5/21/2026", and "2026-05-21".
   * @default 'e.g. May 21, 2026'
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
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
  /**
   * Currently selected date. Pass `null` for an empty input.
   */
  value: PlainDate | null;
} & FieldNecessity;

function formatDate(
  value: PlainDate | null | undefined,
  format: DateFormat,
): string {
  return value == null ? '' : plainDateFormatWith(value, format);
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
  format = 'long',
  placeholder = 'e.g. May 21, 2026',
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  isReadOnly = false,
  hasClear = false,
  htmlId,
  status,
  labelIcon,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DateInputProps): React.JSX.Element {
  const generatedId = useId();
  const inputId = htmlId ?? generatedId;
  const popoverId = `${inputId}-calendar`;
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const calendarRef = useRef<CalendarHandle | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const fieldset = useFieldset();
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);

  useEffect(() => {
    if (!effectiveReadOnly) {
      return;
    }
    inputRef.current?.blur();
    const animationFrame = requestAnimationFrame(() => {
      setIsOpen(false);
      setPendingInput(null);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [effectiveReadOnly]);

  const displayValue = pendingInput ?? formatDate(value, format);

  const necessity = getNecessity(isOptional, isRequired);

  const handleCalendarChange = useCallback(
    (nextValue: PlainDate) => {
      if (effectiveReadOnly) {
        return;
      }
      onChange(nextValue);
      setPendingInput(null);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [effectiveReadOnly, onChange],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (effectiveReadOnly) {
        return;
      }
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
    [effectiveReadOnly, getIsDateDisabled, max, min, onChange],
  );

  const commitPendingInput = useCallback(() => {
    if (effectiveReadOnly) {
      return;
    }
    if (pendingInput == null) {
      return;
    }

    if (pendingInput.trim() === '') {
      if (value != null) {
        onChange(null);
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
  }, [
    effectiveReadOnly,
    getIsDateDisabled,
    max,
    min,
    onChange,
    pendingInput,
    value,
  ]);

  const handleBlur = useCallback(() => {
    commitPendingInput();
  }, [commitPendingInput]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (effectiveReadOnly) {
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        commitPendingInput();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [commitPendingInput, effectiveReadOnly],
  );

  const handleClear = useCallback(() => {
    if (effectiveReadOnly) {
      return;
    }
    onChange(null);
    setPendingInput(null);
    inputRef.current?.focus();
  }, [effectiveReadOnly, onChange]);

  return (
    <Field
      className={className}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={effectiveDisabled}
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
            isDisabled: effectiveDisabled,
            isReadOnly: effectiveReadOnly,
          }),
          styles.wrapper,
        )}
        onClickCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }
        onFocusCapture={effectiveReadOnly ? blurReadOnlyInteraction : undefined}
        onKeyDownCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }
        onPointerDownCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }
        ref={wrapperRef}>
        <Popover
          content={
            <Calendar
              getIsDateDisabled={getIsDateDisabled}
              hasAutoFocus={isOpen}
              max={max}
              min={min}
              onChange={handleCalendarChange}
              ref={calendarRef}
              value={value ?? undefined}
              viewDate={value ?? undefined}
            />
          }
          hasAutoFocus={false}
          id={popoverId}
          isEnabled={!effectiveDisabled && !effectiveReadOnly}
          isOpen={isOpen}
          label={`Choose ${label}`}
          onOpenChange={setIsOpen}
          padding={3}>
          <Button
            icon={CalendarIcon}
            isDisabled={effectiveDisabled || effectiveReadOnly}
            isIconOnly
            label={`Choose ${label}`}
            size="sm"
            variant="ghost"
          />
        </Popover>
        <input
          aria-busy={isLoading || undefined}
          aria-controls={popoverId}
          aria-describedby={describedBy}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-invalid={status?.type === 'error' || undefined}
          aria-readonly={effectiveReadOnly || undefined}
          aria-required={isRequired ?? undefined}
          autoComplete="off"
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={effectiveDisabled}
          id={inputId}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={effectiveReadOnly}
          ref={mergeRefs(ref, inputRef)}
          role="combobox"
          tabIndex={effectiveReadOnly ? -1 : undefined}
          type="text"
          value={displayValue}
        />
        {hasClear &&
        value != null &&
        !effectiveDisabled &&
        !effectiveReadOnly &&
        !isLoading ? (
          <Button
            className={status == null ? inputStyles.clearButton : undefined}
            icon={X}
            isIconOnly
            label={`Clear ${label}`}
            onClick={handleClear}
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

DateInput.displayName = 'DateInput';
