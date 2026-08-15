'use client';

import {Temporal} from '@js-temporal/polyfill';
import {Clock, X} from 'lucide-react';
import {
  useId,
  useEffect,
  useRef,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
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
import {Spinner} from 'components/Spinner';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

const styles = {
  input: css({
    '&::-webkit-calendar-picker-indicator': {
      display: 'none',
    },
  }),
} as const;

export type PlainTime = Temporal.PlainTime;

export type TimeInputProps = {
  /**
   * Additional CSS class names applied to the input wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the input element.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a clear button when a value is set.
   * @default false
   */
  hasClear?: boolean;
  /**
   * Whether the input includes a seconds field.
   * @default false
   */
  hasSeconds?: boolean;
  /**
   * HTML name attribute.
   */
  htmlName?: string;
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
   * Whether the input is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the value is displayed without allowing focus or interaction.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Field label.
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
   * Latest allowed time.
   */
  max?: PlainTime;
  /**
   * Earliest allowed time.
   */
  min?: PlainTime;
  /**
   * Called when the input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when the time value changes.
   */
  onChange: (value: PlainTime | null) => void;
  /**
   * Called when the input gains focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Placeholder text.
   * @default 'Select a time'
   */
  placeholder?: string;
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Step increment in seconds for the time picker.
   */
  step?: number;
  /**
   * Inline styles applied to the input wrapper.
   */
  style?: CSSProperties;
  /**
   * Controlled time value. Pass `null` for an empty input.
   */
  value: PlainTime | null;
} & FieldNecessity;

function toInputString(
  time: PlainTime | null | undefined,
  hasSeconds: boolean,
): string {
  if (time == null) {
    return '';
  }
  return time.toString({
    smallestUnit: hasSeconds ? 'second' : 'minute',
  });
}

function fromInputString(value: string): PlainTime | null {
  if (value === '') {
    return null;
  }
  try {
    return Temporal.PlainTime.from(value);
  } catch {
    return null;
  }
}

/**
 * Time picker input field with optional seconds granularity.
 */
export function TimeInput({
  label,
  value,
  onBlur,
  onChange,
  onFocus,
  hasSeconds = false,
  hasClear = false,
  hasAutoFocus = false,
  min,
  max,
  step,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  isReadOnly = false,
  htmlName,
  status,
  labelIcon,
  labelTooltip,
  placeholder = 'Select a time',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TimeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldset = useFieldset();
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);

  useEffect(() => {
    if (effectiveReadOnly) {
      inputRef.current?.blur();
    }
  }, [effectiveReadOnly]);

  const necessity = getNecessity(isOptional, isRequired);

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
        className={inputRecipe({
          size,
          status: status?.type,
          isDisabled: effectiveDisabled,
          isReadOnly: effectiveReadOnly,
        })}
        onClickCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }
        onFocusCapture={effectiveReadOnly ? blurReadOnlyInteraction : undefined}
        onKeyDownCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }
        onPointerDownCapture={
          effectiveReadOnly ? preventReadOnlyInteraction : undefined
        }>
        <span className={inputStyles.iconSlot}>
          <Icon icon={Clock} size="sm" />
        </span>
        <input
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || undefined}
          aria-required={isRequired ?? undefined}
          autoFocus={hasAutoFocus && !effectiveReadOnly}
          className={cx(inputStyles.control, styles.input)}
          data-autofocus={(hasAutoFocus && !effectiveReadOnly) || undefined}
          data-testid={dataTestId}
          disabled={effectiveDisabled}
          id={inputId}
          max={toInputString(max, hasSeconds)}
          min={toInputString(min, hasSeconds)}
          name={htmlName}
          onBlur={onBlur}
          onChange={event => {
            if (!effectiveReadOnly) {
              onChange(fromInputString(event.target.value));
            }
          }}
          onFocus={onFocus}
          placeholder={placeholder}
          readOnly={effectiveReadOnly}
          ref={mergeRefs(ref, inputRef)}
          step={step ?? (hasSeconds ? 1 : 60)}
          tabIndex={effectiveReadOnly ? -1 : undefined}
          type="time"
          value={toInputString(value, hasSeconds)}
        />
        {hasClear &&
        value != null &&
        !effectiveDisabled &&
        !effectiveReadOnly ? (
          <Button
            className={
              !isLoading && status == null ? inputStyles.clearButton : undefined
            }
            icon={X}
            isIconOnly
            label={`Clear ${label}`}
            onClick={() => onChange(null)}
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

TimeInput.displayName = 'TimeInput';
