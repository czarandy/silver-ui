import {CalendarIcon, X} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {DateRange} from '../../internal/dateTypes';
import {
  DATE_FORMAT_SHORT_WITH_YEAR,
  plainDateFormat,
  type PlainDate,
} from '../../internal/plainDate';
import {Button} from '../Button';
import {Calendar} from '../Calendar';
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
import type {IconComponent} from '../Icon';
import {Popover} from '../Popover';
import {Spinner} from '../Spinner';

export type {DateRange} from '../../internal/dateTypes';

const styles = {
  wrapper: css({ps: '1', gap: '1'}),
} as const;

export type DateRangeInputProps = {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
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
   * Number of calendar months shown in the popover.
   * @default 2
   */
  numberOfMonths?: 1 | 2;
  /**
   * Called when the selected date range changes.
   */
  onChange: (value: DateRange | undefined) => void;
  /**
   * Placeholder text shown when no range is selected.
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
   * Currently selected date range.
   */
  value: DateRange | undefined;
} & FieldNecessity;

function formatRange(value: DateRange | undefined): string {
  if (value == null) {
    return '';
  }
  return `${plainDateFormat(value.start, DATE_FORMAT_SHORT_WITH_YEAR)} - ${plainDateFormat(value.end, DATE_FORMAT_SHORT_WITH_YEAR)}`;
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
  getIsDateDisabled,
  numberOfMonths = 2,
  placeholder = 'Select a date range',
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
}: DateRangeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = useMemo(() => formatRange(value), [value]);

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
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
        )}>
        <Popover
          content={
            <Calendar
              getIsDateDisabled={getIsDateDisabled}
              max={max}
              min={min}
              mode="range"
              numberOfMonths={numberOfMonths}
              onChange={nextValue => {
                onChange(nextValue);
                setIsOpen(false);
              }}
              value={value}
              viewDate={value?.start}
            />
          }
          hasAutoFocus
          isEnabled={!isDisabled}
          isOpen={isOpen}
          label={`Choose ${label}`}
          onOpenChange={setIsOpen}
          padding={3}>
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
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          placeholder={placeholder}
          readOnly
          ref={ref}
          type="text"
          value={displayValue}
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

DateRangeInput.displayName = 'DateRangeInput';
