'use client';

import type {Temporal} from '@js-temporal/polyfill';
import {CalendarIcon, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {Calendar} from 'components/Calendar';
import {dateRangeInputRecipe} from 'components/DateRangeInput/DateRangeInput.recipe';
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
import {Icon, type IconComponent} from 'components/Icon';
import {Popover} from 'components/Popover';
import {Spinner} from 'components/Spinner';
import type {DateRange} from 'internal/dateTypes';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {
  plainDateFormatWith,
  plainDateIsEqual,
  type DateFormat,
  type PlainDate,
} from 'internal/plainDate';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {cx} from 'utils/cx';

export type {DateRange} from 'internal/dateTypes';

export type DateRangeInputProps = {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the trigger button.
   */
  'data-testid'?: string;
  /**
   * Returns true for dates that should be disabled.
   */
  getIsDateDisabled?: (date: PlainDate) => boolean;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * How each end of the committed range is displayed. Accepts a named preset —
   * `'long'` ("January 15, 2026"), `'short'` ("Jan 15, 2026"), or `'iso'`
   * ("2026-01-15") — or a function receiving the date.
   * @default 'short'
   */
  format?: DateFormat;
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
   * Maximum duration between the selected range start and end. Must be a
   * non-negative, date-based Temporal duration.
   */
  maxRangeSpan?: Temporal.Duration;
  /**
   * Minimum selectable date.
   */
  min?: PlainDate;
  /**
   * Minimum duration between the selected range start and end. Must be a
   * non-negative, date-based Temporal duration.
   */
  minRangeSpan?: Temporal.Duration;
  /**
   * Number of calendar months shown in the popover.
   * @default 2
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the selected date range changes.
   */
  onChange: (value: DateRange | null) => void;
  /**
   * Placeholder text shown when no range is selected.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the trigger button.
   */
  ref?: Ref<HTMLButtonElement>;
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
   * Currently selected date range. Pass `null` for an empty input.
   */
  value: DateRange | null;
} & FieldNecessity;

function formatRange(
  value: DateRange | null | undefined,
  format: DateFormat,
): string {
  if (value == null) {
    return '';
  }
  const formattedStart = plainDateFormatWith(value.start, format);
  if (plainDateIsEqual(value.start, value.end)) {
    return formattedStart;
  }
  return `${formattedStart} - ${plainDateFormatWith(value.end, format)}`;
}

/**
 * A date range picker input that opens a calendar popover for selecting a start and end date.
 */
export function DateRangeInput({
  label,
  value,
  onChange,
  min,
  max,
  minRangeSpan,
  maxRangeSpan,
  getIsDateDisabled,
  format = 'short',
  numberOfMonths = 2,
  placeholder = 'Select a date range',
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  isReadOnly = false,
  hasClear = false,
  status,
  labelIcon,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DateRangeInputProps): React.JSX.Element {
  const inputId = useId();
  const popoverId = `${inputId}-calendar`;
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fieldset = useFieldset();
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);
  const displayValue = useMemo(
    () => formatRange(value, format),
    [format, value],
  );

  const necessity = getNecessity(isOptional, isRequired);
  const classes = dateRangeInputRecipe({
    isDisabled: effectiveDisabled,
    isReadOnly: effectiveReadOnly,
    isPlaceholder: displayValue === '',
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [],
  );

  useEffect(() => {
    if (!effectiveReadOnly) {
      return;
    }
    buttonRef.current?.blur();
    const animationFrame = requestAnimationFrame(() => {
      setIsOpen(false);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [effectiveReadOnly]);

  return (
    <Field
      className={className}
      description={description}
      descriptionID={descriptionID}
      inputId={inputId}
      isDisabled={effectiveDisabled}
      isLabelHidden={isLabelHidden}
      isReadOnly={effectiveReadOnly}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
      {/* eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- mouse clicks anywhere on the visual input delegate to the inner combobox button; keyboard handling stays on that button. */}
      <div
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled: effectiveDisabled,
            isReadOnly: effectiveReadOnly,
          }),
          classes.wrapper,
        )}
        onClick={() => {
          if (!effectiveDisabled && !effectiveReadOnly) {
            setIsOpen(currentIsOpen => !currentIsOpen);
          }
        }}
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
        ref={triggerRef}>
        <button
          aria-busy={isLoading || undefined}
          aria-controls={popoverId}
          aria-describedby={describedBy}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-invalid={status?.type === 'error' || undefined}
          aria-readonly={effectiveReadOnly || undefined}
          aria-required={isRequired ?? undefined}
          className={classes.trigger}
          data-testid={dataTestId}
          disabled={effectiveDisabled}
          id={inputId}
          onKeyDown={handleKeyDown}
          ref={mergeRefs(ref, buttonRef)}
          role="combobox"
          tabIndex={effectiveReadOnly ? -1 : undefined}
          type="button">
          <span className={classes.icon}>
            <Icon data-testid="calendar-icon" icon={CalendarIcon} size="sm" />
          </span>
          <span className={classes.value}>
            {displayValue === '' ? placeholder : displayValue}
          </span>
        </button>
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
            onClick={event => {
              event.stopPropagation();
              onChange(null);
            }}
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
      <Popover
        anchorRef={triggerRef}
        content={
          <Calendar
            getIsDateDisabled={getIsDateDisabled}
            max={max}
            maxRangeSpan={maxRangeSpan}
            min={min}
            minRangeSpan={minRangeSpan}
            mode="range"
            numberOfMonths={numberOfMonths}
            onChange={nextValue => {
              if (!effectiveReadOnly) {
                onChange(nextValue);
              }
              setIsOpen(false);
            }}
            value={value ?? undefined}
            viewDate={value?.start}
          />
        }
        hasAutoFocus
        id={popoverId}
        isEnabled={false}
        isOpen={isOpen}
        label={`Choose ${label}`}
        onOpenChange={setIsOpen}
        padding={3}
      />
    </Field>
  );
}

DateRangeInput.displayName = 'DateRangeInput';
