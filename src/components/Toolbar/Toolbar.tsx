'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {toolbarRecipe} from 'components/Toolbar/Toolbar.recipe';
import useKeyboardHint from 'hooks/useKeyboardHint';
import useListFocus from 'hooks/useListFocus';
import {SizeContext, type AmbientSize} from 'internal/SizeContext';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import type {SpacingToken} from 'internal/spacingTokens';
import {cx} from 'utils/cx';

export type ToolbarSize = AmbientSize;
export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarDividerSide = 'bottom' | 'end' | 'start' | 'top';
export type ToolbarGap = SpacingToken;

export interface ToolbarProps {
  /**
   * Content centered between the start and end slots. When present, the
   * layout switches to a three-track grid (`1fr auto 1fr`) so the center
   * stays centered regardless of how wide the outer slots are.
   */
  centerContent?: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Which sides get a hairline divider border.
   */
  dividers?: ReadonlyArray<ToolbarDividerSide>;
  /**
   * Content aligned to the end (right in LTR).
   */
  endContent?: ReactNode;
  /**
   * Gap between items within each slot, using the spacing scale.
   * @default 1
   */
  gap?: ToolbarGap;
  /**
   * Accessible label for the toolbar.
   */
  label: string;
  /**
   * Layout and keyboard-navigation orientation. Controls which arrow keys
   * move focus between items.
   * @default 'horizontal'
   */
  orientation?: ToolbarOrientation;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Toolbar size. Children with a `size` prop (Button, ButtonGroup,
   * SegmentedControl, Select, Tabs, TextInput) inherit it as their default,
   * so one `size` here keeps every control in the bar matching.
   * @default 'md'
   */
  size?: ToolbarSize;
  /**
   * Content aligned to the start (left in LTR).
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

/**
 * Focusable toolbar items, in DOM order. Disabled elements are excluded (they
 * cannot receive focus), as is anything inside a child's popover (an open
 * DropdownMenu's items are not toolbar items).
 */
function getFocusableItems(
  container: HTMLElement | null,
): ReadonlyArray<HTMLElement> {
  if (container == null) {
    return [];
  }
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    element =>
      !element.matches(':disabled') && element.closest('[popover]') == null,
  );
}

/**
 * Makes `activeItem` the toolbar's single tab stop, falling back to the first
 * item when it is absent, per the WAI-ARIA toolbar pattern.
 */
function applyRovingTabStops(
  items: ReadonlyArray<HTMLElement>,
  activeItem: HTMLElement | null,
): void {
  const tabStop =
    activeItem != null && items.includes(activeItem) ? activeItem : items[0];
  for (const item of items) {
    item.tabIndex = item === tabStop ? 0 : -1;
  }
}

/**
 * Whether the element handles arrow keys itself (text caret, `<select>`,
 * radios, sliders), in which case the toolbar must not steal them to move
 * focus.
 */
function usesArrowKeys(element: HTMLElement): boolean {
  if (
    element.matches(
      'select, textarea, [contenteditable]:not([contenteditable="false"])',
    )
  ) {
    return true;
  }
  return (
    element instanceof HTMLInputElement &&
    ![
      'button',
      'checkbox',
      'color',
      'file',
      'image',
      'reset',
      'submit',
    ].includes(element.type)
  );
}

/**
 * General-purpose toolbar with start, center, and end content slots.
 *
 * Renders a `role="toolbar"` container with roving-tabindex keyboard
 * navigation: the whole bar is one tab stop, and the arrow keys move between
 * the controls inside it. The toolbar's `size` cascades to sizeable children
 * (Button, ButtonGroup, SegmentedControl, Select, Tabs, TextInput) as their
 * default, so the bar's controls stay visually coordinated.
 *
 * Use it for contextual actions within a content area — above a table, as a
 * card header with actions, or in a panel — not for app-wide navigation
 * (use TopNav for that).
 */
export function Toolbar({
  centerContent,
  className,
  'data-testid': dataTestId,
  dividers,
  endContent,
  gap = 1,
  label,
  orientation = 'horizontal',
  ref,
  size = 'md',
  startContent,
  style,
}: ToolbarProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const getItems = useCallback(
    () => getFocusableItems(containerRef.current),
    [],
  );
  const {handleKeyDown: handleListKeyDown} = useListFocus({
    getItems,
    orientation,
  });
  const hint = useKeyboardHint({orientation});

  // The toolbar cannot put `tabIndex` on children it does not render, so the
  // roving tab stop is managed in the DOM: applied after mount, and re-applied
  // when children mount, unmount, or change disabled state.
  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return undefined;
    }
    const apply = (): void => {
      if (
        lastFocusedRef.current != null &&
        !lastFocusedRef.current.isConnected
      ) {
        lastFocusedRef.current = null;
      }
      applyRovingTabStops(getFocusableItems(container), lastFocusedRef.current);
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(container, {
      // `tabindex` is deliberately not observed — `apply` writes it.
      attributeFilter: ['aria-disabled', 'disabled', 'href'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      hint.onKeyDown(event);
      if (event.defaultPrevented) {
        // A nested widget (Tabs, SegmentedControl, an opening Select) already
        // consumed the key; moving focus again would double-handle it.
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && usesArrowKeys(target)) {
        return;
      }
      handleListKeyDown(event);
    },
    [handleListKeyDown, hint],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      hint.onFocus(event);
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const items = getFocusableItems(containerRef.current);
      if (items.includes(target)) {
        // The last-focused item stays the tab stop, so tabbing back into the
        // toolbar returns to where the user left off.
        lastFocusedRef.current = target;
        applyRovingTabStops(items, target);
      }
    },
    [hint],
  );

  const hasCenterContent = isNonEmptyReactNode(centerContent);
  const hasStartContent = isNonEmptyReactNode(startContent);
  const hasEndContent = isNonEmptyReactNode(endContent);

  const classes = toolbarRecipe({
    dividerBottom: dividers?.includes('bottom') ?? false,
    dividerEnd: dividers?.includes('end') ?? false,
    dividerStart: dividers?.includes('start') ?? false,
    dividerTop: dividers?.includes('top') ?? false,
    gap,
    hasCenterContent,
    hasEndContent,
    hasStartContent,
    orientation,
    size,
  });

  return (
    <SizeContext value={size}>
      <div
        aria-label={label}
        aria-orientation={orientation}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        onBlur={hint.onBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={mergeRefs(containerRef, ref)}
        role="toolbar"
        style={style}>
        {hasStartContent || hasCenterContent ? (
          <div className={classes.start}>{startContent}</div>
        ) : null}
        {hasCenterContent ? (
          <div className={classes.center}>{centerContent}</div>
        ) : null}
        {hasCenterContent || hasEndContent ? (
          <div className={classes.end}>{endContent}</div>
        ) : null}
        {hint.hintElement}
      </div>
    </SizeContext>
  );
}

Toolbar.displayName = 'Toolbar';
