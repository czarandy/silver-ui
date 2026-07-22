'use client';

import {
  useId,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type CSSProperties,
  type FocusEvent,
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
import {
  inputControlStyles,
  inputRecipe,
  inputStyles,
} from 'components/Field/inputStyles';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from 'components/Field/inputUtils';
import type {IconComponent} from 'components/Icon';
import {useInputGroup} from 'components/InputGroup';
import {pinInputRecipe} from 'components/PinInput/PinInput.recipe';
import useListFocus from 'hooks/useListFocus';
import {isComposingEvent} from 'internal/isComposingEvent';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {css} from 'styled-system/css';
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
   * Called when focus leaves the input's cells. Moving between cells does not
   * trigger it.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
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
   * Called when focus enters the input's cells. Moving between cells does not
   * trigger it.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
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
  onBlur,
  onChange,
  onComplete,
  onFocus,
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
  // True while focusCell moves focus, so handleFocus can tell programmatic
  // moves (already targeted correctly, but running against a render that
  // predates the parent echoing onChange) from user focus, which is checked
  // against the displayed value.
  const isProgrammaticFocusRef = useRef(false);
  // Whether the last committed value was complete; onComplete only fires on
  // a committed incomplete-to-complete transition.
  const wasCompleteRef = useRef(displayedValue.length === length);
  // The first empty cell, or the final cell when the code is complete: the
  // autofocus target and the group's single tab stop (other cells are reached
  // with the arrow keys, so Tab passes straight through the group).
  const activeCellIndex = Math.min(displayedValue.length, length - 1);
  // Merge the shared input chrome with this recipe's slot overrides in JS so
  // each property resolves to a single utility class; layering the classes
  // with cx would leave same-property conflicts (gap, paddings, flex,
  // fontSize) to be decided by stylesheet emission order, which varies
  // between Panda builds.
  const slots = pinInputRecipe.raw({size});
  const wrapperClassName = css(
    inputRecipe.raw({
      size,
      status: effectiveStatusType,
      isDisabled: effectiveDisabled,
    }),
    slots.wrapper,
  );
  const cellClassName = css(inputControlStyles, slots.cell);
  const statusIconClassName = cx(inputStyles.iconSlot, css(slots.statusIcon));

  const focusCell = (index: number): void => {
    const cell = cellsRef.current[Math.max(0, Math.min(index, length - 1))];
    if (cell == null) {
      return;
    }
    // focus() dispatches the focus event synchronously, so the flag wraps
    // just this call.
    isProgrammaticFocusRef.current = true;
    cell.focus();
    isProgrammaticFocusRef.current = false;
  };

  const isCell = (node: unknown): boolean =>
    cellsRef.current.some(cell => cell != null && cell === node);

  const handleFocus = (
    index: number,
    event: FocusEvent<HTMLInputElement>,
  ): void => {
    if (!isCell(event.relatedTarget)) {
      onFocus?.(event);
    }
    // The code fills without gaps, so a cell past the first empty one can
    // never be edited in place; redirect user focus there instead of letting
    // the next keystroke land in a different cell than the caret.
    if (!isProgrammaticFocusRef.current && index > displayedValue.length) {
      focusCell(displayedValue.length);
      return;
    }
    event.currentTarget.select();
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    if (!isCell(event.relatedTarget)) {
      onBlur?.(event);
    }
  };

  const {handleKeyDown: handleListKeyDown} = useListFocus({
    // Only the filled cells and the first empty one are reachable; the
    // focus-redirect in handleFocus enforces the same boundary for clicks.
    getItems: () =>
      cellsRef.current
        .slice(0, Math.min(displayedValue.length + 1, length))
        .filter(cell => cell != null),
    isLooping: false,
    orientation: 'horizontal',
  });

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (handleListKeyDown(event)) {
      return;
    }
    handleBackspace(index, event);
  };

  const commit = (
    nextValue: string,
    event: ChangeEvent<HTMLInputElement> | null,
  ): void => {
    onChange(nextValue, event);
    // Completion is tracked against the committed sequence in a ref, not the
    // displayed value: a controlled parent that echoes onChange asynchronously
    // (debounce, startTransition) leaves displayedValue stale, which would
    // re-fire onComplete for every edit of an already complete code.
    const isComplete = nextValue.length === length;
    if (isComplete && !wasCompleteRef.current) {
      onComplete?.(nextValue);
    }
    wasCompleteRef.current = isComplete;
  };

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const raw = event.target.value;
    const previous = displayedValue[index] ?? '';
    // The cells have no maxLength (it would truncate one-time-code autofill
    // to a single character), so typing in a filled cell whose selection was
    // collapsed yields the previous character plus the typed one; keep only
    // the typed character.
    const inserted =
      previous !== '' && raw.length === 2 && raw.includes(previous)
        ? raw.startsWith(previous)
          ? raw.slice(1)
          : raw.slice(0, 1)
        : raw;
    const characters = filterCharacters(inserted, type);
    if (characters === '') {
      if (raw === '' && index < displayedValue.length) {
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
      aria-label={inputGroup != null ? label : undefined}
      aria-labelledby={inputGroup == null ? labelId : undefined}
      className={cx(
        wrapperClassName,
        inputGroup != null ? className : undefined,
      )}
      data-testid={dataTestId}
      id={inputId}
      ref={inputGroup != null ? ref : undefined}
      role="group"
      style={inputGroup != null ? style : undefined}>
      {Array.from({length}, (_, index) => (
        <input
          aria-invalid={status?.type === 'error' || undefined}
          aria-label={`${type === 'numeric' ? 'Digit' : 'Character'} ${index + 1} of ${length}`}
          aria-required={isRequired ?? undefined}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={hasAutoFocus && index === activeCellIndex}
          className={cellClassName}
          data-autofocus={
            hasAutoFocus && index === activeCellIndex ? true : undefined
          }
          disabled={effectiveDisabled}
          inputMode={type === 'numeric' ? 'numeric' : 'text'}
          key={index}
          onBlur={handleBlur}
          onChange={event => handleChange(index, event)}
          onFocus={event => handleFocus(index, event)}
          onKeyDown={event => handleKeyDown(index, event)}
          onPaste={event => handlePaste(index, event)}
          pattern={type === 'numeric' ? '[0-9]*' : undefined}
          ref={element => {
            cellsRef.current[index] = element;
          }}
          tabIndex={index === activeCellIndex ? 0 : -1}
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
        <span className={statusIconClassName}>
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
      className={cx(css(slots.root), className)}
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
