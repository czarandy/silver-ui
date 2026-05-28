import {
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {buttonRecipe} from '../Button';
import type {ButtonSize} from '../Button';
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
  icon?: ReactNode;
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
   * Whether the button is currently pressed.
   * @default false
   */
  isPressed?: boolean;
  /**
   * Accessible label for the button.
   */
  label: string;
  /**
   * Called when the pressed state should change.
   */
  onPressedChange?: (isPressed: boolean) => void;
  /**
   * Async action fired after a standalone pressed state change.
   */
  pressedChangeAction?: (isPressed: boolean) => Promise<void> | void;
  /**
   * Icon element rendered when the button is pressed.
   */
  pressedIcon?: ReactNode;
  /**
   * Ref forwarded to the button root.
   */
  ref?: Ref<HTMLButtonElement>;
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
  pressed: css({
    bg: 'silver-neutral.100',
    fontWeight: 'semibold',
    _hover: {bg: 'silver-neutral.100'},
    _active: {bg: 'silver-neutral.200'},
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
    fontSize: 'var(--toggle-button-icon-size)',
    '& > svg': {
      w: '1em',
      h: '1em',
    },
  }),
  spinner: css({
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
  }),
  iconSize: {
    sm: css({'--toggle-button-icon-size': 'var(--silver-sizes-icon-sm)'}),
    md: css({'--toggle-button-icon-size': 'var(--silver-sizes-icon-md)'}),
    lg: css({'--toggle-button-icon-size': 'var(--silver-sizes-icon-lg)'}),
  },
} as const;

export function ToggleButton({
  children,
  className,
  'data-testid': dataTestId,
  icon,
  isDisabled: isDisabledProp = false,
  isIconOnly = false,
  isLoading = false,
  isPressed: isPressedProp = false,
  label,
  onPressedChange,
  pressedChangeAction,
  pressedIcon,
  ref,
  size: sizeProp,
  style,
  tooltip,
  value,
}: ToggleButtonProps): React.JSX.Element {
  const group = useToggleButtonGroup();
  const [isActionPending, setIsActionPending] = useState(false);
  const isPressed =
    group != null && value != null
      ? group.selectedValues.has(value)
      : isPressedProp;
  const size = sizeProp ?? group?.size ?? 'md';
  const isDisabled = group?.isDisabled ?? isDisabledProp;
  const isBusy = isLoading || isActionPending;
  const resolvedIcon = isPressed && pressedIcon != null ? pressedIcon : icon;
  const visibleLabel = children ?? label;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || isBusy) {
      event.preventDefault();
      return;
    }

    if (group != null && value != null) {
      group.toggle(value);
      return;
    }

    const nextPressed = !isPressed;
    onPressedChange?.(nextPressed);

    if (pressedChangeAction != null) {
      setIsActionPending(true);
      void Promise.resolve(pressedChangeAction(nextPressed)).finally(() => {
        setIsActionPending(false);
      });
    }
  };

  const button = (
    <button
      aria-busy={isBusy || undefined}
      aria-label={isIconOnly ? label : undefined}
      aria-pressed={isPressed}
      className={cx(
        buttonRecipe({variant: 'ghost', size, iconOnly: isIconOnly}),
        styles.iconSize[size],
        isPressed ? styles.pressed : undefined,
        className,
      )}
      data-testid={dataTestId}
      disabled={isDisabled || isBusy}
      onClick={handleClick}
      ref={ref}
      style={style}
      type="button">
      <span aria-hidden={isBusy || undefined} className={styles.content}>
        {resolvedIcon != null ? (
          <span className={styles.icon}>{resolvedIcon}</span>
        ) : null}
        {!isIconOnly ? (
          <span className={styles.labelWrapper}>
            <span className={styles.label}>{visibleLabel}</span>
            <span aria-hidden="true" className={styles.widthReservation}>
              {visibleLabel}
            </span>
          </span>
        ) : null}
        {!isIconOnly && isBusy ? (
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
