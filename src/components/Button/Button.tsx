/* eslint-disable @eslint-react/static-components -- intentional polymorphism via as prop */

import type {
  CSSProperties,
  JSX,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {getAriaLabel, useRel} from '../../internal/linkAccessibility';
import {useButtonGroup} from '../ButtonGroup/ButtonGroupContext';
import type {LinkComponent} from '../Link';
import {useLinkComponent} from '../Link';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip';
import {buttonRecipe, type ButtonVariants} from './Button.recipe';

export type ButtonSize = NonNullable<ButtonVariants>['size'];
type ButtonVariant = NonNullable<ButtonVariants>['variant'];

/**
 * A versatile action element that renders as a `<button>` or a link depending
 * on whether `href` is provided. Supports explicit loading states, icon-only
 * modes, link buttons, and tooltips.
 */
export interface ButtonProps {
  /**
   * Indicates the current item in a set. Used by composite controls such as
   * pagination.
   */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time';
  /**
   * Custom link component to render when `href` is set. Falls back to the
   * component provided by `LinkProvider`, or a plain `<a>` tag.
   */
  as?: LinkComponent;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Content rendered after the label, such as a badge or count. Hidden in
   * icon-only mode.
   */
  endContent?: ReactNode;
  /**
   * HTML `form` attribute associating the button with a `<form>` by ID.
   */
  form?: string;
  /**
   * URL to navigate to. When set and the button is not disabled, the component
   * renders as a link element.
   */
  href?: string;
  /**
   * Icon element rendered before the label.
   */
  icon?: ReactNode;
  /**
   * Whether the button is disabled. Prevents interaction and applies disabled
   * styling.
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label, showing only the icon. The `label`
   * prop is still required and used as `aria-label`.
   */
  isIconOnly?: boolean;
  /**
   * Whether the button is in a loading state. Shows a spinner overlay,
   * disables interaction, and announces "Loading" to assistive technologies.
   */
  isLoading?: boolean;
  /**
   * Text label for the button. Always required for accessibility even when
   * `isIconOnly` is true.
   */
  label: string;
  /**
   * HTML `name` attribute for form submission.
   */
  name?: string;
  /**
   * Click event handler.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Keyboard event handler for the root element.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Link `rel` attribute (e.g., `"noopener"`). Only applies when rendering
   * as a link.
   */
  rel?: string;
  /**
   * Visual size of the button.
   */
  size?: ButtonSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Link `target` attribute (e.g., `"_blank"`). Only applies when rendering
   * as a link.
   */
  target?: string;
  /**
   * Tooltip text shown on hover. When set on a disabled button,
   * `aria-disabled` is used instead of the `disabled` attribute so the
   * tooltip remains accessible.
   */
  tooltip?: string;
  /**
   * HTML button `type` attribute.
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * HTML `value` attribute for form submission.
   */
  value?: string;
  /**
   * Visual style variant.
   */
  variant?: ButtonVariant;
}

const styles = {
  content: css({
    display: 'contents',
  }),
  label: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minW: 0,
  }),
  icon: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 'var(--button-icon-size)',
    '& > svg': {
      w: '1em',
      h: '1em',
    },
  }),
  endContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
    '& > svg': {
      w: 'var(--button-icon-size)',
      h: 'var(--button-icon-size)',
    },
  }),
  loadingIndicator: css({
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
  }),
  visuallyHidden: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
  iconSize: {
    sm: css({'--button-icon-size': 'var(--silver-sizes-icon-sm)'}),
    md: css({'--button-icon-size': 'var(--silver-sizes-icon-md)'}),
    lg: css({'--button-icon-size': 'var(--silver-sizes-icon-lg)'}),
  },
} as const;

export function Button({
  label,
  'aria-current': ariaCurrent,
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
  icon,
  isIconOnly = false,
  endContent,
  tooltip,
  onClick,
  onKeyDown,
  form,
  name,
  value,
}: ButtonProps): JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const buttonGroup = useButtonGroup();
  const size = sizeProp ?? buttonGroup?.size ?? 'md';
  const buttonDisabled =
    isDisabled || buttonGroup?.isDisabled === true || isLoading;
  const useAriaDisabled = tooltip != null && buttonDisabled;
  const renderAsLink = href != null && !buttonDisabled;
  const opensInNewTab = renderAsLink && target === '_blank';
  const ariaLabel = getAriaLabel(
    isIconOnly || isLoading || endContent != null || opensInNewTab
      ? label
      : undefined,
    opensInNewTab,
  );
  const linkRel = useRel({target, rel});
  const spinnerVariant =
    variant === 'primary' || variant === 'destructive' ? 'onMedia' : 'default';

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (buttonDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (useAriaDisabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      return;
    }

    onKeyDown?.(event);
  };

  const handleLinkKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    onKeyDown?.(event);
  };

  const buttonContent = (
    <>
      <span aria-hidden={isLoading || undefined} className={styles.content}>
        {icon != null ? (
          <span aria-hidden="true" className={styles.icon}>
            {icon}
          </span>
        ) : null}
        {!isIconOnly && <span className={styles.label}>{label}</span>}
        {!isIconOnly && endContent != null ? (
          <span className={styles.endContent}>{endContent}</span>
        ) : null}
        {!isIconOnly && isLoading ? (
          <span aria-hidden="true" className={styles.loadingIndicator}>
            <Spinner size={size} variant={spinnerVariant} />
          </span>
        ) : null}
      </span>
      <span aria-live="polite" className={styles.visuallyHidden} role="status">
        {isLoading ? 'Loading' : ''}
      </span>
    </>
  );

  const rootClassName = cx(
    buttonRecipe({variant, size, iconOnly: isIconOnly}),
    styles.iconSize[size],
    className,
  );

  const element = renderAsLink ? (
    <LinkComponent
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      className={rootClassName}
      data-testid={dataTestId}
      href={href}
      onClick={handleLinkClick}
      onKeyDown={handleLinkKeyDown}
      ref={ref as Ref<HTMLAnchorElement>}
      rel={linkRel}
      style={style}
      target={target}
      to={LinkComponent === 'a' ? undefined : href}>
      {buttonContent}
    </LinkComponent>
  ) : (
    <button
      aria-busy={isLoading || undefined}
      aria-current={ariaCurrent}
      aria-disabled={useAriaDisabled || undefined}
      aria-label={ariaLabel}
      className={rootClassName}
      data-testid={dataTestId}
      disabled={useAriaDisabled ? undefined : buttonDisabled}
      form={form}
      name={name}
      onClick={handleButtonClick}
      onKeyDown={handleButtonKeyDown}
      ref={ref as Ref<HTMLButtonElement>}
      style={style}
      type={type}
      value={value}>
      {buttonContent}
    </button>
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Button.displayName = 'Button';
