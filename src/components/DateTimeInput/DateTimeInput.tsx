import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {ISODateString} from '../../internal/dateTypes';
import {DateInput} from '../DateInput';
import {Field, type InputSize, type InputStatus} from '../Field';
import {TimeInput, type ISOTimeString} from '../TimeInput';

export type ISODateTimeString = `${ISODateString}T${ISOTimeString}`;

export interface DateTimeInputProps {
  className?: string;
  'data-testid'?: string;
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  description?: ReactNode;
  hasClear?: boolean;
  hasSeconds?: boolean;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isLoading?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelTooltip?: ReactNode;
  max?: ISODateTimeString;
  min?: ISODateTimeString;
  numberOfMonths?: 1 | 2;
  onChange: (value: ISODateTimeString | undefined) => void;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  status?: InputStatus;
  style?: CSSProperties;
  value?: ISODateTimeString;
}

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
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  status,
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

  return (
    <Field
      description={description}
      inputId={fieldId}
      isDisabled={isDisabled}
      isLabelHidden={isLabelHidden}
      isOptional={isOptional}
      isRequired={isRequired}
      label={label}
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
