import type {
  CSSProperties,
  JSX,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {buttonRecipe} from 'components/Button/Button.recipe';
import type {ButtonSize, ButtonVariant} from 'components/Button/Button.types';
import {useButtonGroup} from 'components/ButtonGroup/ButtonGroupContext';
import {Icon, type IconComponent} from 'components/Icon';
import type {LinkComponent} from 'components/Link';
import {Spinner} from 'components/Spinner';
import {Tooltip} from 'components/Tooltip';
import {VisuallyHidden} from 'internal';
import {ActionElement} from 'internal/ActionElement';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {getAriaLabel, useRel} from 'internal/linkAccessibility';

export type {ButtonSize} from 'components/Button/Button.types';

/**
 * A versatile action element that renders as a `<button>` or a link depending
 * on whether `href` is provided. Supports explicit loading states, icon-only
 * modes, link buttons, and tooltips.
 */
interface ButtonBaseProps {
  /**
   * Identifies the element(s) whose contents are controlled by the button.
   */
  'aria-controls'?: string;
  /**
   * Indicates the current item in a set.
   */
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time';
  /**
   * Identifies the element(s) that describe the button.
   */
  'aria-describedby'?: string;
  /**
   * Identifies the element that provides a detailed description.
   */
  'aria-details'?: string;
  /**
   * Indicates whether a controlled element is expanded or collapsed.
   */
  'aria-expanded'?: boolean;
  /**
   * Indicates the button opens an interactive popup element.
   */
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /**
   * Indicates whether the element is exposed to the accessibility API.
   */
  'aria-hidden'?: boolean;
  /**
   * Keyboard shortcuts that activate or focus the button.
   */
  'aria-keyshortcuts'?: string;
  /**
   * Accessible label that overrides the visible `label` for assistive
   * technologies. Use when the visible text is too terse (e.g. a page
   * number) and a longer description is needed.
   */
  'aria-label'?: string;
  /**
   * Identifies the element(s) that label the button.
   */
  'aria-labelledby'?: string;
  /**
   * Identifies element(s) owned by the button that are not DOM children.
   */
  'aria-owns'?: string;
  /**
   * Indicates the current pressed state of a toggle button.
   */
  'aria-pressed'?: boolean | 'mixed';
  /**
   * Human-readable description of the role of the button.
   */
  'aria-roledescription'?: string;
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
   * Whether the button is disabled. Prevents interaction and applies disabled
   * styling.
   */
  isDisabled?: boolean;
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
   * Arbitrary content rendered before the label (after the icon, if present).
   * Hidden in icon-only mode.
   */
  startContent?: ReactNode;
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

export type ButtonProps =
  | (ButtonBaseProps & {
      /**
       * Icon element rendered before the label. Required in icon-only mode.
       */
      icon: IconComponent;
      /**
       * Visually hides the label, showing only the icon. The `label` prop is
       * still required and used as `aria-label`.
       */
      isIconOnly: true;
    })
  | (ButtonBaseProps & {
      /**
       * Icon element rendered before the label.
       */
      icon?: IconComponent;
      /**
       * Visually hides the label, showing only the icon. The `label` prop is
       * still required and used as `aria-label`.
       */
      isIconOnly?: false;
    });

export function Button({
  label,
  'aria-controls': ariaControls,
  'aria-current': ariaCurrent,
  'aria-label': ariaLabelProp,
  'aria-describedby': ariaDescribedby,
  'aria-details': ariaDetails,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  'aria-hidden': ariaHidden,
  'aria-keyshortcuts': ariaKeyshortcuts,
  'aria-labelledby': ariaLabelledby,
  'aria-owns': ariaOwns,
  'aria-pressed': ariaPressed,
  'aria-roledescription': ariaRoledescription,
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
  startContent,
  tooltip,
  onClick,
  onKeyDown,
  form,
  name,
  value,
}: ButtonProps): JSX.Element {
  const buttonGroup = useButtonGroup();
  const size = sizeProp ?? buttonGroup?.size ?? 'md';
  const buttonDisabled =
    isDisabled || buttonGroup?.isDisabled === true || isLoading;
  const useAriaDisabled = tooltip != null && buttonDisabled;
  const renderAsLink = href != null && !buttonDisabled;
  const opensInNewTab = renderAsLink && target === '_blank';
  const ariaLabel =
    ariaLabelProp ??
    getAriaLabel(
      isIconOnly ||
        isLoading ||
        isReactNode(startContent) ||
        isReactNode(endContent) ||
        opensInNewTab
        ? label
        : undefined,
      opensInNewTab,
    );
  const linkRel = useRel({target, rel});
  const spinnerVariant =
    variant === 'primary' || variant === 'destructive' || variant === 'onSolid'
      ? 'onMedia'
      : 'default';

  const classes = buttonRecipe({variant, size, iconOnly: isIconOnly});

  const ariaAttrs = {
    'aria-controls': ariaControls,
    'aria-current': ariaCurrent,
    'aria-describedby': ariaDescribedby,
    'aria-details': ariaDetails,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-hidden': ariaHidden,
    'aria-keyshortcuts': ariaKeyshortcuts,
    'aria-labelledby': ariaLabelledby,
    'aria-owns': ariaOwns,
    'aria-pressed': ariaPressed,
    'aria-roledescription': ariaRoledescription,
  };

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
      <span aria-hidden={isLoading || undefined} className={classes.content}>
        {icon != null ? (
          <span aria-hidden="true" className={classes.icon}>
            {isIconOnly && isLoading ? (
              <Spinner size={size} variant={spinnerVariant} />
            ) : (
              <Icon icon={icon} size={size} />
            )}
          </span>
        ) : null}
        {!isIconOnly && isReactNode(startContent) ? (
          <span className={classes.startContent}>{startContent}</span>
        ) : null}
        {!isIconOnly ? <span className={classes.label}>{label}</span> : null}
        {!isIconOnly && isReactNode(endContent) ? (
          <span className={classes.endContent}>{endContent}</span>
        ) : null}
        {!isIconOnly && isLoading ? (
          <span aria-hidden="true" className={classes.loadingIndicator}>
            <Spinner size={size} variant={spinnerVariant} />
          </span>
        ) : null}
      </span>
      <VisuallyHidden aria-live="polite" role="status">
        {isLoading ? 'Loading' : ''}
      </VisuallyHidden>
    </>
  );

  const rootClassName = cx(classes.root, className);

  const element = (
    <ActionElement
      {...ariaAttrs}
      aria-busy={!renderAsLink && isLoading ? true : undefined}
      aria-disabled={!renderAsLink && useAriaDisabled ? true : undefined}
      aria-label={ariaLabel}
      as={as}
      className={rootClassName}
      data-testid={dataTestId}
      disabled={!renderAsLink && !useAriaDisabled ? buttonDisabled : undefined}
      form={form}
      href={renderAsLink ? href : undefined}
      name={name}
      onClick={renderAsLink ? handleLinkClick : handleButtonClick}
      onKeyDown={renderAsLink ? handleLinkKeyDown : handleButtonKeyDown}
      ref={ref}
      rel={renderAsLink ? linkRel : undefined}
      renderAsLink={renderAsLink}
      style={style}
      target={renderAsLink ? target : undefined}
      type={type}
      value={value}>
      {buttonContent}
    </ActionElement>
  );

  if (tooltip != null) {
    return <Tooltip content={tooltip}>{element}</Tooltip>;
  }

  return element;
}

Button.displayName = 'Button';
