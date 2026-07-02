'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {DEFAULT_MIN_COLUMN_WIDTH} from 'components/Table/columnUtils';
import type {
  ColumnWidth,
  HeaderCellRenderProps,
  TableColumn,
  TablePlugin,
} from 'components/Table/types';
import {css} from 'styled-system/css';

export interface UseTableColumnResizeConfig {
  columns?: TableColumn<Record<string, unknown>>[];
  columnWidths?: Record<string, number>;
  maxWidth?: number;
  minWidth?: number;
  onColumnResizeEnd?: (updates: Record<string, number>) => void;
}

interface DragState {
  columnKey: string;
  neighborIndex: number | null;
  resizeIndex: number;
  snapshots: ColumnSnapshot[];
  startX: number;
  tableWidth: number;
}

interface ColumnSnapshot {
  initialMaxWidth: string;
  initialMinWidth: string;
  initialWidth: number;
  initialWidthStyle: string;
  key: string;
  maxWidth: number;
  minWidth: number;
  th: HTMLTableCellElement;
}

interface PointerListeners {
  cancel: (event: PointerEvent) => void;
  move: (event: PointerEvent) => void;
  up: (event: PointerEvent) => void;
}

const KEYBOARD_STEP = 10;
const KEYBOARD_LARGE_STEP = 50;

