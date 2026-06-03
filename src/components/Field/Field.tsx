import {Info} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import {Icon, type IconComponent} from '../Icon';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';
import {fieldLabelRecipe, fieldStatusRecipe} from './Field.recipe';
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

interface FieldBaseProps {
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
   * Field label text.
   */
  label: string;
  /**
   * HTML element used for the label. Use 'span' for group controls
   * (e.g., radiogroup) where `htmlFor` cannot target a labelable element.
   * @default 'label'
   */
  labelAs?: 'label' | 'span';
  /**
   * Optional icon shown before the label.
   */
  labelIcon?: IconComponent;
  /**
   * ID applied to the label element, useful for `aria-labelledby`.
   */
  labelId?: string;
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

export interface FieldNecessity {
  /**
   * Whether the field is optional. Cannot be `true` when `isRequired` is `true`.
   */
  isOptional?: boolean;
  /**
   * Whether the field is required. Cannot be `true` when `isOptional` is `true`.
   */
  isRequired?: boolean;
}

export type FieldProps = FieldBaseProps & FieldNecessity;

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
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
} as const;

/**
 * A form field wrapper that renders a label, description, control slot, and validation status.
 */
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
  labelAs: LabelComponent = 'label',
  labelIcon,
  labelId,
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
    <LabelComponent
      className={fieldLabelRecipe({isDisabled})}
      {...(LabelComponent === 'label' ? {htmlFor: inputId} : undefined)}
      id={labelId}>
      {labelIcon != null ? (
        <Icon color="secondary" icon={labelIcon} size="sm" />
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
    </LabelComponent>
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
        className={fieldStatusRecipe({
          statusType: status.type,
          statusVariant,
        })}
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
