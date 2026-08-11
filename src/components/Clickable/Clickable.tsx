'use client';

import type {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  Ref,
} from 'react';
import {clickableRecipe} from 'components/Clickable/Clickable.recipe';
import type {LinkComponent} from 'components/Link';
import {useTooltip} from 'components/Tooltip';
import {ActionElement} from 'internal/ActionElement';
import {useRel} from 'internal/linkAccessibility';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

/**
 * Props shared by the clickable interaction primitives.
 */
export interface ClickableBaseProps {
  /**
   * Non-interactive phrasing content that becomes the action's visual target.
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
   * Explanation shown in a tooltip and exposed as the control's accessible
   * description while disabled.
   */
  disabledReason?: string;
  /**
   * Navigation URL. When provided, the action renders as a link and takes
   * precedence over `onClick`.
   */
  href?: string;
  /**
   * Whether the action is disabled. Disabled actions remain focusable and use
   * `aria-disabled` so their reason can be discovered.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to preserve the content's appearance while removing interaction.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Accessible name for the action. It is not rendered visually.
   */
  label: string;
  /**
   * Called when the action is activated. Also fires for link clicks when
   * `href` is provided.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Link relationship. `noopener noreferrer` are added for `_blank` targets.
   */
  rel?: string;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Link browsing-context target.
   * @default '_self'
   */
  target?: string;
}

export interface ClickableProps extends ClickableBaseProps {
  /**
   * Custom link component used when `href` is provided. This overrides the
   * component configured by `LinkProvider` for this instance.
   */
  as?: LinkComponent;
  /**
   * Ref forwarded to the rendered button, link, or static span.
   */
  ref?: Ref<HTMLElement>;
}

/**
 * Turns non-interactive phrasing content into one button or link target.
 * Children must not contain independent interactive descendants.
 */
export function Clickable({
  as,
  children,
  className,
  'data-testid': dataTestId,
  disabledReason,
  href,
  isDisabled = false,
  isReadOnly = false,
  label,
  onClick,
  ref,
  rel,
  style,
  target,
}: ClickableProps): React.JSX.Element {
  const hasAction = href != null || onClick != null;
  const isInteractive = hasAction && !isReadOnly;
  const isActionDisabled = isInteractive && isDisabled;
  const renderAsLink = isInteractive && href != null && !isActionDisabled;
  const hasDisabledReason =
    isActionDisabled && disabledReason != null && disabledReason !== '';
  const linkRel = useRel({target, rel});
  const tooltip = useTooltip({isEnabled: hasDisabledReason});
  const classes = clickableRecipe({
    isDisabled: isActionDisabled,
    isInteractive,
  });
  const rootClassName = cx(classes.root, className);
  const content = <span className={classes.content}>{children}</span>;

  if (!isInteractive) {
    return (
      <span
        className={rootClassName}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {content}
      </span>
    );
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (isActionDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const element = (
    <ActionElement
      aria-describedby={hasDisabledReason ? tooltip.describedBy : undefined}
      aria-disabled={isActionDisabled || undefined}
      aria-label={label}
      as={renderAsLink ? as : undefined}
      className={rootClassName}
      data-testid={dataTestId}
      href={renderAsLink ? href : undefined}
      isLink={renderAsLink}
      onClick={handleClick}
      ref={mergeRefs(ref, tooltip.ref)}
      rel={renderAsLink ? linkRel : undefined}
      style={style}
      target={renderAsLink ? target : undefined}>
      <span
        aria-hidden="true"
        className={classes.overlay}
        data-clickable-overlay=""
      />
      {content}
    </ActionElement>
  );

  return (
    <>
      {element}
      {hasDisabledReason ? tooltip.renderTooltip(disabledReason) : null}
    </>
  );
}

Clickable.displayName = 'Clickable';
