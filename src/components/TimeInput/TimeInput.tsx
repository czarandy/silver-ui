'use client';

import {Temporal} from '@js-temporal/polyfill';
import {Clock, X} from 'lucide-react';
import {
  useId,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {buttonRecipe} from 'components/Button/Button.recipe';
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
import {timeInputRecipe} from 'components/TimeInput/TimeInput.recipe';
import {TimePickerPanel} from 'internal/TimePickerPanel';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {cx} from 'utils/cx';

const styles = timeInputRecipe();
const triggerStyles = buttonRecipe({
  variant: 'ghost',
  size: 'sm',
  iconOnly: true,
});

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
 * Editable time field with a clock-triggered column picker and optional seconds.
 * Picker changes preview in the field and are committed with Done; dismissal
 * discards pending changes.
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
  const [isOpen, setIsOpen] = useState(false);
  const [previewTime, setPreviewTime] = useState<PlainTime | null>(null);
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const fieldset = useFieldset();
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);

  useEffect(() => {
    if (effectiveDisabled || effectiveReadOnly) {
      inputRef.current?.blur();
      const frame = requestAnimationFrame(() => setIsOpen(false));
      return () => cancelAnimationFrame(frame);
    }
  }, [effectiveDisabled, effectiveReadOnly]);

  const necessity = getNecessity(isOptional, isRequired);

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
        <Popover
          content={
            isOpen ? (
              <TimePickerPanel
                hasSeconds={hasSeconds}
                max={max}
                min={min}
                onConfirm={time => {
                  onChange(time);
                  setIsOpen(false);
                  pickerTriggerRef.current?.focus();
                }}
                onPreviewChange={setPreviewTime}
                step={step}
                value={value}
              />
            ) : null
          }
          hasCloseButton={false}
          isEnabled={!effectiveDisabled && !effectiveReadOnly}
          isOpen={isOpen}
          label={`Choose ${label}`}
          onOpenChange={open => {
            setIsOpen(open);
            setPreviewTime(null);
          }}>
          {/* Avoid a focus-triggered tooltip opening during native popover focus restoration. */}
          <button
            aria-label={`Choose ${label}`}
            className={triggerStyles.root}
            disabled={effectiveDisabled || effectiveReadOnly}
            ref={pickerTriggerRef}
            type="button">
            <Icon icon={Clock} size="sm" />
          </button>
        </Popover>
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
          value={toInputString(
            isOpen ? (previewTime ?? value) : value,
            hasSeconds,
          )}
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
