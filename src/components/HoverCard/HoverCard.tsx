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
import {useHoverCard, type HoverCardFocusTrigger} from './useHoverCard';

export type {HoverCardFocusTrigger} from './useHoverCard';

export interface HoverCardProps {
  /**
   * Alignment along the placement axis.
   * @default 'center'
   */
  alignment?: LayerAlignment;
  /**
   * Trigger content.
   */
  children: ReactNode;
  /**
   * Additional class names applied to the trigger wrapper for text triggers.
   */
  className?: string;
  /**
   * Content shown in the floating hover card.
   */
  content: ReactNode;
  /**
   * Test ID applied to the trigger wrapper for text triggers.
   */
  'data-testid'?: string;
  /**
   * Delay before opening on hover, in milliseconds.
   * @default 300
   */
  delay?: number;
  /**
   * Controls focus-trigger behavior.
   * @default 'auto'
   */
  focusTrigger?: HoverCardFocusTrigger;
  /**
   * Whether to visually underline text triggers.
   * @default 'auto'
   */
  hasHoverIndication?: 'auto' | boolean;
  /**
   * Delay before closing after hover/focus leaves, in milliseconds.
   * @default 200
   */
  hideDelay?: number;
  /**
   * Whether to open on initial mount.
   */
  isDefaultOpen?: boolean;
  /**
   * Whether hover/focus interactions are enabled.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Controlled open state.
   */
  isOpen?: boolean;
  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Position relative to the trigger.
   * @default 'above'
   */
  placement?: LayerPlacement;
  /**
   * Ref forwarded to the text trigger wrapper.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the text trigger wrapper.
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
} as const;

function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

function mergeIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean);
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

export function HoverCard({
  children,
  content,
  placement = 'above',
  alignment = 'center',
  delay = 300,
  hideDelay = 200,
  focusTrigger = 'auto',
  isEnabled = true,
  onOpenChange,
  hasHoverIndication = 'auto',
  isOpen,
  isDefaultOpen,
  className,
  style,
  ref,
  'data-testid': dataTestId,
}: HoverCardProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const textOnly = isTextOnly(children);
  const showHoverIndication =
    hasHoverIndication === true || (hasHoverIndication === 'auto' && textOnly);

  const handleShow = useCallback(() => onOpenChange?.(true), [onOpenChange]);
  const handleHide = useCallback(() => onOpenChange?.(false), [onOpenChange]);

  const hoverCard = useHoverCard({
    alignment,
    delay,
    focusTrigger,
    hideDelay,
    isDefaultOpen,
    isEnabled,
    isOpen,
    onHide: handleHide,
    onShow: handleShow,
    placement,
  });

  useIsomorphicLayoutEffect(() => {
    if (textOnly) {
      return;
    }

    const firstChild = wrapperRef.current?.firstElementChild;
    if (!(firstChild instanceof HTMLElement)) {
      return;
    }

    hoverCard.ref(firstChild);
    const existingDescribedBy = firstChild.getAttribute('aria-describedby');
    firstChild.setAttribute(
      'aria-describedby',
      mergeIds(existingDescribedBy, hoverCard.describedBy) ?? '',
    );

    return () => {
      hoverCard.ref(null);
      if (existingDescribedBy != null) {
        firstChild.setAttribute('aria-describedby', existingDescribedBy);
      } else {
        firstChild.removeAttribute('aria-describedby');
      }
    };
  }, [hoverCard, textOnly]);

  const renderedHoverCard = hoverCard.renderHoverCard(content);

  if (textOnly) {
    return (
      <>
        <span
          aria-describedby={hoverCard.describedBy}
          className={cx(
            styles.wrapperInline,
            showHoverIndication ? styles.hoverIndication : undefined,
            className,
          )}
          data-testid={dataTestId}
          ref={mergeRefs(hoverCard.ref, ref)}
          style={style}
          // Text triggers need keyboard access.
          // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex
          tabIndex={0}>
          {children}
        </span>
        {renderedHoverCard}
      </>
    );
  }

  return (
    <>
      <span className={styles.wrapperContents} ref={wrapperRef}>
        {children}
      </span>
      {renderedHoverCard}
    </>
  );
}

HoverCard.displayName = 'HoverCard';
