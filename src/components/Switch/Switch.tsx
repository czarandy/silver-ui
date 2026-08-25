'use client';

import {Info} from 'lucide-react';
import {
  useId,
  useEffect,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import type {FieldNecessity, InputStatus} from 'components/Field';
import {getDescribedBy, getStatusMessageID} from 'components/Field/inputUtils';
import {useFieldset} from 'components/Fieldset';
import {Icon, type IconComponent} from 'components/Icon';
import {Spinner} from 'components/Spinner';
import {switchRecipe} from 'components/Switch/Switch.recipe';
import {Text} from 'components/Text';
import {Tooltip} from 'components/Tooltip';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {NecessityIndicator} from 'internal/NecessityIndicator';
import {useResolvedSize, type ComponentSize} from 'internal/SizeContext';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

export type SwitchLabelPosition = 'end' | 'start';
export type SwitchLabelSpacing = 'default' | 'spread';
export type SwitchSize = ComponentSize;

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
   * HTML name attribute for native form submission.
   */
  htmlName?: string;
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
   * Whether the value is displayed without allowing focus or interaction.
   * @default false
   */
  isReadOnly?: boolean;
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
   * Visual size of the switch. Defaults to the ambient size when unset.
   * @default 'md'
   */
  size?: SwitchSize;
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
  htmlName,
  isDisabled = false,
  isLabelHidden = false,
  isLoading = false,
  isReadOnly = false,
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
  size: sizeProp,
  status,
  style,
  isSelected,
}: SwitchProps): React.JSX.Element {
  const size = useResolvedSize(sizeProp);
  const inputId = useId();
  const hasDescription = isNonEmptyReactNode(description);
  const hasVisibleLabelContent = !isLabelHidden || hasDescription;
  const descriptionID = hasDescription ? `${inputId}-description` : undefined;
  const statusMessageID = getStatusMessageID(inputId, status);
  const describedBy = getDescribedBy(descriptionID, statusMessageID);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldset = useFieldset();
  const effectiveDisabled = isDisabled || fieldset?.isDisabled === true;
  const effectiveReadOnly =
    !effectiveDisabled && (isReadOnly || fieldset?.isReadOnly === true);
  const classes = switchRecipe({
    size,
    labelSpacing: hasVisibleLabelContent ? labelSpacing : 'default',
    isSelected,
    isDisabled: effectiveDisabled,
    isReadOnly: effectiveReadOnly,
    status: status?.type,
  });
  useEffect(() => {
    if (effectiveReadOnly) {
      inputRef.current?.blur();
    }
  }, [effectiveReadOnly]);
  const control = (
    <span className={classes.control}>
      <input
        aria-busy={isLoading || undefined}
        aria-describedby={describedBy}
        aria-invalid={status?.type === 'error' || undefined}
        aria-readonly={effectiveReadOnly || undefined}
        checked={isSelected}
        className={classes.input}
        data-testid={dataTestId}
        disabled={effectiveDisabled}
        id={inputId}
        name={htmlName}
        onBlur={onBlur}
        onChange={event => {
          if (effectiveReadOnly) {
            event.preventDefault();
            return;
          }
          onChange(event.target.checked, event);
        }}
        onClick={event => {
          if (effectiveReadOnly) {
            event.preventDefault();
          }
        }}
        onFocus={event => {
          if (effectiveReadOnly) {
            event.currentTarget.blur();
            return;
          }
          onFocus?.(event);
        }}
        onPointerDown={event => {
          if (effectiveReadOnly) {
            event.preventDefault();
          }
        }}
        ref={mergeRefs(ref, inputRef)}
        required={isRequired}
        role="switch"
        tabIndex={effectiveReadOnly ? -1 : undefined}
        type="checkbox"
      />
      <span
        aria-hidden="true"
        className={classes.track}
        data-selected={isSelected ? 'true' : undefined}
        data-switch-track="">
        <span className={classes.thumb}>
          {isLoading ? (
            // The thumb scales the spinner down to its own diameter through
            // `--spinner-size`; the marker attribute is what the recipe's
            // per-size rule targets.
            <Spinner data-switch-spinner="" size="sm" />
          ) : null}
        </span>
      </span>
      {isLoading ? (
        <VisuallyHidden>
          <span role="status">Loading</span>
        </VisuallyHidden>
      ) : null}
    </span>
  );
  const labelContent = (
    <>
      {labelIcon != null ? (
        <span className={classes.labelIcon}>
          <Icon color="secondary" icon={labelIcon} size="sm" />
        </span>
      ) : null}
      <Text as="span" color="inherit" type="label">
        {label}
      </Text>
      <NecessityIndicator isOptional={isOptional} isRequired={isRequired} />
      {isNonEmptyReactNode(labelTooltip) ? (
        <Tooltip content={labelTooltip}>
          <span className={classes.tooltipIcon}>
            <Icon icon={Info} size="sm" />
          </span>
        </Tooltip>
      ) : null}
    </>
  );
  const labelElement = isLabelHidden ? (
    <VisuallyHidden>
      <label className={classes.label} htmlFor={inputId}>
        {labelContent}
      </label>
    </VisuallyHidden>
  ) : (
    <label className={classes.label} htmlFor={inputId}>
      {labelContent}
    </label>
  );
  const labelNode = hasVisibleLabelContent ? (
    <div className={classes.labelWrapper}>
      {labelElement}
      {hasDescription ? (
        <Text as="span" color="secondary" id={descriptionID} type="supporting">
          {description}
        </Text>
      ) : null}
    </div>
  ) : (
    labelElement
  );

  return (
    <div className={cx(classes.field, className)} style={style}>
      <div className={classes.row}>
        {labelPosition === 'start' ? labelNode : control}
        {labelPosition === 'start' ? control : labelNode}
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
