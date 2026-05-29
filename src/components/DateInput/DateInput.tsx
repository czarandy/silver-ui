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
  onChange?: (value: ISODateString | undefined) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  status?: InputStatus;
  style?: CSSProperties;
  value?: ISODateString;
}

function formatDate(value: ISODateString | undefined): string {
  return value == null
    ? ''
    : plainDateFormat(plainDateFromISO(value), DATE_FORMAT_LONG);
}

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
