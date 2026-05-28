import {Info} from 'lucide-react';
import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import type {InputStatus, InputStatusType} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon} from '../Icon';
import {Spinner} from '../Spinner';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';

export type SwitchLabelPosition = 'end' | 'start';
export type SwitchLabelSpacing = 'default' | 'spread';

export interface SwitchProps {
  /**
   * Additional CSS class names applied to the field root.
   */
  className?: string;
  /**
   * Test ID applied to the checkbox input.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether the switch is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the switch is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Whether the switch is on.
   */
  isSelected: boolean;
  /**
   * Switch label.
   */
  label: string;
  /**
   * Content rendered before the label.
   */
  labelIcon?: ReactNode;
  /**
   * Which side of the switch the label appears on.
   * @default 'end'
   */
  labelPosition?: SwitchLabelPosition;
  /**
   * Spacing behavior between label and switch.
   * @default 'default'
   */
  labelSpacing?: SwitchLabelSpacing;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Called when the switch loses focus.
   */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when the checked state changes.
   */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Called when the switch receives focus.
   */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Ref forwarded to the checkbox input.
   */
  ref?: Ref<HTMLInputElement>;
  /**
   * Validation status displayed below the switch.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the field root.
   */
  style?: CSSProperties;
}

const styles = {
  field: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    w: 'fit-content',
  }),
  spreadField: css({
    w: 'full',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  spread: css({
    justifyContent: 'space-between',
    w: 'full',
  }),
  labelWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    minW: 0,
  }),
  label: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    w: 'fit-content',
    color: 'fg.muted',
    cursor: 'pointer',
  }),
  labelDisabled: css({
    color: 'silver-neutral.400',
    cursor: 'not-allowed',
  }),
  labelIcon: css({
    display: 'inline-flex',
    alignItems: 'center',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  requiredness: css({
    fontWeight: 'normal',
    color: 'fg.muted',
  }),
  tooltipIcon: css({
    display: 'inline-flex',
    color: 'fg.muted',
    '& > svg': {
      w: 'var(--silver-sizes-icon-sm)',
      h: 'var(--silver-sizes-icon-sm)',
    },
  }),
  status: css({
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    px: '2',
    py: '1.5',
    mt: '1',
    borderRadius: 'md',
  }),
  statusColor: {
    warning: css({bg: 'yellow.100', color: 'yellow.800'}),
    error: css({bg: 'red.100', color: 'red.800'}),
    success: css({bg: 'green.100', color: 'green.800'}),
  } satisfies Record<InputStatusType, string>,
  control: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    w: '10',
    h: '6',
    borderRadius: 'full',
    isolation: 'isolate',
    '&:has(input:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  input: css({
    position: 'absolute',
    inset: 0,
    m: 0,
    p: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  track: css({
    display: 'flex',
    alignItems: 'center',
    w: '10',
    h: '6',
    p: '1',
    borderRadius: 'full',
    bg: 'silver-neutral.300',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    pointerEvents: 'none',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
  }),
  trackOn: css({
    bg: 'primary',
  }),
  trackDisabled: css({
    opacity: 0.5,
  }),
  thumb: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '4',
    h: '4',
    borderRadius: 'full',
    bg: 'bg',
    color: 'primary',
    transform: 'translateX(0)',
    transitionProperty: 'transform, width, height',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
  }),
  thumbOn: css({
    w: '5',
    h: '5',
    transform: 'translateX(14px)',
  }),
} as const;

/**
 * A controlled switch for boolean settings.
 */
export function Switch({
  className,
  'data-testid': dataTestId,
  description,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isOptional = false,
  isRequired = false,
  label,
  labelIcon,
  labelTooltip,
  labelPosition = 'end',
  labelSpacing = 'default',
  onBlur,
  onChange,
  onFocus,
  ref,
  status,
  style,
  isSelected,
}: SwitchProps): React.JSX.Element {
  const inputId = useId();
  const descriptionID =
    description != null ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const isBusy = isLoading;
  const requirednessText = isOptional
    ? 'Optional'
    : isRequired
      ? 'Required'
      : null;
  const control = (
    <span className={styles.control}>
      <input
        aria-busy={isBusy || undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        checked={isSelected}
        className={styles.input}
        data-testid={dataTestId}
        disabled={isDisabled || isBusy}
        id={inputId}
        onBlur={onBlur}
        onChange={event => onChange?.(event.target.checked, event)}
        onFocus={onFocus}
        ref={ref}
        required={isRequired}
        role="switch"
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={cx(
          styles.track,
          isSelected ? styles.trackOn : undefined,
          isDisabled ? styles.trackDisabled : undefined,
        )}>
        <span
          className={cx(styles.thumb, isSelected ? styles.thumbOn : undefined)}>
          {isBusy ? <Spinner size="sm" /> : null}
        </span>
      </span>
      {isBusy ? (
        <VisuallyHidden>
          <span role="status">Loading</span>
        </VisuallyHidden>
      ) : null}
    </span>
  );
  const labelNode = (
    <div className={styles.labelWrapper}>
      <label
        className={cx(
          styles.label,
          isDisabled ? styles.labelDisabled : undefined,
        )}
        htmlFor={inputId}>
        {labelIcon != null ? (
          <span className={styles.labelIcon}>{labelIcon}</span>
        ) : null}
        <Text as="span" color="inherit" type="label">
          {label}
        </Text>
        {requirednessText != null ? (
          <Text as="span" className={styles.requiredness} type="supporting">
            <span aria-hidden="true"> · </span>
            {requirednessText}
          </Text>
        ) : null}
        {labelTooltip != null ? (
          <Tooltip content={labelTooltip}>
            <span className={styles.tooltipIcon}>
              <Icon icon={Info} size="sm" />
            </span>
          </Tooltip>
        ) : null}
      </label>
      {description != null ? (
        <Text as="span" color="secondary" id={descriptionID} type="supporting">
          {description}
        </Text>
      ) : null}
    </div>
  );

  return (
    <div
      className={cx(
        styles.field,
        labelSpacing === 'spread' ? styles.spreadField : undefined,
        className,
      )}
      style={style}>
      <div
        className={cx(
          styles.row,
          labelSpacing === 'spread' ? styles.spread : undefined,
        )}>
        {labelPosition === 'start' ? (
          isLabelHidden ? (
            <VisuallyHidden>{labelNode}</VisuallyHidden>
          ) : (
            labelNode
          )
        ) : (
          control
        )}
        {labelPosition === 'start' ? (
          control
        ) : isLabelHidden ? (
          <VisuallyHidden>{labelNode}</VisuallyHidden>
        ) : (
          labelNode
        )}
      </div>
      {status?.message != null ? (
        <div
          aria-live={status.type === 'error' ? 'assertive' : 'polite'}
          className={cx(styles.status, styles.statusColor[status.type])}
          id={statusMessageID}
          role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}

Switch.displayName = 'Switch';
