import {Info} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {fieldRecipe} from 'components/Field/Field.recipe';
import type {InputStatusType} from 'components/Field/types';
import {Icon, type IconComponent} from 'components/Icon';
import {Text} from 'components/Text';
import {Tooltip} from 'components/Tooltip';
import {VisuallyHidden} from 'components/VisuallyHidden';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

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

/**
 * Controls whether a field displays an "Optional" or "Required" indicator.
 * The two options are mutually exclusive — a field cannot be both optional
 * and required at the same time. TypeScript enforces this at the type level.
 */
export type FieldNecessity =
  | {isOptional?: false; isRequired?: false}
  | {isOptional: true; isRequired?: false}
  | {isOptional?: false; isRequired: true};

export type FieldProps = FieldBaseProps & FieldNecessity;

/**
 * Narrows individually-typed `isOptional`/`isRequired` values back into
 * a valid `FieldNecessity` union member. Useful when forwarding necessity
 * props that were destructured from a component's own props (which widens
 * the discriminated union to `boolean | undefined`).
 */
export function getNecessity(
  isOptional: boolean | undefined,
  isRequired: boolean | undefined,
): FieldNecessity {
  if (isOptional === true) {
    return {isOptional: true};
  }
  if (isRequired === true) {
    return {isRequired: true};
  }
  return {};
}

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
    (isReactNode(description) ? `${inputId}-description` : undefined);
  const resolvedStatusID =
    status?.messageID ??
    (status?.message != null ? `${inputId}-status` : undefined);
  const statusText = isOptional ? 'Optional' : isRequired ? 'Required' : null;
  const classes = fieldRecipe({
    isDisabled,
    statusType: status?.type,
    statusVariant,
  });
  const labelNode = (
    <LabelComponent
      className={classes.label}
      {...(LabelComponent === 'label' ? {htmlFor: inputId} : undefined)}
      id={labelId}>
      {labelIcon != null ? (
        <Icon color="secondary" icon={labelIcon} size="sm" />
      ) : null}
      <Text as="span" color="inherit" type="label">
        {label}
      </Text>
      {statusText != null ? (
        <Text as="span" className={classes.indicator} type="supporting">
          <span aria-hidden="true"> · </span>
          {statusText}
        </Text>
      ) : null}
      {isReactNode(labelTooltip) ? (
        <Tooltip content={labelTooltip}>
          <span className={classes.tooltipIcon}>
            <Icon icon={Info} size="sm" />
          </span>
        </Tooltip>
      ) : null}
    </LabelComponent>
  );
  const descriptionNode = isReactNode(description) ? (
    <Text
      as="span"
      color="secondary"
      id={resolvedDescriptionID}
      type="supporting">
      {description}
    </Text>
  ) : null;
  const statusNode =
    status?.message != null ? (
      <div
        aria-live={status.type === 'error' ? 'assertive' : 'polite'}
        className={classes.status}
        id={resolvedStatusID}
        role={status.type === 'error' ? 'alert' : 'status'}>
        {status.message}
      </div>
    ) : null;

  return (
    <div
      className={cx(classes.root, className)}
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
        <div className={classes.inputWrapper}>
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
