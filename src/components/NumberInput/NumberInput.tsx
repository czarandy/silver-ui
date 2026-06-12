import {X} from 'lucide-react';
import {
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from 'components/Field/inputUtils';
import {useInputGroup} from 'components/InputGroup';
import {Spinner} from 'components/Spinner';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import isReactNode from '../../internal/isReactNode';
import {
  Field,
  getNecessity,
  type FieldNecessity,
  type InputSize,
  type InputStatus,
} from '../Field';
import {Icon, type IconComponent} from '../Icon';

type NumberInputBaseProps = {
  /**
   * HTML autocomplete attribute value.
   */
  autoComplete?: string;
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
   * Inline styles applied to the input wrapper.
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
  | NumberInputClearableProps
  | NumberInputNonClearableProps;

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

/**
 * Numeric input field with optional min/max bounds and step control.
 */
export function NumberInput({
  label,
  value,
  onChange,
  size: sizeProp = 'md',
  description,
  endContent,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isIntegerOnly = false,
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
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputGroup = useInputGroup();
  const effectiveDisabled = isDisabled || inputGroup?.isDisabled === true;
  const size = inputGroup?.size ?? sizeProp;
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const displayValue = useMemo(() => {
    if (pendingInput != null) {
      return pendingInput;
    }
    return value == null ? '' : String(value);
  }, [pendingInput, value]);

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
        autoComplete={autoComplete}
        // eslint-disable-next-line jsx-a11y-x/no-autofocus
        autoFocus={hasAutoFocus}
        className={inputStyles.control}
        data-autofocus={hasAutoFocus || undefined}
        data-testid={dataTestId}
        disabled={effectiveDisabled}
        id={inputId}
        max={max ?? undefined}
        min={min ?? undefined}
        name={htmlName}
        onBlur={event => {
          if (pendingInput != null) {
            const parsed = parseNumberInput(pendingInput, {isIntegerOnly});
            if (parsed != null) {
              const clamped = clampValue(parsed, min, max);
              if (clamped !== value) {
                onChange(clamped);
              }
            }
            setPendingInput(null);
          }
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
          if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            onEnter?.();
          }
          onKeyDown?.(event);
        }}
        placeholder={placeholder}
        ref={ref}
        required={isRequired ?? undefined}
        step={step ?? undefined}
        type="number"
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
