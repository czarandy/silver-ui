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
import {Field, type FieldNecessity, type InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';

export type CheckboxInputSize = 'sm' | 'md';
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
   * Field label text.
   */
  label: string;
  /**
   * Optional content shown before the label.
   */
  labelIcon?: IconComponent;
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
   * Ref forwarded to the input element.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Visual size of the checkbox.
   * @default 'md'
   */
  size?: CheckboxInputSize;
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
} & FieldNecessity;

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
    borderColor: 'border.emphasized',
    borderRadius: 'sm',
    bg: 'bg',
    color: 'fg.onPrimary',
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

/**
 * A checkbox input with label, description, and validation support.
 */
export function CheckboxInput({
  label,
  value,
  onChange,
  description,
  isLabelHidden = false,
  isOptional,
  isRequired,
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

  const necessity: FieldNecessity = {isOptional, isRequired};

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
              onChange(event.target.checked, event);
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
              <Icon className={styles.icon} icon={Minus} />
            ) : isChecked ? (
              <Icon className={styles.icon} icon={Check} />
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
            {...necessity}
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
