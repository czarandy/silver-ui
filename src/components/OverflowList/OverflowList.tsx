'use client';

import {
  Children,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {overflowListRecipe} from 'components/OverflowList/OverflowList.recipe';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import type {SpacingToken} from 'internal/spacingTokens';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {cx} from 'utils/cx';

export interface OverflowItem {
  /**
   * The original child element.
   */
  child: ReactElement;
  /**
   * The child's zero-based position in the complete list.
   */
  index: number;
}

export interface OverflowListProps {
  /**
   * Element whose width controls the fit calculation. `observeParent` uses
   * the parent's content width and is useful when the list shares a flex row
   * with other content.
   * @default 'observeSelf'
   */
  behavior?: 'observeParent' | 'observeSelf';
  /**
   * Items to measure and render.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the visible row.
   */
  className?: string;
  /**
   * Side of the list from which items are collapsed.
   * @default 'end'
   */
  collapseFrom?: 'end' | 'start';
  /**
   * Test ID applied to the visible row. The hidden measurement row uses the
   * same value with a `-measure` suffix.
   */
  'data-testid'?: string;
  /**
   * Gap between visible items, on the spacing scale.
   * @default 0
   */
  gap?: SpacingToken;
  /**
   * Minimum number of items kept visible even when they exceed the available
   * width.
   * @default 0
   */
  minVisibleItems?: number;
  /**
   * Renders the collapsed items, typically as a `+N` indicator. The callback
   * receives each item's original child and index.
   */
  overflowRenderer?: (overflowItems: OverflowItem[]) => ReactNode;
  /**
   * Ref forwarded to the visible row.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the visible row.
   */
  style?: CSSProperties;
}

function getAvailableWidth(
  container: HTMLElement,
  isObservingParent: boolean,
): number {
  if (isObservingParent && container.parentElement != null) {
    const parent = container.parentElement;
    const parentStyle = window.getComputedStyle(parent);
    const paddingLeft = Number.parseFloat(parentStyle.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(parentStyle.paddingRight) || 0;
    return parent.clientWidth - paddingLeft - paddingRight;
  }

  return container.offsetWidth;
}

function getGapWidth(container: HTMLElement): number {
  const containerStyle = window.getComputedStyle(container);
  return (
    Number.parseFloat(containerStyle.columnGap) ||
    Number.parseFloat(containerStyle.gap) ||
    0
  );
}

/**
 * Renders as many items as fit in one row and collapses the remainder into a
 * custom overflow indicator.
 *
 * To measure natural item widths accurately, `OverflowList` renders every
 * child in a hidden, inert measurement row, then renders the visible slice
 * again. Visible child components therefore mount twice, and even collapsed
 * children mount once for measurement. Avoid using it for hundreds of
 * expensive items without first virtualizing or reducing them.
 */
export function OverflowList({
  behavior = 'observeSelf',
  children,
  className,
  collapseFrom = 'end',
  'data-testid': dataTestId,
  gap = 0,
  minVisibleItems = 0,
  overflowRenderer,
  ref,
  style,
}: OverflowListProps): React.JSX.Element {
  // eslint-disable-next-line @eslint-react/no-children-to-array -- normalizes children before width measurement
  const childArray = Children.toArray(children) as ReactElement[];
  const itemCount = childArray.length;
  const isObservingParent = behavior === 'observeParent';
  const [visibleCount, setVisibleCount] = useState(itemCount);
  const containerRef = useRef<HTMLElement | null>(null);
  const measureRef = useRef<HTMLElement | null>(null);

  const calculate = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (container == null || measure == null) {
      return;
    }

    const availableWidth = Math.min(
      getAvailableWidth(container, isObservingParent),
      container.offsetWidth || Number.POSITIVE_INFINITY,
    );
    const resolvedGap = getGapWidth(container);
    const allChildren = Array.from(measure.children) as HTMLElement[];
    const hasIndicator = allChildren.length > itemCount;
    const measuredItems = hasIndicator
      ? allChildren.slice(0, itemCount)
      : allChildren;
    const indicatorWidth = hasIndicator
      ? allChildren[allChildren.length - 1].offsetWidth
      : 0;

    if (measuredItems.length === 0) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- visible count is derived from measured DOM widths
      setVisibleCount(0);
      return;
    }

    const measuredWidths = measuredItems.map(item => item.offsetWidth);
    const orderedWidths =
      collapseFrom === 'end' ? measuredWidths : [...measuredWidths].reverse();
    let totalWidth = 0;
    let count = 0;

    for (const itemWidth of orderedWidths) {
      const gapWidth = count > 0 ? resolvedGap : 0;
      const candidateWidth = totalWidth + itemWidth + gapWidth;
      const isLastItem = count === orderedWidths.length - 1;
      const reservedWidth = isLastItem
        ? 0
        : indicatorWidth + (count > 0 || indicatorWidth > 0 ? resolvedGap : 0);

      if (
        candidateWidth + reservedWidth > availableWidth &&
        count >= minVisibleItems
      ) {
        break;
      }

      totalWidth = candidateWidth;
      count++;
    }

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- visible count is derived from measured DOM widths
    setVisibleCount(Math.max(Math.min(count, itemCount), minVisibleItems));
  }, [collapseFrom, isObservingParent, itemCount, minVisibleItems]);

  const containerRefCallback = useCallback((element: HTMLDivElement | null) => {
    containerRef.current = element;
  }, []);

  const measureRefCallback = useCallback(
    (element: HTMLDivElement | null) => {
      measureRef.current = element;
      if (element != null) {
        calculate();
      }
    },
    [calculate],
  );

  useIsomorphicLayoutEffect(() => {
    calculate();
  }, [calculate, className, gap, style]);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (container == null || typeof ResizeObserver === 'undefined') {
      return;
    }

    const target =
      isObservingParent && container.parentElement != null
        ? container.parentElement
        : container;
    const observer = new ResizeObserver(calculate);
    observer.observe(target);
    return () => observer.disconnect();
  }, [calculate, isObservingParent]);

  const allItems: OverflowItem[] = childArray.map((child, index) => ({
    child,
    index,
  }));
  const visibleItems =
    collapseFrom === 'end'
      ? allItems.slice(0, visibleCount)
      : allItems.slice(itemCount - visibleCount);
  const overflowItems =
    collapseFrom === 'end'
      ? allItems.slice(visibleCount)
      : allItems.slice(0, itemCount - visibleCount);
  const hasOverflow = visibleCount < itemCount;
  const measureIndicator = overflowRenderer?.(allItems);
  const classes = overflowListRecipe({
    fillsParent: isObservingParent && hasOverflow,
    gap,
  });

  return (
    <>
      <div
        aria-hidden="true"
        className={classes.measure}
        data-testid={dataTestId == null ? undefined : `${dataTestId}-measure`}
        inert
        ref={measureRefCallback}>
        {childArray}
        {isNonEmptyReactNode(measureIndicator) ? (
          <div className={classes.measureIndicator}>{measureIndicator}</div>
        ) : null}
      </div>
      <div
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={mergeRefs(ref, containerRefCallback)}
        style={style}>
        {collapseFrom === 'start' && hasOverflow
          ? overflowRenderer?.(overflowItems)
          : null}
        {visibleItems.map(({child}) => child)}
        {collapseFrom === 'end' && hasOverflow
          ? overflowRenderer?.(overflowItems)
          : null}
      </div>
    </>
  );
}

OverflowList.displayName = 'OverflowList';
