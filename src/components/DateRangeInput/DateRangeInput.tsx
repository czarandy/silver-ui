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
import type {DateRange, ISODateString} from '../../internal/dateTypes';
import {
  DATE_FORMAT_SHORT_WITH_YEAR,
  plainDateFormat,
  plainDateFromISO,
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

export type {DateRange, ISODateString} from '../../internal/dateTypes';

export interface DateRangeInputProps {
  className?: string;
  'data-testid'?: string;
  dateConstraints?: ReadonlyArray<(date: Date) => boolean>;
  description?: ReactNode;
  hasClear?: boolean;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isLoading?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelTooltip?: ReactNode;
  max?: ISODateString;
  min?: ISODateString;
  numberOfMonths?: 1 | 2;
  onChange?: (value: DateRange | undefined) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  status?: InputStatus;
  style?: CSSProperties;
  value?: DateRange;
}

function formatRange(value: DateRange | undefined): string {
  if (value == null) {
    return '';
  }
  return `${plainDateFormat(plainDateFromISO(value.start), DATE_FORMAT_SHORT_WITH_YEAR)} - ${plainDateFormat(plainDateFromISO(value.end), DATE_FORMAT_SHORT_WITH_YEAR)}`;
}

export function DateRangeInput({
  label,
  value,
  onChange,
  min,
  max,
  dateConstraints,
  numberOfMonths = 2,
  placeholder = 'Select a date range',
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
}: DateRangeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = useMemo(() => formatRange(value), [value]);

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
              max={max}
              min={min}
              mode="range"
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

DateRangeInput.displayName = 'DateRangeInput';
