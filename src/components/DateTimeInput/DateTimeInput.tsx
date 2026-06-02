import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {ISODateString} from '../../internal/dateTypes';
import {DateInput} from '../DateInput';
import {
  Field,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import type {IconComponent} from '../Icon';
import {TimeInput, type ISOTimeString} from '../TimeInput';

export type ISODateTimeString = `${ISODateString}T${ISOTimeString}`;

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
   * Predicate functions that constrain which dates are selectable.
   */
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Whether to show clear buttons on the date and time inputs.
   * @default false
   */
  hasClear?: boolean;
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
   * Maximum selectable date-time (ISO string).
   */
  max?: ISODateTimeString;
  /**
   * Minimum selectable date-time (ISO string).
   */
  min?: ISODateTimeString;
  /**
   * Number of calendar months shown in the date popover.
   * @default 1
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the selected date-time changes.
   */
  onChange: (value: ISODateTimeString | undefined) => void;
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
   * Currently selected date-time (ISO string).
   */
  value: ISODateTimeString | undefined;
} & FieldNecessity;

const styles = {
  row: css({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.75fr)',
    gap: '2',
  }),
} as const;

function splitDateTime(value: ISODateTimeString | undefined): {
  date: ISODateString | undefined;
  time: ISOTimeString | undefined;
} {
  if (value == null) {
    return {date: undefined, time: undefined};
  }
  const [date, time] = value.split('T');
  return {date: date as ISODateString, time: time as ISOTimeString};
}

function combineDateTime(
  date: ISODateString | undefined,
  time: ISOTimeString | undefined,
): ISODateTimeString | undefined {
  return date != null && time != null ? `${date}T${time}` : undefined;
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
  dateConstraints,
  numberOfMonths = 1,
  hasClear = false,
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
  const {date, time} = splitDateTime(value);
  const minParts = splitDateTime(min);
  const maxParts = splitDateTime(max);

  const necessity: FieldNecessity = {isOptional, isRequired};

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
          dateConstraints={dateConstraints}
          hasClear={hasClear}
          isDisabled={isDisabled}
          isLabelHidden
          isLoading={isLoading}
          label={`${label} date`}
          max={maxParts.date}
          min={minParts.date}
          numberOfMonths={numberOfMonths}
          onChange={nextDate => onChange(combineDateTime(nextDate, time))}
          ref={ref}
          size={size}
          value={date}
        />
        <TimeInput
          hasClear={hasClear}
          hasSeconds={hasSeconds}
          isDisabled={isDisabled}
          isLabelHidden
          isLoading={isLoading}
          label={`${label} time`}
          max={date === maxParts.date ? maxParts.time : undefined}
          min={date === minParts.date ? minParts.time : undefined}
          onChange={nextTime => onChange(combineDateTime(date, nextTime))}
          size={size}
          value={time}
        />
      </div>
    </Field>
  );
}

DateTimeInput.displayName = 'DateTimeInput';
