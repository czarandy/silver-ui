import {useCallback, useMemo, useRef} from 'react';
import {css} from 'styled-system/css';
import {DEFAULT_MIN_COLUMN_WIDTH, pixel} from '../../columnUtils';
import type {
  ColumnWidth,
  HeaderCellRenderProps,
  TableColumn,
  TablePlugin,
} from '../../types';

export interface UseTableColumnResizeConfig {
  columns?: TableColumn<Record<string, unknown>>[];
  columnWidths?: Record<string, number>;
  maxWidth?: number;
  minWidth?: number;
  onColumnResizeEnd?: (updates: Record<string, number>) => void;
}

interface DragState {
  columnKey: string;
  initialWidth: number;
  maxWidth: number;
  minWidth: number;
  startX: number;
  th: HTMLTableCellElement;
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
    w: '2',
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
      w: '1px',
      bg: 'transparent',
      transitionDuration: 'fast',
      transitionProperty: 'background-color, width',
      transitionTimingFunction: 'default',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
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
}

function ResizeHandle({
  column,
  config,
}: {
  column: TableColumn<Record<string, unknown>>;
  config: UseTableColumnResizeConfig;
}): React.JSX.Element {
  const dragStateRef = useRef<DragState | null>(null);
  const commitWidth = useCallback(
    (columnKey: string, width: number) => {
      config.onColumnResizeEnd?.({[columnKey]: Math.round(width)});
    },
    [config],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (drag == null) {
        return;
      }
      const delta = event.clientX - drag.startX;
      const nextWidth = Math.min(
        drag.maxWidth,
        Math.max(drag.minWidth, drag.initialWidth + delta),
      );
      applyWidth(drag.th, nextWidth);
    },
    [dragStateRef],
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragStateRef.current;
    if (drag != null) {
      const width = drag.th.getBoundingClientRect().width;
      commitWidth(drag.columnKey, width);
    }
    dragStateRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [commitWidth, dragStateRef, handlePointerMove]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const th = event.currentTarget.closest('th');
      if (th == null) {
        return;
      }
      const currentWidth =
        config.columnWidths?.[column.key] ?? th.getBoundingClientRect().width;
      dragStateRef.current = {
        columnKey: column.key,
        initialWidth: currentWidth,
        maxWidth: config.maxWidth ?? Number.POSITIVE_INFINITY,
        minWidth: resolveColumnMinWidth(column.width, config.minWidth),
        startX: event.clientX,
        th,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [column, config, dragStateRef, handlePointerMove, handlePointerUp],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
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
      const currentWidth =
        config.columnWidths?.[column.key] ??
        th?.getBoundingClientRect().width ??
        (column.width?.type === 'pixel'
          ? column.width.value
          : DEFAULT_MIN_COLUMN_WIDTH);
      const minWidth = resolveColumnMinWidth(column.width, config.minWidth);
      const maxWidth = config.maxWidth ?? Number.POSITIVE_INFINITY;
      const step = event.shiftKey ? KEYBOARD_LARGE_STEP : KEYBOARD_STEP;
      const nextWidth =
        event.key === 'Home'
          ? minWidth
          : event.key === 'End'
            ? Number.isFinite(maxWidth)
              ? maxWidth
              : currentWidth
            : event.key === 'ArrowLeft'
              ? currentWidth - step
              : currentWidth + step;
      commitWidth(
        column.key,
        Math.min(maxWidth, Math.max(minWidth, nextWidth)),
      );
    },
    [column, commitWidth, config],
  );
  const headerLabel =
    typeof column.header === 'string' ? column.header : column.key;

  return (
    <button
      aria-label={`Resize ${headerLabel} column`}
      className={styles.handle}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      type="button"
    />
  );
}

export function useTableColumnResize<T extends Record<string, unknown>>(
  config: UseTableColumnResizeConfig,
): TablePlugin<T> {
  return useMemo(
    (): TablePlugin<T> => ({
      transformColumns(columns: TableColumn<T>[]): TableColumn<T>[] {
        const widths = config.columnWidths;
        if (widths == null) {
          return columns;
        }
        return columns.map(column => {
          if (!Object.prototype.hasOwnProperty.call(widths, column.key)) {
            return column;
          }
          const width = widths[column.key];
          return {...column, width: pixel(width)};
        });
      },
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        if (column.resizable === false) {
          return props;
        }
        return {
          ...props,
          className: styles.headerCell,
          overlay: (
            <>
              {props.overlay}
              <ResizeHandle
                column={column as TableColumn<Record<string, unknown>>}
                config={config}
              />
            </>
          ),
        };
      },
    }),
    [config],
  );
}