const styles = {
  handle: css({
    position: 'absolute',
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
    w: '4',
    cursor: 'ew-resize',
    borderWidth: 0,
    bg: 'transparent',
    p: 0,
    touchAction: 'none',
    userSelect: 'none',
    _after: {
      content: '""',
      position: 'absolute',
      insetInlineEnd: 0,
      top: 0,
      bottom: 0,
      w: '2px',
      bg: 'transparent',
      transitionDuration: 'fast',
      transitionProperty: 'background-color, width',
      transitionTimingFunction: 'default',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
    _hover: {
      _after: {
        bg: 'primary',
      },
    },
    '@media (pointer: coarse)': {
      display: 'none',
    },
  }),
  headerCell: css({
    overflow: 'visible',
    position: 'relative',
  }),
} as const;

function resolveColumnMinWidth(
  width: ColumnWidth | undefined,
  globalMinWidth: number | undefined,
): number {
  if (globalMinWidth != null) {
    return globalMinWidth;
  }
  if (width?.type === 'pixel') {
    return width.value;
  }
  return width?.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
}

function applyWidth(th: HTMLTableCellElement, width: number): void {
  th.style.width = `${width}px`;
  th.style.minWidth = `${width}px`;
  th.style.maxWidth = `${width}px`;
}

function isProportionalColumn(width: ColumnWidth | undefined): boolean {
  return width == null || width.type === 'proportional';
}

function getRTLMultiplier(element: HTMLElement): number {
  return getComputedStyle(element).direction === 'rtl' ? -1 : 1;
}

function computeColumnWidths(drag: DragState, delta: number): number[] {
  const widths = drag.snapshots.map(snapshot => snapshot.initialWidth);

  if (drag.neighborIndex != null) {
    const neighbor = drag.snapshots[drag.neighborIndex];
    const self = drag.snapshots[drag.resizeIndex];
    const maxDelta = neighbor.initialWidth - neighbor.minWidth;
    const minDelta = self.minWidth - self.initialWidth;
    const clampedDelta = Math.max(minDelta, Math.min(delta, maxDelta));
    widths[drag.resizeIndex] = self.initialWidth + clampedDelta;
    widths[drag.neighborIndex] = neighbor.initialWidth - clampedDelta;
  } else {
    const self = drag.snapshots[drag.resizeIndex];
    widths[drag.resizeIndex] = Math.min(
      self.maxWidth,
      Math.max(self.minWidth, self.initialWidth + delta),
    );
  }

  const lastIndex = drag.snapshots.length - 1;
  const isResizingLastColumnWithoutNeighbor =
    drag.resizeIndex === lastIndex && drag.neighborIndex == null;
  if (
    lastIndex >= 0 &&
    drag.tableWidth > 0 &&
    !isResizingLastColumnWithoutNeighbor
  ) {
    const sumOthers = widths.reduce(
      (sum, width, index) => (index === lastIndex ? sum : sum + width),
      0,
    );
    widths[lastIndex] = Math.max(
      drag.snapshots[lastIndex].minWidth,
      drag.tableWidth - sumOthers,
    );
  }

  return widths;
}

function applyWidths(snapshots: ColumnSnapshot[], widths: number[]): void {
  snapshots.forEach((snapshot, index) => {
    applyWidth(snapshot.th, widths[index]);
  });
}

function restoreSnapshotStyles(snapshots: ColumnSnapshot[]): void {
  snapshots.forEach(snapshot => {
    snapshot.th.style.width = snapshot.initialWidthStyle;
    snapshot.th.style.minWidth = snapshot.initialMinWidth;
    snapshot.th.style.maxWidth = snapshot.initialMaxWidth;
  });
}

function buildUpdates(
  drag: DragState,
  widths: number[],
): Record<string, number> {
  const updates: Record<string, number> = {};
  const lastIndex = drag.snapshots.length - 1;
  const isResizingLastColumnWithoutNeighbor =
    drag.resizeIndex === lastIndex && drag.neighborIndex == null;
  if (isResizingLastColumnWithoutNeighbor) {
    const snapshot = drag.snapshots[drag.resizeIndex];
    updates[snapshot.key] = Math.round(widths[drag.resizeIndex]);
    return updates;
  }
  drag.snapshots.forEach((snapshot, index) => {
    if (index === lastIndex) {
      return;
    }
    updates[snapshot.key] = Math.round(widths[index]);
  });
  return updates;
}

function ResizeHandle({
  columnHeader,
  columnKey,
  configRef,
  currentWidth,
  maxWidth,
  minWidth,
  neighborKey,
}: {
  columnHeader: ReactNode;
  columnKey: string;
  configRef: React.RefObject<UseTableColumnResizeConfig>;
  currentWidth: number | undefined;
  maxWidth: number;
  minWidth: number;
  neighborKey: string | null;
}): React.JSX.Element {
  const dragStateRef = useRef<DragState | null>(null);
  const pointerListenersRef = useRef<PointerListeners | null>(null);

  const removePointerListeners = useCallback(() => {
    const listeners = pointerListenersRef.current;
    if (listeners == null) {
      return;
    }
    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.cancel);
    pointerListenersRef.current = null;
  }, []);

  const buildDragState = useCallback(
    (th: HTMLTableCellElement, startX: number): DragState | null => {
      const headerRow = th.parentElement;
      if (headerRow == null) {
        return null;
      }

      const table = th.closest('table');
      const tableWidth = table?.getBoundingClientRect().width ?? 0;
      const columns = configRef.current.columns;
      const activeHeaderIndex = Array.from(headerRow.children).indexOf(th);
      const activeColumnIndex =
        columns?.findIndex(column => column.key === columnKey) ?? -1;
      const columnIndexOffset =
        activeHeaderIndex >= 0 && activeColumnIndex >= 0
          ? activeHeaderIndex - activeColumnIndex
          : 0;
      const columnsByKey = new Map(
        columns?.map(column => [column.key, column]),
      );
      const currentWidths = configRef.current.columnWidths ?? {};
      const snapshots: ColumnSnapshot[] = [];

      const allHeaders = Array.from(headerRow.children).filter(
        (child): child is HTMLTableCellElement =>
          child instanceof HTMLTableCellElement,
      );
      for (const [index, header] of allHeaders.entries()) {
        const key =
          header
            .querySelector<HTMLElement>('[data-column-key]')
            ?.getAttribute('data-column-key') ??
          columns?.[index - columnIndexOffset]?.key;
        if (key == null) {
          continue;
        }
        const snapshotColumn = columnsByKey.get(key);
        if (columns != null && snapshotColumn == null) {
          continue;
        }
        if (snapshotColumn?.resizable === false) {
          continue;
        }

        const renderedWidth = header.getBoundingClientRect().width;
        const overrideWidth: number | undefined =
          Object.prototype.hasOwnProperty.call(currentWidths, key)
            ? currentWidths[key]
            : undefined;
        snapshots.push({
          initialMaxWidth: header.style.maxWidth,
          initialMinWidth: header.style.minWidth,
          initialWidth:
            overrideWidth ?? (renderedWidth > 0 ? renderedWidth : minWidth),
          initialWidthStyle: header.style.width,
          key,
          maxWidth: configRef.current.maxWidth ?? Number.POSITIVE_INFINITY,
          minWidth:
            snapshotColumn == null
              ? minWidth
              : resolveColumnMinWidth(
                  snapshotColumn.width,
                  configRef.current.minWidth,
                ),
          th: header,
        });
      }

      const resizeIndex = snapshots.findIndex(
        snapshot => snapshot.key === columnKey,
      );
      if (resizeIndex < 0) {
        return null;
      }

      const neighborIndex =
        neighborKey == null
          ? null
          : snapshots.findIndex(snapshot => snapshot.key === neighborKey);

      return {
        columnKey,
        neighborIndex:
          neighborIndex == null || neighborIndex < 0 ? null : neighborIndex,
        resizeIndex,
        snapshots,
        startX,
        tableWidth,
      };
    },
    [columnKey, configRef, minWidth, neighborKey],
  );

  const commitResize = useCallback(
    (drag: DragState, delta: number) => {
      const widths = computeColumnWidths(drag, delta);
      applyWidths(drag.snapshots, widths);
      const updates = buildUpdates(drag, widths);
      if (Object.keys(updates).length > 0) {
        configRef.current.onColumnResizeEnd?.(updates);
      }
    },
    [configRef],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (drag == null) {
        return;
      }
      const delta =
        (event.clientX - drag.startX) *
        getRTLMultiplier(drag.snapshots[drag.resizeIndex].th);
      applyWidths(drag.snapshots, computeColumnWidths(drag, delta));
    },
    [dragStateRef],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const drag = dragStateRef.current;
      removePointerListeners();
      if (drag != null) {
        const delta =
          (event.clientX - drag.startX) *
          getRTLMultiplier(drag.snapshots[drag.resizeIndex].th);
        commitResize(drag, delta);
      }
      dragStateRef.current = null;
    },
    [commitResize, dragStateRef, removePointerListeners],
  );

  const handlePointerCancel = useCallback(() => {
    const drag = dragStateRef.current;
    if (drag != null) {
      restoreSnapshotStyles(drag.snapshots);
    }
    removePointerListeners();
    dragStateRef.current = null;
  }, [dragStateRef, removePointerListeners]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const th = event.currentTarget.closest('th');
      if (th == null) {
        return;
      }
      const drag = buildDragState(th, event.clientX);
      if (drag == null) {
        return;
      }
      dragStateRef.current = drag;
      applyWidths(drag.snapshots, computeColumnWidths(drag, 0));
      pointerListenersRef.current = {
        cancel: handlePointerCancel,
        move: handlePointerMove,
        up: handlePointerUp,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
    },
    [
      buildDragState,
      dragStateRef,
      handlePointerCancel,
      handlePointerMove,
      handlePointerUp,
    ],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Home' &&
        event.key !== 'End'
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const th = event.currentTarget.closest('th');
      if (th == null) {
        return;
      }
      const drag = buildDragState(th, 0);
      if (drag == null) {
        return;
      }
      const activeSnapshot = drag.snapshots[drag.resizeIndex];
      const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const delta =
        event.key === 'Home'
          ? activeSnapshot.minWidth - activeSnapshot.initialWidth
          : event.key === 'End'
            ? Number.isFinite(activeSnapshot.maxWidth)
              ? activeSnapshot.maxWidth - activeSnapshot.initialWidth
              : 0
            : event.key === 'ArrowLeft'
              ? -step * getRTLMultiplier(th)
              : step * getRTLMultiplier(th);
      commitResize(drag, delta);
    },
    [buildDragState, commitResize],
  );
  const headerLabel =
    typeof columnHeader === 'string' ? columnHeader : columnKey;

  /* eslint-disable jsx-a11y-x/no-noninteractive-element-interactions, jsx-a11y-x/no-noninteractive-tabindex -- ARIA separator uses the window splitter keyboard pattern. */
  return (
    <div
      aria-label={`Resize column ${headerLabel}`}
      aria-orientation="vertical"
      aria-valuemax={Number.isFinite(maxWidth) ? maxWidth : undefined}
      aria-valuemin={minWidth}
      aria-valuenow={currentWidth}
      className={styles.handle}
      data-column-key={columnKey}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role="separator"
      tabIndex={0}
    />
  );
  /* eslint-enable jsx-a11y-x/no-noninteractive-element-interactions, jsx-a11y-x/no-noninteractive-tabindex */
}

