import {Info} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';
import type {InputStatusType} from './types';

export type FieldStatusVariant = 'attached' | 'detached';

export interface FieldStatus {
  /**
   * Optional status text displayed below the input.
   */
  message?: string;
  /**
   * Status message ID used by `aria-describedby`.
   */
  messageID?: string;
  /**
   * Validation state for the field.
   */
  type: InputStatusType;
}

export interface FieldProps {
  /**
   * The form control rendered inside the field.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Supporting text rendered between the label and control.
   */
  description?: ReactNode;
  /**
   * ID for the description element.
   */
  descriptionID?: string;
  /**
   * ID of the associated control.
   */
  inputId: string;
  /**
   * Whether the associated control is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label and description.
   * @default false
   */
  isLabelHidden?: boolean;
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
   * Field label text.
   */
  label: string;
  /**
   * Optional content shown before the label.
   */
  labelIcon?: ReactNode;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Validation status displayed below the control.
   */
  status?: FieldStatus;
  /**
   * How the status message is positioned.
   * @default 'attached'
   */
  statusVariant?: FieldStatusVariant;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
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
    cursor: 'not-allowed',
    color: 'silver-neutral.400',
  }),
  labelIcon: css({
    display: 'inline-flex',
    alignItems: 'center',
  }),
  indicator: css({
    fontWeight: 'normal',
    color: 'fg.muted',
  }),
  tooltipIcon: css({
    display: 'inline-flex',
    color: 'fg.muted',
  }),
  inputStatusWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    isolation: 'isolate',
  }),
  status: css({
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    px: '2',
    py: '1.5',
  }),
  statusAttached: css({
    mt: '-1',
    pt: '2.5',
    borderBottomRadius: 'md',
  }),
  statusDetached: css({
    mt: '1',
    borderRadius: 'md',
  }),
  statusColor: {
    warning: css({bg: 'yellow.100', color: 'yellow.800'}),
    error: css({bg: 'red.100', color: 'red.800'}),
    success: css({bg: 'green.100', color: 'green.800'}),
  } satisfies Record<InputStatusType, string>,
} as const;

export function Field({
  children,
  label,
  isLabelHidden = false,
  description,
  inputId,
  descriptionID,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  labelIcon,
  labelTooltip,
  status,
  statusVariant = 'attached',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: FieldProps): React.JSX.Element {
  const resolvedDescriptionID =
    descriptionID ??
    (description != null ? `${inputId}-description` : undefined);
  const resolvedStatusID =
    status?.messageID ??
    (status?.message != null ? `${inputId}-status` : undefined);
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;
  const labelNode = (
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
      {statusText != null ? (
        <Text as="span" className={styles.indicator} type="supporting">
          <span aria-hidden="true"> · </span>
          {statusText}
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
  );
  const descriptionNode =
    description != null ? (
      <Text
        as="span"
        color="secondary"
        data-testid={undefined}
        id={resolvedDescriptionID}
        type="supporting">
        {description}
      </Text>
    ) : null;
  const statusNode =
    status?.message != null ? (
      <div
        aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        className={cx(
          styles.status,
          statusVariant === 'attached'
            ? styles.statusAttached
            : styles.statusDetached,
          styles.statusColor[status.type],
        )}
        id={resolvedStatusID}
        role={status.type === 'error' ? 'alert' : 'status'}>
        {status.message}
      </div>
    ) : null;

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {isLabelHidden ? (
        <VisuallyHidden>
          {labelNode}
          {descriptionNode}
        </VisuallyHidden>
      ) : (
        <>
          {labelNode}
          {descriptionNode}
        </>
      )}
      {statusVariant === 'attached' ? (
        <div className={styles.inputStatusWrapper}>
          {children}
          {statusNode}
        </div>
      ) : (
        <>
          {children}
          {statusNode}
        </>
      )}
    </div>
  );
}

Field.displayName = 'Field';
