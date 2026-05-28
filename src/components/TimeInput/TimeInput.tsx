import {Clock, X} from 'lucide-react';
import {useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {cx} from '../../internal/cx';
import {Field, inputStyles, type InputSize, type InputStatus} from '../Field';
import {
  getDescribedBy,
  getStatusIcon,
  getStatusMessageID,
} from '../Field/inputUtils';
import {Spinner} from '../Spinner';

export type ISOTimeString =
  | `${number}${number}:${number}${number}`
  | `${number}${number}:${number}${number}:${number}${number}`;

export interface TimeInputProps {
  className?: string;
  'data-testid'?: string;
  description?: ReactNode;
  hasAutoFocus?: boolean;
  hasClear?: boolean;
  hasSeconds?: boolean;
  htmlName?: string;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isLoading?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelTooltip?: ReactNode;
  max?: ISOTimeString;
  min?: ISOTimeString;
  onChange?: (value: ISOTimeString | undefined) => void;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
  status?: InputStatus;
  step?: number;
  style?: CSSProperties;
  value?: ISOTimeString;
}

export function TimeInput({
  label,
  value,
  onChange,
  hasSeconds = false,
  hasClear = false,
  hasAutoFocus = false,
  min,
  max,
  step,
  size = 'md',
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  htmlName,
  status,
  labelTooltip,
  placeholder = 'Select a time',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TimeInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);

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
          inputStyles.size[size],
          status != null ? inputStyles.status[status.type] : undefined,
          isDisabled ? inputStyles.wrapperDisabled : undefined,
          className,
        )}
        style={style}>
        <span className={inputStyles.iconSlot}>
          <Clock aria-hidden="true" />
        </span>
        <input
          aria-busy={isLoading || undefined}
          aria-describedby={describedBy}
          aria-invalid={status?.type === 'error' || undefined}
          aria-required={isRequired || undefined}
          // eslint-disable-next-line jsx-a11y-x/no-autofocus
          autoFocus={hasAutoFocus}
          className={inputStyles.control}
          data-testid={dataTestId}
          disabled={isDisabled || isLoading}
          id={inputId}
          max={max}
          min={min}
          name={htmlName}
          onChange={event =>
            onChange?.(
              event.target.value === ''
                ? undefined
                : (event.target.value as ISOTimeString),
            )
          }
          placeholder={placeholder}
          ref={ref}
          step={step ?? (hasSeconds ? 1 : 60)}
          type="time"
          value={value ?? ''}
        />
        {hasClear && value != null && !isDisabled ? (
          <button
            aria-label={`Clear ${label}`}
            className={inputStyles.clearButton}
            onClick={() => onChange?.(undefined)}
            type="button">
            <X aria-hidden="true" />
          </button>
        ) : null}
        {isLoading ? <Spinner size="sm" /> : null}
        {status != null ? (
          <span className={inputStyles.iconSlot}>
            {getStatusIcon(status.type)}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

TimeInput.displayName = 'TimeInput';
