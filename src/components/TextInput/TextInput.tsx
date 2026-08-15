'use client';

import {X} from 'lucide-react';
import {
  useId,
  useRef,
  type AriaAttributes,
  type AriaRole,
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
import {Spinner} from 'components/Spinner';
import {useResolvedSize} from 'internal/SizeContext';
import {isComposingEvent} from 'internal/isComposingEvent';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {
  blurReadOnlyInteraction,
  preventReadOnlyInteraction,
} from 'internal/readOnlyInteraction';
import {cx} from 'utils/cx';

export type TextInputType = 'email' | 'password' | 'tel' | 'text';

export type TextInputProps = {
  /**
   * Identifies the currently active element in a composite widget controlled
   * by the input.
   */
  'aria-activedescendant'?: AriaAttributes['aria-activedescendant'];
  /**
   * Indicates whether typing displays completion suggestions.
   */
  'aria-autocomplete'?: AriaAttributes['aria-autocomplete'];
  /**
   * Identifies the element controlled by the input.
   */
  'aria-controls'?: AriaAttributes['aria-controls'];
  /**
   * HTML autocomplete hint for the browser.
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
   * Supporting text rendered below the label.
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
   * Whether to show a clear button when the input has a value.
   * @default false
   */
  hasClear?: boolean;
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
   * ARIA role applied to the input element.
   */
  role?: AriaRole;
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
   * Inline styles applied to the field root, or to the input wrapper when the
   * input is inside an `InputGroup`.
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
  'aria-activedescendant': ariaActiveDescendant,
  'aria-autocomplete': ariaAutocomplete,
  'aria-controls': ariaControls,
  autoComplete,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  size: sizeProp,
  placeholder,
  description,
  endContent,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  isReadOnly = false,
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
  role,
}: TextInputProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
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
  const effectiveReadOnly =
    !effectiveDisabled &&
    (isReadOnly ||
      inputGroup?.isReadOnly === true ||
      fieldset?.isReadOnly === true);
  const size = useResolvedSize(inputGroup?.size, sizeProp);
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;

  const inputWrapper = (
    <div
      className={cx(
        inputRecipe({
          size,
          status: effectiveStatusType,
          isDisabled: effectiveDisabled,
          isReadOnly: effectiveReadOnly,
        }),
        inputGroup != null ? className : undefined,
      )}
      onClickCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
      onFocusCapture={effectiveReadOnly ? blurReadOnlyInteraction : undefined}
      onKeyDownCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
      onPointerDownCapture={
        effectiveReadOnly ? preventReadOnlyInteraction : undefined
      }
      style={inputGroup != null ? style : undefined}>
      {startIcon != null ? (
        <span className={inputStyles.iconSlot}>
          <Icon color="secondary" icon={startIcon} size="sm" />
        </span>
      ) : null}
      <input
        aria-activedescendant={ariaActiveDescendant}
        aria-autocomplete={ariaAutocomplete}
        aria-busy={isLoading || undefined}
        aria-controls={ariaControls}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-label={inputGroup != null ? label : undefined}
        aria-required={isRequired ?? undefined}
        autoComplete={autoComplete}
        autoFocus={hasAutoFocus && !effectiveReadOnly}
        className={inputStyles.control}
        data-autofocus={(hasAutoFocus && !effectiveReadOnly) || undefined}
        data-testid={dataTestId}
        disabled={effectiveDisabled}
        id={inputId}
        name={htmlName}
        onBlur={onBlur}
        onChange={event => {
          if (!effectiveReadOnly) {
            onChange(event.target.value, event);
          }
        }}
        onFocus={onFocus}
        onKeyDown={event => {
          if (event.key === 'Enter' && !isComposingEvent(event)) {
            onEnter?.();
          }
          onKeyDown?.(event);
        }}
        placeholder={placeholder}
        readOnly={effectiveReadOnly}
        ref={mergeRefs(ref, inputRef)}
        required={isRequired ?? undefined}
        role={role}
        tabIndex={effectiveReadOnly ? -1 : undefined}
        type={type}
        value={value}
      />
      {hasClear && value !== '' && !effectiveDisabled && !effectiveReadOnly ? (
        <Button
          className={
            !isNonEmptyReactNode(endContent) && !isLoading && status == null
              ? inputStyles.clearButton
              : undefined
          }
          icon={X}
          isIconOnly
          label={`Clear ${label}`}
          onClick={() => {
            onChange('', null);
            inputRef.current?.focus();
          }}
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
      isDisabled={effectiveDisabled}
      isLabelHidden={isLabelHidden}
      {...getNecessity(isOptional, isRequired)}
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
