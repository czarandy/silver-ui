'use client';

import {ChevronDown, ChevronUp, X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
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
import {useInputGroup} from 'components/InputGroup';
import {numberInputRecipe} from 'components/NumberInput/NumberInput.recipe';
import {Spinner} from 'components/Spinner';
import {useResolvedSize} from 'internal/SizeContext';
import {isComposingEvent} from 'internal/isComposingEvent';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

type NumberInputBaseProps = {
  /**
   * HTML autocomplete attribute value.
   */
  autoComplete?: string;
  /**
   * Additional CSS class names applied to the field root, or to the input
   * wrapper when the input is inside an `InputGroup`.
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
   * Content rendered after the input, before the status icon.
   */
  endContent?: ReactNode;
  /**
   * Whether to focus the input on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
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
   * Whether to restrict input to integer values only.
   * @default false
   */
  isIntegerOnly?: boolean;
  /**
   * Whether scrolling the mouse wheel over the focused input changes its
   * value.
   * @default false
   */
  isWheelEnabled?: boolean;
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
   * Field label.
   */
  label: string;
  /**
   * Icon rendered beside the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Maximum allowed value.
   */
  max?: number | null;
  /**
   * Minimum allowed value.
   */
  min?: number | null;
  /**
   * Called when the input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when Enter is pressed.
   */
  onEnter?: () => void;
  /**
   * Called when the input receives focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Keyboard event handler for the input.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Placeholder text.
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
   * Icon shown before the input.
   */
  startIcon?: IconComponent;
  /**
   * Validation status displayed below the input.
   */
  status?: InputStatus;
  /**
   * Step increment for the number input.
   */
  step?: number | null;
  /**
   * Inline styles applied to the field root, or to the input wrapper when the
   * input is inside an `InputGroup`.
   */
  style?: CSSProperties;
  /**
   * Unit label displayed after the input value.
   */
  units?: string | null;
  /**
   * Controlled numeric value.
   */
  value: number | null;
} & FieldNecessity;

type NumberInputNonClearableProps = NumberInputBaseProps & {
  /**
   * Whether to show a clear button.
   */
  hasClear?: false;
  /**
   * Called when the numeric value changes.
   */
  onChange: (value: number) => void;
};

type NumberInputClearableProps = NumberInputBaseProps & {
  /**
   * Whether to show a clear button.
   */
  hasClear: true;
  /**
   * Called when the numeric value changes or is cleared.
   */
  onChange: (value: number | null) => void;
};

export type NumberInputProps =
  NumberInputClearableProps | NumberInputNonClearableProps;

const styles = {
  units: css({
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
  }),
} as const;

function parseNumberInput(
  input: string,
  options: {isIntegerOnly: boolean},
): number | null {
  const trimmed = input.trim();
  if (trimmed === '' || trimmed === '-') {
    return null;
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number)) {
    return null;
  }
  if (options.isIntegerOnly && !Number.isInteger(number)) {
    return null;
  }
  return number;
}

function clampValue(
  value: number,
  min?: number | null,
  max?: number | null,
): number {
  let clamped = value;
  if (min != null && clamped < min) {
    clamped = min;
  }
  if (max != null && clamped > max) {
    clamped = max;
  }
  return clamped;
}

function getDecimalPlaces(value: number): number {
  const [coefficient, exponent = '0'] = value.toString().split('e');
  const decimalPlaces = coefficient.split('.')[1]?.length ?? 0;
  return Math.max(0, decimalPlaces - Number(exponent));
}

function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const rounded = Number(value.toFixed(decimalPlaces));
  return rounded === 0 ? 0 : rounded;
}

function getEffectiveStep(step?: number | null): number {
  return step != null && Number.isFinite(step) && step > 0 ? step : 1;
}

