/* eslint-disable jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- the semantic control is the clipped sibling; the visible surface only delegates pointer activation */
'use client';

import {useRef, type MouseEvent as ReactMouseEvent, type Ref} from 'react';
import type {ClickableBaseProps} from 'components/Clickable/Clickable';
import {clickableContainerRecipe} from 'components/Clickable/ClickableContainer.recipe';
import {useTooltip} from 'components/Tooltip';
import {ActionElement} from 'internal/ActionElement';
import {isInteractiveTarget} from 'internal/interactiveTarget';
import {useRel} from 'internal/linkAccessibility';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

export interface ClickableContainerProps extends ClickableBaseProps {
  /**
   * Ref forwarded to the outer, non-interactive container.
   */
  ref?: Ref<HTMLDivElement>;
}

function hasSelectionWithin(container: HTMLElement): boolean {
  const selection = window.getSelection();
  if (
    selection == null ||
    selection.isCollapsed ||
    selection.toString() === ''
  ) {
    return false;
  }

  return (
    (selection.anchorNode != null &&
      container.contains(selection.anchorNode)) ||
    (selection.focusNode != null && container.contains(selection.focusNode))
  );
}

function cloneMouseEvent(
  event: ReactMouseEvent<HTMLElement>,
  type: 'auxclick' | 'click',
): MouseEvent {
  return new MouseEvent(type, {
    altKey: event.altKey,
    bubbles: true,
    button: event.button,
    buttons: event.buttons,
    cancelable: true,
    clientX: event.clientX,
    clientY: event.clientY,
    composed: true,
    ctrlKey: event.ctrlKey,
    detail: event.detail,
    metaKey: event.metaKey,
    relatedTarget: event.relatedTarget,
    screenX: event.screenX,
    screenY: event.screenY,
    shiftKey: event.shiftKey,
  });
}

/**
 * Makes a card, row, or other surface clickable while keeping buttons, links,
 * and other interactive descendants valid and independently operable.
 */
export function ClickableContainer({
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
}: ClickableContainerProps): React.JSX.Element {
  const controlRef = useRef<HTMLElement>(null);
  const hasAction = href != null || onClick != null;
  const isInteractive = hasAction && !isReadOnly;
  const isActionDisabled = isInteractive && isDisabled;
  const renderAsLink = isInteractive && href != null && !isActionDisabled;
  const hasDisabledReason =
    isActionDisabled && disabledReason != null && disabledReason !== '';
  const linkRel = useRel({target, rel});
  const tooltip = useTooltip({
    focusTrigger: 'always',
    isEnabled: hasDisabledReason,
  });
  const classes = clickableContainerRecipe({
    isDisabled: isActionDisabled,
    isInteractive,
  });

  const handleControlClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (isActionDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const forwardSurfaceEvent = (
    event: ReactMouseEvent<HTMLDivElement>,
    type: 'auxclick' | 'click',
  ) => {
    const root = event.currentTarget;
    const control = controlRef.current;
    const targetNode = event.target instanceof Node ? event.target : null;

    if (
      control == null ||
      (targetNode != null && control.contains(targetNode))
    ) {
      return;
    }

    if (
      event.defaultPrevented ||
      isInteractiveTarget(event.target, root) ||
      hasSelectionWithin(root)
    ) {
      return;
    }

    if (type === 'auxclick' && (!renderAsLink || event.button !== 1)) {
      return;
    }

    event.stopPropagation();
    if (isActionDisabled) {
      event.preventDefault();
      return;
    }

    control.dispatchEvent(cloneMouseEvent(event, type));
  };

  const content = (
    <div className={classes.content} data-clickable-content="">
      {children}
    </div>
  );

  if (!isInteractive) {
    return (
      <div
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {content}
      </div>
    );
  }

  const root = (
    <div
      className={cx(classes.root, className)}
      data-clickable-disabled={isActionDisabled ? 'true' : undefined}
      data-testid={dataTestId}
      onAuxClick={event => forwardSurfaceEvent(event, 'auxclick')}
      onClick={event => forwardSurfaceEvent(event, 'click')}
      ref={mergeRefs(ref, tooltip.ref)}
      style={style}>
      <ActionElement
        aria-describedby={hasDisabledReason ? tooltip.describedBy : undefined}
        aria-disabled={isActionDisabled || undefined}
        aria-label={label}
        className={classes.control}
        data-clickable-control=""
        href={renderAsLink ? href : undefined}
        isLink={renderAsLink}
        onClick={handleControlClick}
        ref={controlRef}
        rel={renderAsLink ? linkRel : undefined}
        target={renderAsLink ? target : undefined}
      />
      <div
        aria-hidden="true"
        className={classes.overlay}
        data-clickable-overlay=""
      />
      {content}
    </div>
  );

  return (
    <>
      {root}
      {hasDisabledReason ? tooltip.renderTooltip(disabledReason) : null}
    </>
  );
}

ClickableContainer.displayName = 'ClickableContainer';
