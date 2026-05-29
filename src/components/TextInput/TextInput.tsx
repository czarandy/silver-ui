import {X} from 'lucide-react';
import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {useInputGroup} from '../InputGroup';
import {Spinner} from '../Spinner';

export type TextInputType = 'email' | 'password' | 'text';

export interface TextInputProps {
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
   * Whether the field is optional.
   */
  isOptional?: boolean;
  /**
   * Whether the field is required.
   */
  isRequired?: boolean;
  /**
   * Field label.
   */
  label: string;
  /**
   * Tooltip shown beside the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Called with the next string value.
   */
  onChange?: (
    value: string,
    event: ChangeEvent<HTMLInputElement> | null,
  ) => void;
  /**
   * Called when Enter is pressed.
   */
  onEnter?: () => void;
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
   * Icon or content shown before the input.
   */
  startIcon?: ReactNode;
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
  value?: string;
}

/**
 * Single-line text input field.
 */
export function TextInput({
  label,
  value = '',
  onChange,
  type = 'text',
  size = 'md',
  placeholder,
  description,
  endContent,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  hasClear = false,
  hasAutoFocus = false,
  htmlName,
  status,
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

  const inputWrapper = (
    <div
      className={cx(
        inputStyles.wrapper,
        inputStyles.size[size],
        status != null ? inputStyles.status[status.type] : undefined,
        effectiveDisabled ? inputStyles.wrapperDisabled : undefined,
        className,
      )}
      style={style}>
      {startIcon != null ? (
        <span className={inputStyles.iconSlot}>{startIcon}</span>
      ) : null}
      <input
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-label={inputGroup != null ? label : undefined}
        aria-required={isRequired || undefined}
        // eslint-disable-next-line jsx-a11y-x/no-autofocus
        autoFocus={hasAutoFocus}
        className={inputStyles.control}
        data-testid={dataTestId}
        disabled={effectiveDisabled}
        id={inputId}
        name={htmlName}
        onChange={event => onChange?.(event.target.value, event)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            onEnter?.();
          }
          onKeyDown?.(event);
        }}
        placeholder={placeholder}
        ref={ref}
        type={type}
        value={value}
      />
      {hasClear && value !== '' && !effectiveDisabled ? (
        <button
          aria-label={`Clear ${label}`}
          className={inputStyles.clearButton}
          onClick={() => onChange?.('', null)}
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
      {inputWrapper}
    </Field>
  );
}

TextInput.displayName = 'TextInput';
