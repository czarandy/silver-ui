'use client';

import type {CSSProperties, MouseEvent, Ref} from 'react';
import type {ButtonPassthroughProps, ButtonSize} from 'components/Button';
import {buttonRecipe} from 'components/Button/Button.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import {Spinner} from 'components/Spinner';
import {toggleButtonRecipe} from 'components/ToggleButton/ToggleButton.recipe';
import {useToggleButtonGroup} from 'components/ToggleButton/ToggleButtonGroup';
import {Tooltip} from 'components/Tooltip';
import {useResolvedSize} from 'internal/SizeContext';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface ToggleButtonProps extends ButtonPassthroughProps {
  /**
   * Additional CSS class names applied to the button root.
   */
  className?: string;
  /**
   * Test ID applied to the button root.
   */
  'data-testid'?: string;
  /**
   * Icon element rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label and render a square icon button.
   * @default false
   */
  isIconOnly?: boolean;
  /**
   * Whether the button is loading.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the button is currently selected.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Accessible label for the button.
   */
  label: string;
  /**
   * Called when the selected state should change. Receives the next selected
   * state and the originating click event.
   */
  onChange?: (
    isSelected: boolean,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  /**
   * Ref forwarded to the button root.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Icon element rendered when the button is selected.
   */
  selectedIcon?: IconComponent;
  /**
   * Visual size of the button.
   */
  size?: ButtonSize;
  /**
   * Inline styles applied to the button root.
   */
  style?: CSSProperties;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * Value identifier when used inside `ToggleButtonGroup`.
   */
  value?: string;
}

/**
 * Button that toggles between selected and unselected states.
 */
export function ToggleButton({
  className,
  'data-testid': dataTestId,
  icon,
  isDisabled: isDisabledProp = false,
  isIconOnly = false,
  isLoading = false,
  isSelected: isSelectedProp = false,
  label,
  onChange,
  selectedIcon,
  ref,
  size: sizeProp,
  style,
  tooltip,
  value,
  ...passthrough
}: ToggleButtonProps): React.JSX.Element {
  const group = useToggleButtonGroup();

  if (process.env.NODE_ENV !== 'production') {
    if (group != null && value == null) {
      throw new Error(
        'ToggleButton: `value` prop is required when used inside a ToggleButtonGroup.',
      );
    }
  }

  const isSelected =
    group != null && value != null
      ? group.selectedValues.has(value)
      : isSelectedProp;
  const size = useResolvedSize(sizeProp, group?.size);
  const isDisabled = isDisabledProp || group?.isDisabled === true;
  const resolvedIcon = isSelected && selectedIcon != null ? selectedIcon : icon;
  const classes = toggleButtonRecipe({isSelected});
  // Merge the shared button chrome with the selected-state overrides in JS so
  // each property resolves to a single utility class; layering the classes
  // with cx would leave the same-property conflicts (background, font-weight)
  // to be decided by stylesheet emission order, and the ghost variant's
  // `background: transparent` happens to win, erasing the selected surface.
  const rootClassName = css(
    buttonRecipe.raw({variant: 'ghost', size, iconOnly: isIconOnly}).root,
    toggleButtonRecipe.raw({isSelected}).root,
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) {
      event.preventDefault();
      return;
    }

    if (group != null && value != null) {
      group.onToggle(value, event);
      return;
    }

    onChange?.(!isSelected, event);
  };

  const button = (
    <button
      {...passthrough}
      aria-busy={isLoading || undefined}
      aria-label={isIconOnly || isLoading ? label : undefined}
      aria-pressed={isSelected}
      className={cx(rootClassName, className)}
      data-testid={dataTestId}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      ref={ref}
      style={style}
      type="button">
      <span aria-hidden={isLoading || undefined} className={classes.content}>
        {resolvedIcon != null ? (
          <span className={classes.icon}>
            {isIconOnly && isLoading ? (
              <Spinner size={size} />
            ) : (
              <Icon icon={resolvedIcon} size={size} />
            )}
          </span>
        ) : null}
        {!isIconOnly ? (
          <span className={classes.labelWrapper}>
            <span className={classes.label}>{label}</span>
            <span aria-hidden="true" className={classes.widthReservation}>
              {label}
            </span>
          </span>
        ) : null}
        {!isIconOnly && isLoading ? (
          <span aria-hidden="true" className={classes.spinner}>
            <Spinner size={size} />
          </span>
        ) : null}
      </span>
    </button>
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
}

ToggleButton.displayName = 'ToggleButton';
