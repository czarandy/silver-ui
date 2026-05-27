import {
  createElement,
  useRef,
  useTransition,
  type ComponentPropsWithRef,
  type JSX,
  type KeyboardEvent,
  type MouseEventHandler,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../lib/cx';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip';
import {buttonRecipe, type ButtonVariants} from './Button.recipe';

type ButtonRecipeVariants = Omit<NonNullable<ButtonVariants>, 'iconOnly'>;
type NativeButtonProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-disabled' | 'children' | 'disabled' | 'onClick'
>;

export interface ButtonProps extends NativeButtonProps, ButtonRecipeVariants {
  as?: LinkComponent;
  clickAction?: (event: MouseEvent<HTMLElement>) => void | Promise<void>;
  'data-testid'?: string;
  endContent?: ReactNode;
  href?: string;
  icon?: ReactNode;
  isDisabled?: boolean;
  isIconOnly?: boolean;
  isLoading?: boolean;
  label: string;
  onClick?: MouseEventHandler<HTMLElement>;
  rel?: string;
  target?: string;
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
  href,
  as,
  target,
  rel,
  variant,
  size: sizeProp,
  className,
  'data-testid': dataTestId,
  style,
  type = 'button',
  ref,
  isDisabled = false,
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
  const LinkComponent = useLinkComponent(as);
  const [isPending, startTransition] = useTransition();
  const actionInFlightRef = useRef(false);
  const size = sizeProp ?? 'md';
  const isLoadingState = isLoading || isPending;
  const buttonDisabled = isDisabled || isLoadingState;
  const useAriaDisabled = tooltip != null && buttonDisabled;
  const ariaLabel =
    isIconOnly || isLoadingState || endContent != null ? label : undefined;
  const renderAsLink = href != null && !buttonDisabled;
  const spinnerShade =
    variant === 'primary' || variant === 'destructive' ? 'onMedia' : 'default';

  const handleClick = (event: MouseEvent<HTMLElement>) => {
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

  const buttonContent = (
    <>
      {isLoadingState && (
        <span aria-hidden="true" className={spinnerOverlayClassName}>
          <Spinner shade={spinnerShade} size="sm" />
        </span>
      )}
      <span
        aria-hidden={isLoadingState || undefined}
        className={contentClassName}>
        {icon != null ? (
          <span
            aria-hidden="true"
            className={cx(iconClassName, iconSizeClassNames[size])}>
            {icon}
          </span>
        ) : null}
        {!isIconOnly && <span className={labelClassName}>{label}</span>}
        {!isIconOnly && endContent != null ? (
          <span className={endContentClassName}>{endContent}</span>
        ) : null}
      </span>
      <span
        aria-live="polite"
        className={visuallyHiddenClassName}
        role="status">
        {isLoadingState ? 'Loading' : ''}
      </span>
    </>
  );

  const rootClassName = cx(
    buttonRecipe({variant, size, iconOnly: isIconOnly}),
    isLoadingState && loadingClassName,
    className,
  );

  const element = renderAsLink ? (
    createElement(
      LinkComponent,
      {
        ...(rest as ComponentPropsWithRef<'a'>),
        ref: ref as Ref<HTMLAnchorElement> | undefined,
        href,
        target,
        rel,
        className: rootClassName,
        'data-testid': dataTestId,
        style,
        'aria-label': ariaLabel,
        onClick: handleClick,
      },
      buttonContent,
    )
  ) : (
    <button
      aria-busy={isLoadingState || undefined}
      aria-disabled={useAriaDisabled || undefined}
      aria-label={ariaLabel}
      className={rootClassName}
      data-testid={dataTestId}
      disabled={useAriaDisabled ? undefined : buttonDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={ref}
      style={style}
      type={type}
      {...rest}>
      {buttonContent}
    </button>
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Button.displayName = 'Button';
