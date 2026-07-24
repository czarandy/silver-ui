'use client';

import {Check, Info, Minus} from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {checkboxInputRecipe} from 'components/CheckboxInput/CheckboxInput.recipe';
import type {FieldNecessity, InputStatus} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {Spinner} from 'components/Spinner';
import {Tooltip} from 'components/Tooltip';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {NecessityIndicator} from 'internal/NecessityIndicator';
import {StatusMessage} from 'internal/StatusMessage';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

export type CheckboxInputSize = 'sm' | 'md' | 'lg';
export type CheckboxInputValue = boolean | 'indeterminate';

export type CheckboxInputProps = {
  /**
   * Additional CSS class names applied to the root element.
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
   * Content rendered after the label.
   */
  endContent?: ReactNode;
  /**
   * Where to place `endContent` within the item.
   * `'end'` pushes it to the trailing edge; `'inline'` keeps it next to the label.
   * @default 'inline'
   */
  endContentPosition?: 'end' | 'inline';
  /**
   * HTML name attribute for native form submission.
   */
  htmlName?: string;
  /**
   * HTML value attribute for native form submission.
   */
  htmlValue?: string;
  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the checkbox is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the checkbox is read-only.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Field label content.
   */
  label: ReactNode;
  /**
   * Optional content shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Called when the input loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when the checked state changes.
   */
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Called when the input receives focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Inner padding around the checkbox row.
   * @default 2
   */
  padding?: SpacingToken;
  /**
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size of the checkbox.
   * @default 'md'
   */
  size?: CheckboxInputSize;
  /**
   * Content rendered after the checkbox control and before the label.
   */
  startContent?: ReactNode;
  /**
   * Validation status displayed below the checkbox.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Current checked state: true, false, or 'indeterminate'.
   */
  value: CheckboxInputValue;
  /**
   * Width of the checkbox item.
   * @default 'full'
   */
  width?: 'auto' | 'full';
} & FieldNecessity;

/**
 * A checkbox input with label, description, and validation support.
 */
export function CheckboxInput({
  label,
  value,
  onChange,
  description,
  endContent,
  endContentPosition = 'inline',
  htmlName,
  htmlValue,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isReadOnly = false,
  isLoading = false,
  status,
  labelIcon,
  labelTooltip,
  size = 'md',
  startContent,
  onFocus,
  onBlur,
  padding = 2,
  className,
  'data-testid': dataTestId,
  style,
  ref,
  width = 'full',
}: CheckboxInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(
    isNonEmptyReactNode(description) ? descriptionId : undefined,
    statusMessageID,
  );
  const isIndeterminate = value === 'indeterminate';
  const isChecked = value === true;
  const isCheckedOrIndeterminate = isChecked || isIndeterminate;
  const classes = checkboxInputRecipe({
    size,
    isChecked: isCheckedOrIndeterminate,
    isDisabled,
  });

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const control = (
    <span className={classes.boxWrap}>
      <input
        aria-busy={isLoading || undefined}
        aria-checked={isIndeterminate ? 'mixed' : undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-readonly={isReadOnly || undefined}
        checked={isChecked}
        // `peer` is the marker class Panda's `_peerFocusVisible` selector on
        // the box targets (`.peer:is(:focus-visible,…) ~ &`); without it the
        // box's keyboard focus ring never renders.
        className={cx('peer', classes.input)}
        data-testid={dataTestId}
        disabled={isDisabled}
        id={inputId}
        name={htmlName}
        onBlur={onBlur}
        onChange={event => {
          if (isReadOnly) {
            event.preventDefault();
            return;
          }
          onChange(event.target.checked, event);
        }}
        onClick={event => {
          // For checkboxes the native toggle happens during `click`, before
          // `change` fires, so blocking only `onChange` lets the box flip
          // momentarily until React resets it. Preventing the click stops the
          // toggle outright — and covers label clicks and Space-key activation,
          // which both dispatch a click on the input.
          if (isReadOnly) {
            event.preventDefault();
          }
        }}
        onFocus={onFocus}
        readOnly={isReadOnly}
        ref={mergeRefs(ref, inputRef)}
        required={isRequired}
        type="checkbox"
        value={htmlValue}
      />
      <span aria-hidden="true" className={classes.box}>
        {isLoading ? (
          <Spinner
            size="sm"
            variant={isCheckedOrIndeterminate ? 'onMedia' : 'default'}
          />
        ) : isIndeterminate ? (
          <Icon className={classes.icon} icon={Minus} />
        ) : isChecked ? (
          <Icon className={classes.icon} icon={Check} />
        ) : null}
      </span>
    </span>
  );

  const labelContent = (
    <>
      {labelIcon != null ? (
        <Icon color="secondary" icon={labelIcon} size="sm" />
      ) : null}
      {label}
      <NecessityIndicator isOptional={isOptional} isRequired={isRequired} />
      {isNonEmptyReactNode(labelTooltip) ? (
        <Tooltip content={labelTooltip}>
          <span className={classes.tooltipIcon}>
            <Icon icon={Info} size="sm" />
          </span>
        </Tooltip>
      ) : null}
    </>
  );

  const labelNode = (
    <label className={classes.label} htmlFor={inputId}>
      {isLabelHidden ? (
        <VisuallyHidden>{labelContent}</VisuallyHidden>
      ) : (
        labelContent
      )}
    </label>
  );

  const statusNode = (
    <StatusMessage id={statusMessageID} status={status} variant="detached" />
  );

  const item = (
    <Item
      description={
        isNonEmptyReactNode(description) ? (
          <span id={descriptionId}>{description}</span>
        ) : undefined
      }
      endContent={endContent}
      endContentPosition={endContentPosition}
      isDisabled={isDisabled}
      label={labelNode}
      leadingContent={control}
      padding={padding}
      startContent={startContent}
      width={width}
    />
  );

  return (
    <div className={cx(classes.root, className)} style={style}>
      {item}
      {statusNode}
    </div>
  );
}

CheckboxInput.displayName = 'CheckboxInput';
