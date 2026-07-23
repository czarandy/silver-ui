'use client';

import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type ClipboardEvent,
  type FocusEvent,
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
import {Icon, type IconComponent} from 'components/Icon';
import {Spinner} from 'components/Spinner';
import {Text} from 'components/Text';
import {useResolvedSize} from 'internal/SizeContext';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type TextAreaProps = {
  /**
   * Additional CSS class names applied to the textarea wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the textarea element.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether to focus the textarea on mount.
   * @default false
   */
  hasAutoFocus?: boolean;
  /**
   * Whether the browser spellcheck is enabled.
   * @default true
   */
  hasSpellCheck?: boolean;
  /**
   * HTML name attribute.
   */
  htmlName?: string;
  /**
   * Whether the textarea is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the textarea is loading.
   * @default false
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
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Maximum character count. Displays a counter when set.
   */
  maxLength?: number;
  /**
   * Called when the textarea loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /**
   * Called with the next string value.
   */
  onChange: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  /**
   * Called when the textarea receives focus.
   */
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /**
   * Called when content is pasted into the textarea.
   */
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  /**
   * Placeholder text.
   */
  placeholder?: string;
  /**
   * Ref forwarded to the textarea element.
   */
  ref?: Ref<HTMLTextAreaElement>;
  /**
   * Number of visible text rows.
   * @default 3
   */
  rows?: number;
  /**
   * Visual size.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Icon shown before the textarea.
   */
  startIcon?: IconComponent;
  /**
   * Validation status displayed below the textarea.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the textarea wrapper.
   */
  style?: CSSProperties;
  /**
   * Controlled textarea value.
   */
  value: string;
} & FieldNecessity;

const styles = {
  wrapper: css({
    alignItems: 'flex-start',
    py: '2',
  }),
  textarea: css({
    resize: 'vertical',
    minH: '20',
  }),
  counter: css({
    alignSelf: 'flex-end',
    mt: '1',
  }),
  counterOverLimit: css({
    color: 'status.error.fg',
  }),
} as const;

/**
 * Multi-line text input field with optional character counter.
 */
export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  size: sizeProp,
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
  isDisabled = false,
  isLoading = false,
  hasSpellCheck = true,
  hasAutoFocus = false,
  htmlName,
  status,
  labelIcon,
  labelTooltip,
  startIcon,
  placeholder,
  maxLength,
  onPaste,
  onFocus,
  onBlur,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TextAreaProps): React.JSX.Element {
  const size = useResolvedSize(sizeProp);
  const inputId = useId();
  const descriptionID = isNonEmptyReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const counterID = maxLength != null ? `${inputId}-counter` : undefined;
  const describedBy = getDescribedBy(descriptionID, statusMessageID, counterID);
  const isOverLimit = maxLength != null && value.length > maxLength;

  const necessity = getNecessity(isOptional, isRequired);

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
      <div
        className={cx(
          inputRecipe({
            size,
            status: status?.type,
            isDisabled,
          }),
          styles.wrapper,
        )}>
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>
            <Icon color="secondary" icon={startIcon} size="sm" />
          </span>
        ) : null}
        <textarea
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || isOverLimit || undefined}
          aria-required={isRequired ?? undefined}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={cx(inputStyles.control, styles.textarea)}
          data-autofocus={hasAutoFocus || undefined}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          maxLength={maxLength}
          name={htmlName}
          onBlur={onBlur}
          onChange={event => onChange(event.target.value, event)}
          onFocus={onFocus}
          onPaste={onPaste}
          placeholder={placeholder}
          ref={ref}
          rows={rows}
          spellCheck={hasSpellCheck}
          value={value}
        />
        {isLoading ? <Spinner size="sm" /> : null}
        {status != null ? (
          <span className={inputStyles.iconSlot}>
            {getStatusIcon(status.type)}
          </span>
        ) : null}
      </div>
      {maxLength != null ? (
        <Text
          as="span"
          className={cx(
            styles.counter,
            isOverLimit ? styles.counterOverLimit : undefined,
          )}
          color="secondary"
          id={counterID}
          type="supporting">
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </Field>
  );
}

TextArea.displayName = 'TextArea';
