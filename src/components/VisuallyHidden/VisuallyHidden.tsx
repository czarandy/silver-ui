/* eslint-disable silver-ui/require-component-props -- VisuallyHidden intentionally does not accept `className`/`style`: its clip styles must not be overridable, or the hidden content could be accidentally revealed. Accessibility-relevant props (aria-*, role, id, data-*, event handlers) still pass through to the root. */
import type {
  ComponentPropsWithoutRef,
  ElementType,
  JSX,
  ReactNode,
  Ref,
} from 'react';
import {css} from 'styled-system/css';

/**
 * Elements `VisuallyHidden` can render as. Defaults to `span` for inline use;
 * use a block-level element such as `div` when wrapping block content or
 * hosting an `aria-live` region, since an inline element is not a valid
 * live-region container.
 */
export type VisuallyHiddenElement = 'div' | 'label' | 'p' | 'span';

export interface VisuallyHiddenProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'className' | 'ref' | 'style'
> {
  /**
   * Element rendered as the root. Default is `span`. Use `div` (or another
   * block element) for block content and `aria-live` regions.
   */
  as?: VisuallyHiddenElement;
  children?: ReactNode;
  /**
   * Test id applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
}

// The canonical screen-reader-only recipe. These styles are applied internally
// and cannot be overridden by consumers (no `className`/`style` pass-through)
// so the content can never be accidentally revealed.
const styles = {
  root: css({
    position: 'absolute',
    // Pin to the top-left (logical, RTL-safe) so a positioned ancestor can't
    // reveal the node or let it contribute to scroll/layout.
    insetBlockStart: 0,
    insetInlineStart: 0,
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    // Modern clip, plus the legacy `clip` fallback for older assistive tech.
    clipPath: 'inset(50%)',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    // The clipped 1px node must not catch pointer events or be captured by
    // select-all/copy (which would otherwise copy invisible text).
    pointerEvents: 'none',
    userSelect: 'none',
  }),
};

/**
 * Renders content that is available to assistive technology but hidden from
 * view. Use it for screen-reader-only labels, `aria-live` announcements, and
 * "skip" affordances.
 *
 * The hiding styles are intentionally not customizable — `className` and
 * `style` are not accepted — but accessibility-relevant props (`aria-*`,
 * `role`, `id`, `data-*`, event handlers) pass through to the root element.
 */
export function VisuallyHidden({
  as = 'span',
  children,
  ref,
  ...props
}: VisuallyHiddenProps): JSX.Element {
  const Component = as as ElementType;

  return (
    <Component className={styles.root} ref={ref} {...props}>
      {children}
    </Component>
  );
}

VisuallyHidden.displayName = 'VisuallyHidden';
