import {Temporal} from '@js-temporal/polyfill';
import {
  useCallback,
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {plainDateIsEqual, type PlainDate} from '../../internal/plainDate';
import {DateInput} from '../DateInput';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import type {IconComponent} from '../Icon';
import {TimeInput, type PlainTime} from '../TimeInput';

export type PlainDateTime = Temporal.PlainDateTime;

export type DateTimeInputProps = {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
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
   * Whether to show the seconds field in the time input.
   * @default false
   */
  hasSeconds?: boolean;
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
   * Maximum selectable date-time.
   */
  max?: PlainDateTime;
  /**
   * Minimum selectable date-time.
   */
  min?: PlainDateTime;
  /**
   * Called when the selected date-time changes.
   */
  onChange: (value: PlainDateTime | undefined) => void;
  /**
   * Ref forwarded to the date input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size of the inputs.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Currently selected date-time.
   */
  value: PlainDateTime | undefined;
} & FieldNecessity;

const styles = {
  row: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.75fr)',
    gap: '2',
  }),
} as const;

function splitDateTime(value: PlainDateTime | undefined): {
  date: PlainDate | undefined;
  time: PlainTime | undefined;
} {
  if (value == null) {
    return {date: undefined, time: undefined};
  }
  return {
    date: value.toPlainDate(),
    time: value.toPlainTime(),
  };
}

function combineDateTime(
  date: PlainDate | undefined,
  time: PlainTime | undefined,
): PlainDateTime | undefined {
  if (date == null && time == null) {
    return undefined;
  }
  const resolvedDate = date ?? Temporal.Now.plainDateISO();
  const resolvedTime = time ?? Temporal.Now.plainTimeISO();
  return resolvedDate.toPlainDateTime(resolvedTime);
}

function clampTime(
  time: PlainTime,
  min: PlainTime | undefined,
  max: PlainTime | undefined,
): PlainTime {
  if (min != null && Temporal.PlainTime.compare(time, min) < 0) {
    return min;
  }
  if (max != null && Temporal.PlainTime.compare(time, max) > 0) {
    return max;
  }
  return time;
}

/**
 * A combined date and time input with calendar popover and time fields.
 */
export function DateTimeInput({
  label,
  value,
  onChange,
  min,
  max,
  getIsDateDisabled,
  hasSeconds = false,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  status,
  labelIcon,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DateTimeInputProps): React.JSX.Element {
  const fieldId = useId();
  const {date, time} = useMemo(() => splitDateTime(value), [value]);
  const minParts = useMemo(() => splitDateTime(min), [min]);
  const maxParts = useMemo(() => splitDateTime(max), [max]);

  const handleDateChange = useCallback(
    (nextDate: PlainDate | undefined) => {
      if (nextDate == null || time == null) {
        onChange(combineDateTime(nextDate, time));
        return;
      }
      const effectiveTimeMin =
        min != null && nextDate.equals(min.toPlainDate())
          ? min.toPlainTime()
          : undefined;
      const effectiveTimeMax =
        max != null && nextDate.equals(max.toPlainDate())
          ? max.toPlainTime()
          : undefined;
      onChange(
        combineDateTime(
          nextDate,
          clampTime(time, effectiveTimeMin, effectiveTimeMax),
        ),
      );
    },
    [onChange, time, min, max],
  );
  const handleTimeChange = useCallback(
    (nextTime: PlainTime | undefined) =>
      onChange(combineDateTime(date, nextTime)),
    [onChange, date],
  );

  const necessity = getNecessity(isOptional, isRequired);

  return (
    <Field
      description={description}
      inputId={fieldId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      {...necessity}
      label={label}
      labelIcon={labelIcon}
      labelTooltip={labelTooltip}
      status={status}>
      <div
        className={cx(styles.row, className)}
        data-testid={dataTestId}
        style={style}>
        <DateInput
          getIsDateDisabled={getIsDateDisabled}
          htmlId={fieldId}
          isDisabled={isDisabled}
          isLabelHidden
          isLoading={isLoading}
          label={`${label} date`}
          max={maxParts.date}
          min={minParts.date}
          onChange={handleDateChange}
          ref={ref}
          size={size}
          value={date}
        />
        <TimeInput
          hasSeconds={hasSeconds}
          isDisabled={isDisabled}
          isLabelHidden
          isLoading={isLoading}
          label={`${label} time`}
          max={
            date != null &&
            maxParts.date != null &&
            plainDateIsEqual(date, maxParts.date)
              ? maxParts.time
              : undefined
          }
          min={
            date != null &&
            minParts.date != null &&
            plainDateIsEqual(date, minParts.date)
              ? minParts.time
              : undefined
          }
          onChange={handleTimeChange}
          size={size}
          value={time}
        />
      </div>
    </Field>
  );
}

DateTimeInput.displayName = 'DateTimeInput';
