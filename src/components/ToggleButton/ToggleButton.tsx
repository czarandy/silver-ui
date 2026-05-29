import type {CSSProperties, MouseEvent, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {buttonRecipe} from '../Button';
import type {ButtonSize} from '../Button';
import {Icon, type IconComponent} from '../Icon';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip';
import {useToggleButtonGroup} from './ToggleButtonGroup';

export interface ToggleButtonProps {
  /**
   * Custom visible content. When omitted, `label` is rendered.
   */
  children?: ReactNode;
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
   * Called when the selected state should change.
   */
  onChange?: (isSelected: boolean) => void;
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

const styles = {
  selected: css({
    bg: 'bg.subtle',
    fontWeight: 'semibold',
    _hover: {bg: 'bg.subtle'},
    _active: {bg: 'bg.subtle'},
  }),
  content: css({
    display: 'contents',
  }),
  labelWrapper: css({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minW: 0,
  }),
  label: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minW: 0,
  }),
  widthReservation: css({
    display: 'block',
    h: 0,
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
    fontWeight: 'semibold',
  }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  spinner: css({
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
  }),
} as const;

/**
 * Button that toggles between selected and unselected states.
 */
export function ToggleButton({
  children,
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
  const size = sizeProp ?? group?.size ?? 'md';
  const isDisabled = isDisabledProp || group?.isDisabled === true;
  const resolvedIcon = isSelected && selectedIcon != null ? selectedIcon : icon;
  const visibleLabel = children ?? label;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isLoading) {
      event.preventDefault();
      return;
    }

    if (group != null && value != null) {
      group.onToggle(value);
      return;
    }

    onChange?.(!isSelected);
  };

  const button = (
    <button
      aria-busy={isLoading || undefined}
      aria-label={isIconOnly || isLoading ? label : undefined}
      aria-pressed={isSelected}
      className={cx(
        buttonRecipe({variant: 'ghost', size, iconOnly: isIconOnly}),
        isSelected ? styles.selected : undefined,
        className,
      )}
      data-testid={dataTestId}
      disabled={isDisabled || isLoading}
      onClick={handleClick}
      ref={ref}
      style={style}
      type="button">
      <span aria-hidden={isLoading || undefined} className={styles.content}>
        {resolvedIcon != null ? (
          <span className={styles.icon}>
            <Icon icon={resolvedIcon} size={size} />
          </span>
        ) : null}
        {!isIconOnly ? (
          <span className={styles.labelWrapper}>
            <span className={styles.label}>{visibleLabel}</span>
            <span aria-hidden="true" className={styles.widthReservation}>
              {visibleLabel}
            </span>
          </span>
        ) : null}
        {!isIconOnly && isLoading ? (
          <span aria-hidden="true" className={styles.spinner}>
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