export function useTableColumnResize<T extends Record<string, unknown>>(
  config: UseTableColumnResizeConfig,
): TablePlugin<T> {
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const globalMinWidth = config.minWidth;
  const maxWidth = config.maxWidth ?? Number.POSITIVE_INFINITY;
  const columnWidths = config.columnWidths;
  const resizableColumns = useMemo(
    () => config.columns?.filter(column => column.resizable !== false),
    [config.columns],
  );

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        if (column.resizable === false) {
          return props;
        }

        let neighborKey: string | null = null;
        if (resizableColumns != null && isProportionalColumn(column.width)) {
          const columnIndex = resizableColumns.findIndex(
            resizableColumn => resizableColumn.key === column.key,
          );
          const isLastResizable = columnIndex === resizableColumns.length - 1;
          if (isLastResizable) {
            return props;
          }
          if (columnIndex >= 0) {
            neighborKey = resizableColumns[columnIndex + 1]?.key ?? null;
          }
        }

        const overrideWidth = columnWidths?.[column.key];
        const widthStyle: CSSProperties | undefined =
          overrideWidth == null
            ? undefined
            : {
                maxWidth: `${overrideWidth}px`,
                minWidth: `${overrideWidth}px`,
                width: `${overrideWidth}px`,
              };
        const effectiveMinWidth = resolveColumnMinWidth(
          column.width,
          globalMinWidth,
        );

        return {
          ...props,
          className: styles.headerCell,
          htmlProps: {
            ...props.htmlProps,
            style:
              widthStyle == null
                ? props.htmlProps.style
                : {...props.htmlProps.style, ...widthStyle},
          },
          overlay: (
            <>
              {props.overlay}
              <ResizeHandle
                columnHeader={column.header ?? column.key}
                columnKey={column.key}
                configRef={configRef}
                currentWidth={overrideWidth}
                maxWidth={maxWidth}
                minWidth={effectiveMinWidth}
                neighborKey={neighborKey}
              />
            </>
          ),
        };
      },
    }),
    [columnWidths, configRef, globalMinWidth, maxWidth, resizableColumns],
  );
}
