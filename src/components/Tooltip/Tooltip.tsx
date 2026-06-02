import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css, cx} from 'styled-system/css';
import {mergeRefs} from '../../internal/mergeRefs';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';
import type {LayerAlignment, LayerPlacement} from '../../internal/useLayer';
import {useTooltip, type TooltipFocusTrigger} from './useTooltip';

export type {TooltipFocusTrigger} from './useTooltip';

export interface TooltipProps {
  /**
   * Cross-axis alignment of the tooltip relative to the anchor.
   * @default 'center'
   */
  alignment?: LayerAlignment;
  /**
   * External ref to the anchor element. When provided, `children` is optional.
   */
  anchorRef?: React.RefObject<HTMLElement | null>;
  /**
   * Element(s) that the tooltip is anchored to.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the wrapper.
   */
  className?: string;
  /**
   * Content rendered inside the tooltip popup.
   */
  content: ReactNode;
  /**
   * Inline styles applied to the tooltip content area.
   */
  contentStyle?: CSSProperties;
  /**
   * Test ID applied to the wrapper.
   */
  'data-testid'?: string;
  /**
   * Delay in milliseconds before the tooltip appears.
   * @default 200
   */
  delay?: number;
  /**
   * How focus interactions trigger the tooltip.
   * @default 'auto'
   */
  focusTrigger?: TooltipFocusTrigger;
  /**
   * Whether to show a dashed underline on text-only children.
   * @default 'auto'
   */
  hasHoverIndication?: 'auto' | boolean;
  /**
   * Delay in milliseconds before the tooltip hides after leaving.
   * @default 0
   */
  hideDelay?: number;
  /**
   * Whether the tooltip is open by default (uncontrolled).
   */
  isDefaultOpen?: boolean;
  /**
   * Whether the tooltip can be shown.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Controlled open state of the tooltip.
   */
  isOpen?: boolean;
  /**
   * Called when the tooltip open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Preferred placement of the tooltip relative to the anchor.
   * @default 'above'
   */
  placement?: LayerPlacement;
  /**
   * Ref forwarded to the wrapper element.
   */
  ref?: Ref<HTMLDivElement | HTMLSpanElement>;
  /**
   * Inline styles applied to the wrapper.
   */
  style?: CSSProperties;
}

const styles = {
  wrapperContents: css({
    display: 'contents',
  }),
  wrapperInline: css({
    display: 'inline',
  }),
  hoverIndication: css({
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: 'fg.muted',
    textUnderlineOffset: '2px',
  }),
};

function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * Displays contextual information in a popup anchored to a trigger element.
 */
export function Tooltip({
  children,
  anchorRef,
  content,
  contentStyle,
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

  useIsomorphicLayoutEffect(() => {
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

  useIsomorphicLayoutEffect(() => {
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
    return <>{tooltip.renderTooltip(content, {contentStyle})}</>;
  }

  if (textOnly) {
    return (
      <>
        <span
          aria-describedby={tooltip.describedBy}
          className={cx(
            styles.wrapperInline,
            showHoverIndication ? styles.hoverIndication : undefined,
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
        {tooltip.renderTooltip(content, {contentStyle})}
      </>
    );
  }

  return (
    <>
      <div
        className={cx(styles.wrapperContents, className)}
        data-testid={dataTestId}
        ref={mergeRefs(wrapperRef, ref as Ref<HTMLDivElement>)}
        style={style}>
        {children}
      </div>
      {tooltip.renderTooltip(content, {contentStyle})}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