function getSteppedValue({
  currentValue,
  direction,
  isIntegerOnly,
  max,
  min,
  step,
}: {
  currentValue: number | null;
  direction: -1 | 1;
  isIntegerOnly: boolean;
  max?: number | null;
  min?: number | null;
  step?: number | null;
}): number | null {
  const effectiveStep = getEffectiveStep(step);
  let nextValue: number;

  if (currentValue == null) {
    nextValue = direction === 1 ? (min ?? 0) : (max ?? 0);
  } else {
    const stepBase = min ?? 0;
    const stepPosition = (currentValue - stepBase) / effectiveStep;
    const nearestStepPosition = Math.round(stepPosition);
    const isAlignedToStep = Math.abs(stepPosition - nearestStepPosition) < 1e-9;
    const nextStepPosition = isAlignedToStep
      ? nearestStepPosition + direction
      : direction === 1
        ? Math.ceil(stepPosition)
        : Math.floor(stepPosition);
    const decimalPlaces = Math.max(
      getDecimalPlaces(currentValue),
      getDecimalPlaces(effectiveStep),
      getDecimalPlaces(stepBase),
      min == null ? 0 : getDecimalPlaces(min),
      max == null ? 0 : getDecimalPlaces(max),
    );
    nextValue = roundToDecimalPlaces(
      stepBase + nextStepPosition * effectiveStep,
      decimalPlaces,
    );
  }

  const clamped = clampValue(nextValue, min, max);
  if (!Number.isFinite(clamped)) {
    return null;
  }
  if (isIntegerOnly && !Number.isInteger(clamped)) {
    return null;
  }
  return clamped;
}

/**
 * Numeric input field with optional min/max bounds and step control.
 */
