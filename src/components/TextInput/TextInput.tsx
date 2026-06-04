import {X} from 'lucide-react';
import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {
  Field,
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
import {Icon, type IconComponent} from '../Icon';
import {useInputGroup} from '../InputGroup';
import {Spinner} from '../Spinner';

export type TextInputType = 'email' | 'password' | 'text';

export type TextInputProps = {
  /**
   * HTML autocomplete hint for the browser.
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
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Content rendered after the input, before the status icon.
   */
  endContent?: ReactNode;
  /**
   * Whether to focus the input on mount.
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a clear button when the input has a value.
   */
  hasClear?: boolean;
  /**
   * HTML name attribute.
   */
  htmlName?: string;
  /**
   * Whether the input is disabled.
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   */
  isLabelHidden?: boolean;
  /**
   * Whether the input is loading.
   */
  isLoading?: boolean;
  /**
   * Field label.
   */
  label: string;
  /**
   * Icon shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip shown beside the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Called when the input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called with the next string value.
   */
  onChange: (
    value: string,
    event: ChangeEvent<HTMLInputElement> | null,
  ) => void;
  /**
   * Called when Enter is pressed.
   */
  onEnter?: () => void;
  /**
   * Called when the input gains focus.
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
   */
  size?: InputSize;
  /**
   * Icon shown before the input.
   */
  startIcon?: IconComponent;
  /**
   * Status displayed on the field.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the wrapper.
   */
  style?: CSSProperties;
  /**
   * HTML input type.
   */
  type?: TextInputType;
  /**
   * Controlled input value.
   */
  value: string;
} & FieldNecessity;

/**
 * Single-line text input field.
 */
export function TextInput({
  autoComplete,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  size: sizeProp = 'md',
  placeholder,
  description,
  endContent,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  hasClear = false,
  hasAutoFocus = false,
  htmlName,
  status,
  labelIcon,
  labelTooltip,
  startIcon,
  onEnter,
  onKeyDown,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TextInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputGroup = useInputGroup();
  const effectiveDisabled = isDisabled || inputGroup?.isDisabled === true;
  const size = inputGroup?.size ?? sizeProp;
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;

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
        name={htmlName}
        onBlur={onBlur}
        onChange={event => onChange(event.target.value, event)}
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
        type={type}
        value={value}
      />
      {hasClear && value !== '' && !effectiveDisabled ? (
        <button
          aria-label={`Clear ${label}`}
          className={inputStyles.clearButton}
          onClick={() => onChange('', null)}
          type="button">
          <Icon icon={X} size="sm" />
        </button>
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
      isOptional={isOptional}
      isRequired={isRequired}
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

TextInput.displayName = 'TextInput';
