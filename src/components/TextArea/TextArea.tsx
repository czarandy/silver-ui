import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type ClipboardEvent,
  type FocusEvent,
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
import {Spinner} from '../Spinner';
import {Text} from '../Text';

export interface TextAreaProps {
  className?: string;
  'data-testid'?: string;
  description?: ReactNode;
  hasAutoFocus?: boolean;
  hasSpellCheck?: boolean;
  htmlName?: string;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isLoading?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelTooltip?: ReactNode;
  maxLength?: number;
  onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  ref?: Ref<HTMLTextAreaElement>;
  rows?: number;
  size?: InputSize;
  startIcon?: ReactNode;
  status?: InputStatus;
  style?: CSSProperties;
  value?: string;
}

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
} as const;

export function TextArea({
  label,
  value = '',
  onChange,
  rows = 3,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  hasSpellCheck = true,
  hasAutoFocus = false,
  htmlName,
  status,
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
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const counterID = maxLength != null ? `${inputId}-counter` : undefined;
  const describedBy = getDescribedBy(descriptionID, statusMessageID, counterID);
  const isOverLimit = maxLength != null && value.length > maxLength;

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
      <div
        className={cx(
          inputStyles.wrapper,
          styles.wrapper,
          inputStyles.size[size],
          status != null ? inputStyles.status[status.type] : undefined,
          isDisabled ? inputStyles.wrapperDisabled : undefined,
          className,
        )}
        style={style}>
        {startIcon != null ? (
          <span className={inputStyles.iconSlot}>{startIcon}</span>
        ) : null}
        <textarea
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || isOverLimit || undefined}
          aria-required={isRequired || undefined}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={cx(inputStyles.control, styles.textarea)}
          data-testid={dataTestId}
          disabled={isDisabled}
          id={inputId}
          name={htmlName}
          onBlur={onBlur}
          onChange={event => onChange?.(event.target.value, event)}
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
          className={styles.counter}
          color={isOverLimit ? 'active' : 'secondary'}
          id={counterID}
          type="supporting">
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </Field>
  );
}

TextArea.displayName = 'TextArea';