export function NumberInput({
  label,
  value,
  onChange,
  size: sizeProp,
  description,
  endContent,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isIntegerOnly = false,
  isWheelEnabled = false,
  isLoading = false,
  hasClear,
  hasAutoFocus = false,
  htmlName,
  autoComplete,
  min,
  max,
  step,
  units,
  status,
  labelIcon,
  labelTooltip,
  startIcon,
  placeholder,
  onFocus,
  onBlur,
  onEnter,
  onKeyDown,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: NumberInputProps): React.JSX.Element {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputGroup = useInputGroup();
  const fieldset = useFieldset();
  const effectiveDisabled =
    isDisabled ||
    inputGroup?.isDisabled === true ||
    fieldset?.isDisabled === true;
  const size = useResolvedSize(inputGroup?.size, sizeProp);
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;
  const numberInputStyles = numberInputRecipe({size});
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const displayValue = useMemo(() => {
    if (pendingInput != null) {
      return pendingInput;
    }
    return value == null ? '' : String(value);
  }, [pendingInput, value]);

  const commitPendingInput = useCallback(() => {
    if (pendingInput == null) {
      return;
    }

    const parsed = parseNumberInput(pendingInput, {isIntegerOnly});
    if (parsed != null) {
      const clamped = clampValue(parsed, min, max);
      if (clamped !== value) {
        onChange(clamped);
      }
    } else if (
      hasClear === true &&
      pendingInput.trim() === '' &&
      value != null
    ) {
      onChange(null);
    }
    setPendingInput(null);
  }, [hasClear, isIntegerOnly, max, min, onChange, pendingInput, value]);

  const parsedDisplayValue = useMemo(
    () => parseNumberInput(displayValue, {isIntegerOnly}),
    [displayValue, isIntegerOnly],
  );
  const valueForStepping =
    pendingInput == null
      ? value
      : pendingInput.trim() === ''
        ? null
        : (parsedDisplayValue ?? value);

  const changeValue = useCallback(
    (nextValue: number): void => {
      setPendingInput(null);
      if (nextValue !== value) {
        onChange(nextValue);
      }
    },
    [onChange, value],
  );

  const stepValue = useCallback(
    (direction: -1 | 1): void => {
      const nextValue = getSteppedValue({
        currentValue: valueForStepping,
        direction,
        isIntegerOnly,
        max,
        min,
        step,
      });
      if (nextValue != null) {
        changeValue(nextValue);
      }
    },
    [changeValue, isIntegerOnly, max, min, step, valueForStepping],
  );

  const decrementValue = getSteppedValue({
    currentValue: valueForStepping,
    direction: -1,
    isIntegerOnly,
    max,
    min,
    step,
  });
  const incrementValue = getSteppedValue({
    currentValue: valueForStepping,
    direction: 1,
    isIntegerOnly,
    max,
    min,
    step,
  });
  const isDecrementDisabled =
    effectiveDisabled ||
    decrementValue == null ||
    decrementValue === valueForStepping;
  const isIncrementDisabled =
    effectiveDisabled ||
    incrementValue == null ||
    incrementValue === valueForStepping;

  useEffect(() => {
    const input = inputRef.current;
    if (!isWheelEnabled || input == null) {
      return;
    }

    const handleWheel = (event: WheelEvent): void => {
      if (
        effectiveDisabled ||
        document.activeElement !== input ||
        event.deltaY === 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return;
      }
      event.preventDefault();
      stepValue(event.deltaY < 0 ? 1 : -1);
    };

    input.addEventListener('wheel', handleWheel, {passive: false});
    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  }, [effectiveDisabled, isWheelEnabled, stepValue]);

  const necessity = getNecessity(isOptional, isRequired);

  const inputWrapper = (
    <div
      className={cx(
        inputRecipe({
          size,
          status: effectiveStatusType,
          isDisabled: effectiveDisabled,
        }),
        inputGroup != null ? className : undefined,
      )}
      style={inputGroup != null ? style : undefined}>
      {startIcon != null ? (
        <span className={inputStyles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
      ) : null}
      <input
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-label={inputGroup != null ? label : undefined}
        aria-required={isRequired ?? undefined}
        aria-valuemax={max ?? undefined}
        aria-valuemin={min ?? undefined}
        aria-valuenow={parsedDisplayValue ?? undefined}
        autoComplete={autoComplete}
        // eslint-disable-next-line jsx-a11y-x/no-autofocus
        autoFocus={hasAutoFocus}
        className={inputStyles.control}
        data-autofocus={hasAutoFocus || undefined}
        data-testid={dataTestId}
        disabled={effectiveDisabled}
        id={inputId}
        inputMode={isIntegerOnly ? 'numeric' : 'decimal'}
        name={htmlName}
        onBlur={event => {
          commitPendingInput();
          onBlur?.(event);
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const nextValue = event.target.value;
          setPendingInput(nextValue);
          const parsed = parseNumberInput(nextValue, {isIntegerOnly});
          if (parsed != null) {
            const clamped = clampValue(parsed, min, max);
            if (clamped !== value) {
              onChange(clamped);
            }
          }
        }}
        onFocus={onFocus}
        onKeyDown={event => {
          if (!isComposingEvent(event)) {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              stepValue(1);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              stepValue(-1);
            } else if (
              event.key === 'Home' &&
              min != null &&
              Number.isFinite(min) &&
              (!isIntegerOnly || Number.isInteger(min))
            ) {
              event.preventDefault();
              changeValue(min);
            } else if (
              event.key === 'End' &&
              max != null &&
              Number.isFinite(max) &&
              (!isIntegerOnly || Number.isInteger(max))
            ) {
              event.preventDefault();
              changeValue(max);
            } else if (event.key === 'Enter') {
              commitPendingInput();
              onEnter?.();
            }
          }
          onKeyDown?.(event);
        }}
        placeholder={placeholder}
        ref={mergeRefs(ref, inputRef)}
        required={isRequired ?? undefined}
        role="spinbutton"
        type="text"
        value={displayValue}
      />
      {units != null ? <span className={styles.units}>{units}</span> : null}
      {hasClear === true && value != null && !effectiveDisabled ? (
        <Button
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={() => onChange(null)}
          size="sm"
          variant="ghost"
        />
      ) : null}
      {endContent}
      {isLoading ? <Spinner size="sm" /> : null}
      {status != null ? (
        <span className={inputStyles.iconSlot}>
          {getStatusIcon(status.type)}
        </span>
      ) : null}
      <span className={numberInputStyles.stepper}>
        <button
          aria-label="Increment value"
          className={numberInputStyles.stepperButton}
          disabled={isIncrementDisabled}
          onClick={() => {
            inputRef.current?.focus({preventScroll: true});
            stepValue(1);
          }}
          onPointerDown={event => {
            event.preventDefault();
          }}
          tabIndex={-1}
          type="button">
          <Icon icon={ChevronUp} size="sm" />
        </button>
        <button
          aria-label="Decrement value"
          className={numberInputStyles.stepperButton}
          disabled={isDecrementDisabled}
          onClick={() => {
            inputRef.current?.focus({preventScroll: true});
            stepValue(-1);
          }}
          onPointerDown={event => {
            event.preventDefault();
          }}
          tabIndex={-1}
          type="button">
          <Icon icon={ChevronDown} size="sm" />
        </button>
      </span>
    </div>
  );

  if (inputGroup != null) {
    return inputWrapper;
  }

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
      {inputWrapper}
    </Field>
  );
}

NumberInput.displayName = 'NumberInput';
