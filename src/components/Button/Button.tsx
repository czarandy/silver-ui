import {
  useRef,
  useTransition,
  type ComponentPropsWithRef,
  type JSX,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import {buttonRecipe, type ButtonVariants} from './Button.recipe';

type ButtonRecipeVariants = Omit<NonNullable<ButtonVariants>, 'iconOnly'>;
type NativeButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-disabled' | 'children' | 'disabled'
>;

export interface ButtonProps extends NativeButtonProps, ButtonRecipeVariants {
  label: string;
  isDisabled?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  clickAction?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  icon?: ReactNode;
  isIconOnly?: boolean;
  endContent?: ReactNode;
  tooltip?: string;
}

const contentClassName = css({
  display: 'contents',
});

const labelClassName = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minW: 0,
});

const iconClassName = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& > svg': {
    w: '1em',
    h: '1em',
  },
});

const endContentClassName = css({
  display: 'inline-flex',
  alignItems: 'center',
  color: 'inherit',
});

const loadingClassName = css({
  color: 'transparent',
});

const spinnerOverlayClassName = css({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const spinnerClassName = css({
  w: '4',
  h: '4',
  borderRadius: 'full',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: 'currentColor',
  borderTopColor: 'transparent',
  animation: 'spin 0.8s linear infinite',
});

const spinnerToneClassNames = {
  light: css({color: 'white'}),
  default: css({color: 'fg'}),
} as const;

const visuallyHiddenClassName = css({
  position: 'absolute',
  w: '1px',
  h: '1px',
  p: 0,
  m: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
});

const iconSizeClassNames = {
  sm: css({fontSize: '16px'}),
  md: css({fontSize: '16px'}),
  lg: css({fontSize: '20px'}),
} as const;

export function Button({
  label,
  variant,
  size: sizeProp,
  className,
  style,
  type = 'button',
  ref,
  isDisabled = false,
  disabled = false,
  isLoading = false,
  clickAction,
  icon,
  isIconOnly = false,
  endContent,
  tooltip,
  onClick,
  onKeyDown,
  ...rest
}: ButtonProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const actionInFlightRef = useRef(false);
  const size = sizeProp ?? 'md';
  const isLoadingState = isLoading || isPending;
  const buttonDisabled = isDisabled || disabled || isLoadingState;
  const useAriaDisabled = tooltip != null && buttonDisabled;
  const ariaLabel =
    isIconOnly || isLoadingState || endContent != null ? label : undefined;
  const spinnerTone =
    variant === 'primary' || variant === 'destructive' ? 'light' : 'default';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (buttonDisabled || actionInFlightRef.current) {
      event.preventDefault();
      return;
    }

    onClick?.(event);

    if (clickAction != null && !event.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await clickAction(event);
        } finally {
          actionInFlightRef.current = false;
        }
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (useAriaDisabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }

    onKeyDown?.(event);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        buttonRecipe({variant, size, iconOnly: isIconOnly}),
        isLoadingState && loadingClassName,
        className,
      )}
      style={style}
      disabled={useAriaDisabled ? undefined : buttonDisabled}
      aria-busy={isLoadingState || undefined}
      aria-disabled={useAriaDisabled || undefined}
      aria-label={ariaLabel}
      title={tooltip}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}>
      {isLoadingState && (
        <span
          className={cx(
            spinnerOverlayClassName,
            spinnerToneClassNames[spinnerTone],
          )}
          aria-hidden="true">
          <span className={spinnerClassName} />
        </span>
      )}
      <span
        className={contentClassName}
        aria-hidden={isLoadingState || undefined}>
        {icon != null ? (
          <span
            className={cx(iconClassName, iconSizeClassNames[size])}
            aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {!isIconOnly && <span className={labelClassName}>{label}</span>}
        {!isIconOnly && endContent != null ? (
          <span className={endContentClassName}>{endContent}</span>
        ) : null}
      </span>
      <span
        className={visuallyHiddenClassName}
        role="status"
        aria-live="polite">
        {isLoadingState ? 'Loading' : ''}
      </span>
    </button>
  );
}

Button.displayName = 'Button';
