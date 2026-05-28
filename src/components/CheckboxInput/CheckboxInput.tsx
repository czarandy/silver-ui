import {Check, Minus} from 'lucide-react';
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
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {Field, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Spinner} from '../Spinner';

export type CheckboxInputSize = 'sm' | 'md';
export type CheckboxInputValue = boolean | 'indeterminate';

export interface CheckboxInputProps {
  className?: string;
  'data-testid'?: string;
  description?: ReactNode;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isLoading?: boolean;
  isOptional?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  label: string;
  labelIcon?: ReactNode;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
  size?: CheckboxInputSize;
  status?: InputStatus;
  style?: CSSProperties;
  value: CheckboxInputValue;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  row: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2',
  }),
  boxWrap: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    mt: '0.5',
  }),
  input: css({
    position: 'absolute',
    inset: 0,
    opacity: 0,
    cursor: 'pointer',
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  box: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.400',
    borderRadius: 'sm',
    bg: 'bg',
    color: 'white',
    pointerEvents: 'none',
    _peerFocusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  boxChecked: css({
    bg: 'primary',
    borderColor: 'primary',
  }),
  boxDisabled: css({
    opacity: 0.55,
  }),
  size: {
    sm: css({w: '4.5', h: '4.5'}),
    md: css({w: '5.5', h: '5.5'}),
  },
  icon: css({
    w: '70%',
    h: '70%',
  }),
  fieldContent: css({
    flex: 1,
    minW: 0,
  }),
} as const;

export function CheckboxInput({
  label,
  value,
  onChange,
  description,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  isLoading = false,
  status,
  labelIcon,
  size = 'md',
  onFocus,
  onBlur,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: CheckboxInputProps): React.JSX.Element {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const isIndeterminate = value === 'indeterminate';
  const isChecked = value === true;
  const isCheckedOrIndeterminate = isChecked || isIndeterminate;

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className={cx(styles.root, className)} style={style}>
      <div className={styles.row}>
        <span className={styles.boxWrap}>
          <input
            aria-busy={isLoading || undefined}
            aria-checked={isIndeterminate ? 'mixed' : undefined}
            aria-describedby={describedBy}
            aria-invalid={status?.type === 'error' || undefined}
            aria-readonly={isReadOnly || undefined}
            checked={isChecked}
            className={styles.input}
            data-testid={dataTestId}
            disabled={isDisabled}
            id={inputId}
            onBlur={onBlur}
            onChange={event => {
              if (isReadOnly || isLoading) {
                event.preventDefault();
                return;
              }
              onChange?.(event.target.checked, event);
            }}
            onFocus={onFocus}
            readOnly={isReadOnly}
            ref={mergeRefs(ref, inputRef)}
            required={isRequired}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className={cx(
              styles.box,
              styles.size[size],
              isCheckedOrIndeterminate ? styles.boxChecked : undefined,
              isDisabled ? styles.boxDisabled : undefined,
            )}>
            {isLoading ? (
              <Spinner
                size="sm"
                variant={isCheckedOrIndeterminate ? 'onMedia' : 'default'}
              />
            ) : isIndeterminate ? (
              <Minus className={styles.icon} />
            ) : isChecked ? (
              <Check className={styles.icon} />
            ) : null}
          </span>
        </span>
        <div className={styles.fieldContent}>
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
            status={
              status == null
                ? undefined
                : {...status, messageID: statusMessageID}
            }
            statusVariant="detached">
            <span />
          </Field>
        </div>
      </div>
    </div>
  );
}

CheckboxInput.displayName = 'CheckboxInput';
