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
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';
import {mergeRefs} from 'internal/mergeRefs';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {css} from 'styled-system/css';

export interface OverflowItem {
  child: ReactElement;
  index: number;
}

export interface OverflowListProps {
  behavior?: 'observeParent' | 'observeSelf';
  children: ReactNode;
  className?: string;
  collapseFrom?: 'end' | 'start';
  gap?: number;
  minVisibleItems?: number;
  overflowRenderer?: (overflowItems: OverflowItem[]) => ReactNode;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
}

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minW: 0,
  }),
  fillParent: css({
    flex: '1 1 0',
  }),
  measureContainer: css({
    position: 'absolute',
    visibility: 'hidden',
    h: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  }),
  measureIndicator: css({
    display: 'inline-flex',
  }),
} as const;

function getAvailableWidth(
  container: HTMLElement,
  observeParent: boolean,
): number {
  if (observeParent && container.parentElement != null) {
    const parent = container.parentElement;
    const parentStyle = window.getComputedStyle(parent);
    const paddingLeft = Number.parseFloat(parentStyle.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(parentStyle.paddingRight) || 0;
    return parent.clientWidth - paddingLeft - paddingRight;
  }

  return container.offsetWidth;
}

export function OverflowList({
  behavior = 'observeSelf',
  children,
  className,
  collapseFrom = 'end',
  gap = 0,
  minVisibleItems = 0,
  overflowRenderer,
  ref,
  style,
}: OverflowListProps): React.JSX.Element {
  // eslint-disable-next-line @eslint-react/no-children-to-array -- matches XDSOverflowList: normalizes children before width measurement
  const childArray = Children.toArray(children) as ReactElement[];
  const itemCount = childArray.length;
  const observeParent = behavior === 'observeParent';
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
      getAvailableWidth(container, observeParent),
      container.offsetWidth || Number.POSITIVE_INFINITY,
    );
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
      const gapWidth = count > 0 ? gap : 0;
      const candidateWidth = totalWidth + itemWidth + gapWidth;
      const isLastItem = count === orderedWidths.length - 1;
      const reservedWidth = isLastItem
        ? 0
        : indicatorWidth + (count > 0 || indicatorWidth > 0 ? gap : 0);

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
  }, [collapseFrom, gap, itemCount, minVisibleItems, observeParent]);

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
  }, [calculate]);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (container == null || typeof ResizeObserver === 'undefined') {
      return;
    }

    const target =
      observeParent && container.parentElement != null
        ? container.parentElement
        : container;
    const observer = new ResizeObserver(calculate);
    observer.observe(target);
    return () => observer.disconnect();
  }, [calculate, observeParent]);

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

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.measureContainer}
        inert
        ref={measureRefCallback}
        style={{gap}}>
        {childArray}
        {isReactNode(measureIndicator) ? (
          <div className={styles.measureIndicator}>{measureIndicator}</div>
        ) : null}
      </div>
      <div
        className={cx(
          styles.container,
          observeParent && hasOverflow ? styles.fillParent : undefined,
          className,
        )}
        ref={mergeRefs(ref, containerRefCallback)}
        style={{gap, ...style}}>
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
