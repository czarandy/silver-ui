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
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import {mergeRefs} from '../../internal/mergeRefs';
import type {FieldNecessity, InputStatus} from '../Field';
import {fieldRecipe} from '../Field/Field.recipe';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Item} from '../Item';
import {Spinner} from '../Spinner';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';

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
} & FieldNecessity;

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  boxWrap: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    borderRadius: 'sm',
    bg: 'bg',
    color: 'fg.onPrimary',
    pointerEvents: 'none',
    _peerFocusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  boxChecked: css({
    bg: 'primary',
    borderColor: 'primary',
  }),
  boxDisabled: css({
    opacity: 0.55,
  }),
  boxSize: {
    sm: css({w: '4.5', h: '4.5'}),
    md: css({w: '5.5', h: '5.5'}),
  },
  icon: css({
    w: '70%',
    h: '70%',
  }),
  label: css({
    cursor: 'pointer',
  }),
  labelDisabled: css({
    cursor: 'not-allowed',
  }),
  indicator: css({
    fontWeight: 'normal',
    color: 'fg.muted',
  }),
  tooltipIcon: css({
    display: 'inline-flex',
    color: 'fg.muted',
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
  endContent,
  endContentPosition = 'inline',
  htmlName,
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
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: CheckboxInputProps): React.JSX.Element {
  const inputId = useId();
  const descriptionId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(
    isReactNode(description) ? descriptionId : undefined,
    statusMessageID,
  );
  const isIndeterminate = value === 'indeterminate';
  const isChecked = value === true;
  const isCheckedOrIndeterminate = isChecked || isIndeterminate;

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;

  const control = (
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
        name={htmlName}
        onBlur={onBlur}
        onChange={event => {
          if (isReadOnly) {
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
          styles.boxSize[size],
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
  );

  const labelContent = (
    <>
      {labelIcon != null ? (
        <Icon color="secondary" icon={labelIcon} size="sm" />
      ) : null}
      {label}
      {statusText != null ? (
        <Text as="span" className={styles.indicator} type="supporting">
          <span aria-hidden="true"> · </span>
          {statusText}
        </Text>
      ) : null}
      {isReactNode(labelTooltip) ? (
        <Tooltip content={labelTooltip}>
          <span className={styles.tooltipIcon}>
            <Icon icon={Info} size="sm" />
          </span>
        </Tooltip>
      ) : null}
    </>
  );

  const labelNode = (
    <label
      className={cx(
        styles.label,
        isDisabled ? styles.labelDisabled : undefined,
      )}
      htmlFor={inputId}>
      {isLabelHidden ? (
        <VisuallyHidden>{labelContent}</VisuallyHidden>
      ) : (
        labelContent
      )}
    </label>
  );

  const statusNode =
    status?.message != null ? (
      <div
        aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        className={
          fieldRecipe({
            statusType: status.type,
            statusVariant: 'detached',
          }).status
        }
        id={statusMessageID}
        role={status.type === 'error' ? 'alert' : 'status'}>
        {status.message}
      </div>
    ) : null;

  const item = (
    <Item
      description={
        isReactNode(description) ? (
          <span id={descriptionId}>{description}</span>
        ) : undefined
      }
      endContent={endContent}
      endContentPosition={endContentPosition}
      isDisabled={isDisabled}
      label={labelNode}
      leadingContent={control}
      startContent={startContent}
    />
  );

  return (
    <div className={cx(styles.root, className)} style={style}>
      {item}
      {statusNode}
    </div>
  );
}

CheckboxInput.displayName = 'CheckboxInput';
