import {
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import {mergeRefs} from '../../lib/mergeRefs';
import type {LayerAlignment, LayerPlacement} from './useLayer';
import {useTooltip, type TooltipFocusTrigger} from './useTooltip';

export type {TooltipFocusTrigger} from './useTooltip';

export interface TooltipProps {
  alignment?: LayerAlignment;
  anchorRef?: React.RefObject<HTMLElement | null>;
  children?: ReactNode;
  className?: string;
  content: ReactNode;
  'data-testid'?: string;
  delay?: number;
  focusTrigger?: TooltipFocusTrigger;
  hasHoverIndication?: 'auto' | boolean;
  hideDelay?: number;
  isDefaultOpen?: boolean;
  isEnabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: LayerPlacement;
  ref?: Ref<HTMLDivElement | HTMLSpanElement>;
  style?: CSSProperties;
}

const wrapperContentsClassName = css({
  display: 'contents',
});

const wrapperInlineClassName = css({
  display: 'inline',
});

const hoverIndicationClassName = css({
  textDecorationLine: 'underline',
  textDecorationStyle: 'dashed',
  textDecorationColor: 'fg.muted',
  textUnderlineOffset: '2px',
});

function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export function Tooltip({
  children,
  anchorRef,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 200,
  hideDelay = 0,
  focusTrigger = 'auto',
  isEnabled = true,
  isOpen,
  isDefaultOpen,
  onOpenChange,
  hasHoverIndication = 'auto',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TooltipProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textOnly = children != null ? isTextOnly(children) : false;
  const showHoverIndication =
    hasHoverIndication === true || (hasHoverIndication === 'auto' && textOnly);

  const handleShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const tooltip = useTooltip({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    isEnabled,
    isOpen,
    isDefaultOpen,
    onShow: handleShow,
    onHide: handleHide,
  });

  useLayoutEffect(() => {
    if (anchorRef == null) {
      return;
    }

    const element = anchorRef.current;
    if (element == null) {
      return;
    }

    tooltip.ref(element);
    const existingDescribedBy = element.getAttribute('aria-describedby');
    element.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, tooltip.describedBy) ?? '',
    );

    return () => {
      tooltip.ref(null);
      if (existingDescribedBy != null) {
        element.setAttribute('aria-describedby', existingDescribedBy);
        return;
      }

      element.removeAttribute('aria-describedby');
    };
  }, [anchorRef, tooltip]);

  useLayoutEffect(() => {
    if (anchorRef != null || textOnly) {
      return;
    }

    const firstChild = wrapperRef.current?.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) {
      return;
    }

    tooltip.ref(firstChild);
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, tooltip.describedBy) ?? '',
    );

    return () => {
      tooltip.ref(null);
      if (existingDescribedBy != null) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
        return;
      }

      firstChild.removeAttribute('aria-describedby');
    };
  }, [anchorRef, textOnly, tooltip]);

  if (anchorRef != null && children == null) {
    return <>{tooltip.renderTooltip(content)}</>;
  }

  if (textOnly) {
    return (
      <>
        <span
          aria-describedby={tooltip.describedBy}
          className={cx(
            wrapperInlineClassName,
            showHoverIndication ? hoverIndicationClassName : undefined,
            className,
          )}
          data-testid={dataTestId}
          ref={mergeRefs(tooltip.ref, ref)}
          style={style}
          // Text-only tooltip triggers need keyboard access.
          // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex
          tabIndex={0}>
          {children}
        </span>
        {tooltip.renderTooltip(content)}
      </>
    );
  }

  return (
    <>
      <div
        className={cx(wrapperContentsClassName, className)}
        data-testid={dataTestId}
        ref={mergeRefs(wrapperRef, ref as Ref<HTMLDivElement>)}
        style={style}>
        {children}
      </div>
      {tooltip.renderTooltip(content)}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
