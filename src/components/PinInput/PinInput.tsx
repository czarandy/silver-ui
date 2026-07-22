'use client';

import {
  useId,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
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
import type {IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {pinInputRecipe} from 'components/PinInput/PinInput.recipe';
import {isComposingEvent} from 'internal/isComposingEvent';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export type PinInputType = 'numeric' | 'alphanumeric';

export type PinInputProps = {
  /**
   * Additional CSS class names applied to the field root, or to the input
   * wrapper when the input is inside an `InputGroup`.
   */
  className?: string;
  /**
   * Test ID applied to the input wrapper.
   */
  'data-testid'?: string;
  /**
   * Supporting text rendered below the label.
   */
  description?: ReactNode;
  /**
   * Whether to focus the first empty cell on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to obscure the code's characters.
   * @default false
   */
  hasMask?: boolean;
  /**
   * HTML name attribute for the joined hidden form input.
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
   * Number of code cells.
   * @default 6
   */
  length?: number;
  /**
   * Called with the next joined value.
   */
  onChange: (
    value: string,
    event: ChangeEvent<HTMLInputElement> | null,
  ) => void;
  /**
   * Called when an edit transitions the code from incomplete to complete.
   */
  onComplete?: (value: string) => void;
  /**
   * Ref forwarded to the component's outermost element.
   */
  ref?: Ref<HTMLDivElement>;
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
   * Inline styles applied to the field root, or to the input wrapper when the
   * input is inside an `InputGroup`.
   */
  style?: CSSProperties;
  /**
   * Characters accepted from user input.
   * @default 'numeric'
   */
  type?: PinInputType;
  /**
   * Controlled joined code value.
   */
  value: string;
} & FieldNecessity;

const DEFAULT_LENGTH = 6;

function filterCharacters(value: string, type: PinInputType): string {
  return type === 'numeric'
    ? value.replace(/[^0-9]/g, '')
    : value.replace(/[^a-zA-Z0-9]/g, '');
}

function replaceCharacters(
  value: string,
  characters: string,
  index: number,
  length: number,
): string {
  const start = Math.min(index, value.length);
  return (
    value.slice(0, start) +
    characters +
    value.slice(start + characters.length)
  ).slice(0, length);
}

/**
 * Controlled multi-cell input for one-time codes, PINs, and short
 * verification codes.
 */
export function PinInput({
  className,
  'data-testid': dataTestId,
  description,
  hasAutoFocus = false,
  hasMask = false,
  htmlName,
  isDisabled = false,
  isLabelHidden = false,
  isOptional,
  isRequired,
  label,
  labelIcon,
  labelTooltip,
  length: lengthProp = DEFAULT_LENGTH,
  onChange,
  onComplete,
  ref,
  size: sizeProp = 'md',
  status,
  style,
  type = 'numeric',
  value,
}: PinInputProps): React.JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    if (!Number.isInteger(lengthProp) || lengthProp < 1) {
      throw new Error(
        `PinInput: length must be a positive integer, received ${lengthProp}.`,
      );
    }
  }

  const length =
    Number.isInteger(lengthProp) && lengthProp > 0
      ? lengthProp
      : DEFAULT_LENGTH;
  const inputId = useId();
  const labelId = `${inputId}-label`;
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputGroup = useInputGroup();
  const effectiveDisabled = isDisabled || inputGroup?.isDisabled === true;
  const size = inputGroup?.size ?? sizeProp;
  const effectiveStatusType = status?.type ?? inputGroup?.statusType;
  const cellsRef = useRef<(HTMLInputElement | null)[]>([]);
  const displayedValue = value.slice(0, length);
  const autoFocusIndex = Math.min(displayedValue.length, length - 1);
  const classes = pinInputRecipe({size});

  const focusCell = (index: number): void => {
    cellsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const commit = (
    nextValue: string,
    event: ChangeEvent<HTMLInputElement> | null,
  ): void => {
    onChange(nextValue, event);
    if (displayedValue.length < length && nextValue.length === length) {
      onComplete?.(nextValue);
    }
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const characters = filterCharacters(event.target.value, type);
    if (characters === '') {
      if (event.target.value === '' && index < displayedValue.length) {
        commit(
          displayedValue.slice(0, index) + displayedValue.slice(index + 1),
          event,
        );
      }
      return;
    }

    const nextValue = replaceCharacters(
      displayedValue,
      characters,
      index,
      length,
    );
    commit(nextValue, event);
    focusCell(Math.min(index, displayedValue.length) + characters.length);
  };

  const handleBackspace = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key !== 'Backspace' || isComposingEvent(event)) {
      return;
    }

    event.preventDefault();
    // A filled cell clears in place so the user can retype it; only an empty
    // cell retreats to delete the previous character.
    const isFilled = index < displayedValue.length;
    const deleteIndex = isFilled ? index : index - 1;
    if (deleteIndex >= 0 && deleteIndex < displayedValue.length) {
      commit(
        displayedValue.slice(0, deleteIndex) +
          displayedValue.slice(deleteIndex + 1),
        null,
      );
    }
    focusCell(isFilled ? index : Math.max(0, index - 1));
  };

  const handlePaste = (
    index: number,
    event: ClipboardEvent<HTMLInputElement>,
  ): void => {
    event.preventDefault();
    const characters = filterCharacters(
      event.clipboardData.getData('text'),
      type,
    );
    if (characters === '') {
      return;
    }

    const nextValue = replaceCharacters(
      displayedValue,
      characters,
      index,
      length,
    );
    commit(nextValue, null);
    focusCell(Math.min(nextValue.length, length - 1));
  };

  const inputWrapper = (
    <div
      aria-describedby={describedBy}
      aria-invalid={status?.type === 'error' || undefined}
      aria-label={inputGroup != null ? label : undefined}
      aria-labelledby={inputGroup == null ? labelId : undefined}
      className={cx(
        inputRecipe({
          size,
          status: effectiveStatusType,
          isDisabled: effectiveDisabled,
        }),
        classes.wrapper,
        inputGroup != null ? className : undefined,
      )}
      data-testid={dataTestId}
      id={inputId}
      ref={inputGroup != null ? ref : undefined}
      role="group"
      style={inputGroup != null ? style : undefined}>
      {Array.from({length}, (_, index) => (
        <input
          aria-label={`${type === 'numeric' ? 'Digit' : 'Character'} ${index + 1} of ${length}`}
          aria-required={isRequired ?? undefined}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={hasAutoFocus && index === autoFocusIndex}
          className={cx(inputStyles.control, classes.cell)}
          data-autofocus={
            hasAutoFocus && index === autoFocusIndex ? true : undefined
          }
          disabled={effectiveDisabled}
          inputMode={type === 'numeric' ? 'numeric' : 'text'}
          key={index}
          maxLength={1}
          onChange={event => handleChange(index, event)}
          onFocus={event => event.currentTarget.select()}
          onKeyDown={event => handleBackspace(index, event)}
          onPaste={event => handlePaste(index, event)}
          pattern={type === 'numeric' ? '[0-9]*' : undefined}
          ref={element => {
            cellsRef.current[index] = element;
          }}
          required={isRequired ?? undefined}
          type={hasMask ? 'password' : 'text'}
          value={displayedValue[index] ?? ''}
        />
      ))}
      <input
        disabled={effectiveDisabled}
        name={htmlName}
        type="hidden"
        value={displayedValue}
      />
      {status != null ? (
        <span className={cx(inputStyles.iconSlot, classes.statusIcon)}>
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
      {...getNecessity(isOptional, isRequired)}
      label={label}
      labelAs="span"
      labelIcon={labelIcon}
      labelId={labelId}
      labelTooltip={labelTooltip}
      ref={ref}
      status={
        status == null ? undefined : {...status, messageID: statusMessageID}
      }
      style={style}>
      {inputWrapper}
    </Field>
  );
}

PinInput.displayName = 'PinInput';
