import {useRef, type CSSProperties, type ReactNode, type Ref} from 'react';
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
   * Element(s) that the tooltip is anchored to.
   */
  children: ReactNode;
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
   * Whether the tooltip can be shown.
   * @default true
   */
  isEnabled?: boolean;
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
 *
 * For attaching a tooltip to an external ref (without wrapping children),
 * use the `useTooltip` hook directly.
 */
export function Tooltip({
  children,
  content,
  contentStyle,
  placement = 'above',
  alignment = 'center',
  delay = 200,
  hideDelay = 0,
  focusTrigger = 'auto',
  isEnabled = true,
  hasHoverIndication = 'auto',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: TooltipProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textOnly = isTextOnly(children);
  const showHoverIndication =
    hasHoverIndication === true || (hasHoverIndication === 'auto' && textOnly);

  const tooltip = useTooltip({
    placement,
    alignment,
    delay,
    hideDelay,
    focusTrigger,
    isEnabled,
  });

  const tooltipRef = tooltip.ref;
  const tooltipDescribedBy = tooltip.describedBy;

  useIsomorphicLayoutEffect(() => {
    if (textOnly) {
      return;
    }

    const firstChild = wrapperRef.current?.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) {
      return;
    }

    tooltipRef(firstChild);
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, tooltipDescribedBy) ?? '',
    );

    return () => {
      tooltipRef(null);
      if (existingDescribedBy != null) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
        return;
      }

      firstChild.removeAttribute('aria-describedby');
    };
  }, [textOnly, tooltipRef, tooltipDescribedBy]);

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
