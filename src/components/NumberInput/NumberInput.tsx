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
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';

interface NumberInputBaseProps {
  autoComplete?: string;
  className?: string;
  'data-testid'?: string;
  description?: ReactNode;
  hasAutoFocus?: boolean;
  htmlName?: string;
  isDisabled?: boolean;
  isIntegerOnly?: boolean;
  isLabelHidden?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelIcon?: ReactNode;
  labelTooltip?: ReactNode;
  max?: number | null;
  min?: number | null;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  startIcon?: ReactNode;
  status?: InputStatus;
  step?: number | null;
  style?: CSSProperties;
  units?: string | null;
  value?: number | null;
}

interface NumberInputNonClearableProps extends NumberInputBaseProps {
  hasClear?: false;
  onChange: (value: number) => void;
}

interface NumberInputClearableProps extends NumberInputBaseProps {
  hasClear: true;
  onChange: (value: number | null) => void;
}

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
  options: {isIntegerOnly: boolean; max?: number | null; min?: number | null},
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
  if (options.min != null && number < options.min) {
    return null;
  }
  if (options.max != null && number > options.max) {
    return null;
  }
  return number;
}

export function NumberInput({
  label,
  value,
  onChange,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isIntegerOnly = false,
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
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const displayValue = useMemo(() => {
    if (pendingInput != null) {
      return pendingInput;
    }
    return value == null ? '' : String(value);
  }, [pendingInput, value]);
  const isInputValid =
    pendingInput == null ||
    pendingInput.trim() === '' ||
    parseNumberInput(pendingInput, {min, max, isIntegerOnly}) != null;

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
      labelIcon={labelIcon}
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
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>{startIcon}</span>
        ) : null}
        <input
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || !isInputValid || undefined}
          aria-required={isRequired || undefined}
          autoComplete={autoComplete}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          max={max ?? undefined}
          min={min ?? undefined}
          name={htmlName}
          onBlur={event => {
            if (pendingInput != null) {
              const parsed = parseNumberInput(pendingInput, {
                min,
                max,
                isIntegerOnly,
              });
              if (parsed != null && parsed !== value) {
                onChange(parsed);
              }
              setPendingInput(null);
            }
            onBlur?.(event);
          }}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const nextValue = event.target.value;
            setPendingInput(nextValue);
            const parsed = parseNumberInput(nextValue, {
              min,
              max,
              isIntegerOnly,
            });
            if (parsed != null && parsed !== value) {
              onChange(parsed);
            }
          }}
          onFocus={onFocus}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              onEnter?.();
            }
            onKeyDown?.(event);
          }}
          placeholder={placeholder}
          ref={ref}
          step={step ?? undefined}
          type="number"
          value={displayValue}
        />
        {units != null ? <span className={styles.units}>{units}</span> : null}
        {hasClear === true && value != null && !isDisabled ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={() => onChange(null)}
            type="button">
            <X aria-hidden="true" />
          </button>
        ) : null}
        {status != null ? (
          <span className={inputStyles.iconSlot}>
            {getStatusIcon(status.type)}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

NumberInput.displayName = 'NumberInput';
