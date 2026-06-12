import {Info} from 'lucide-react';
import {
  useId,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from 'internal/cx';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import isReactNode from '../../internal/isReactNode';
import type {FieldNecessity, InputStatus} from '../Field';
import {getDescribedBy, getStatusMessageID} from '../Field/inputUtils';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';
import {switchRecipe} from './Switch.recipe';

export type SwitchLabelPosition = 'end' | 'start';
export type SwitchLabelSpacing = 'default' | 'spread';

export type SwitchProps = {
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
  labelIcon?: IconComponent;
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
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
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
} & FieldNecessity;

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
  isOptional,
  isRequired,
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
  const descriptionID = isReactNode(description)
    ? `${inputId}-description`
    : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const requirednessText = isOptional
    ? 'Optional'
    : isRequired
      ? 'Required'
      : null;
  const classes = switchRecipe({
    labelSpacing,
    isSelected,
    isDisabled,
    status: status?.type,
  });
  const control = (
    <span className={classes.control}>
      <input
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        checked={isSelected}
        className={classes.input}
        data-testid={dataTestId}
        disabled={isDisabled}
        id={inputId}
        onBlur={onBlur}
        onChange={event => onChange(event.target.checked, event)}
        onFocus={onFocus}
        ref={ref}
        required={isRequired}
        role="switch"
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={classes.track}
        data-selected={isSelected ? 'true' : undefined}
        data-switch-track="">
        <span className={classes.thumb}>
          {isLoading ? <Spinner size="sm" /> : null}
        </span>
      </span>
      {isLoading ? (
        <VisuallyHidden>
          <span role="status">Loading</span>
        </VisuallyHidden>
      ) : null}
    </span>
  );
  const labelNode = (
    <div className={classes.labelWrapper}>
      <label className={classes.label} htmlFor={inputId}>
        {labelIcon != null ? (
          <span className={classes.labelIcon}>
            <Icon color="secondary" icon={labelIcon} size="sm" />
          </span>
        ) : null}
        <Text as="span" color="inherit" type="label">
          {label}
        </Text>
        {requirednessText != null ? (
          <Text as="span" className={classes.requiredness} type="supporting">
            <span aria-hidden="true"> · </span>
            {requirednessText}
          </Text>
        ) : null}
        {isReactNode(labelTooltip) ? (
          <Tooltip content={labelTooltip}>
            <span className={classes.tooltipIcon}>
              <Icon icon={Info} size="sm" />
            </span>
          </Tooltip>
        ) : null}
      </label>
      {isReactNode(description) ? (
        <Text as="span" color="secondary" id={descriptionID} type="supporting">
          {description}
        </Text>
      ) : null}
    </div>
  );

  return (
    <div className={cx(classes.field, className)} style={style}>
      <div className={classes.row}>
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
          className={classes.status}
          id={statusMessageID}
          role={status.type === 'error' ? 'alert' : 'status'}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}

Switch.displayName = 'Switch';
