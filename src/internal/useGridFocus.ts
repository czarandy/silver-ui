import {useCallback, useRef} from 'react';

export interface UseGridFocusOptions {
  cellSelector?: string;
  columns: number;
  onNavigateAfter?: (column: number, offset: number) => void;
  onNavigateBefore?: (column: number, offset: number) => void;
  onPageDown?: () => void;
  onPageUp?: () => void;
}

export interface UseGridFocusReturn<T extends HTMLElement = HTMLElement> {
  focusCell: (index: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  gridRef: React.RefObject<T | null>;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

export function useGridFocus<T extends HTMLElement = HTMLElement>({
  columns,
  cellSelector = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  onNavigateAfter,
  onNavigateBefore,
  onPageDown,
  onPageUp,
}: UseGridFocusOptions): UseGridFocusReturn<T> {
  const gridRef = useRef<T>(null);

  const getCells = useCallback(() => {
    return gridRef.current == null
      ? []
      : Array.from(gridRef.current.querySelectorAll<HTMLElement>(cellSelector));
  }, [cellSelector]);

  const focusCell = useCallback(
    (index: number) => {
      const cells = getCells();
      const clampedIndex = Math.max(0, Math.min(index, cells.length - 1));
      cells[clampedIndex]?.focus();
    },
    [getCells],
  );

  const focusFirst = useCallback(() => focusCell(0), [focusCell]);

  const focusLast = useCallback(() => {
    const cells = getCells();
    cells.at(-1)?.focus();
  }, [getCells]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const cells = getCells();
      const currentIndex = cells.findIndex(
        cell => cell === document.activeElement,
      );
      if (currentIndex === -1) {
        return;
      }

      const currentRow = Math.floor(currentIndex / columns);
      const currentColumn = currentIndex % columns;
      const totalRows = Math.ceil(cells.length / columns);
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = currentIndex + 1;
          break;
        case 'ArrowLeft':
          nextIndex = currentIndex - 1;
          break;
        case 'ArrowDown':
          if (currentRow >= totalRows - 1) {
            onNavigateAfter?.(currentColumn, columns);
          } else {
            nextIndex = currentIndex + columns;
          }
          break;
        case 'ArrowUp':
          if (currentRow <= 0) {
            onNavigateBefore?.(currentColumn, columns);
          } else {
            nextIndex = currentIndex - columns;
          }
          break;
        case 'Home':
          nextIndex = event.ctrlKey || event.metaKey ? 0 : currentRow * columns;
          break;
        case 'End':
          nextIndex =
            event.ctrlKey || event.metaKey
              ? cells.length - 1
              : Math.min((currentRow + 1) * columns - 1, cells.length - 1);
          break;
        case 'PageUp':
          onPageUp?.();
          break;
        case 'PageDown':
          onPageDown?.();
          break;
        default:
          return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (nextIndex == null) {
        return;
      }

      if (nextIndex < 0) {
        onNavigateBefore?.(currentColumn, 1);
        return;
      }

      if (nextIndex >= cells.length) {
        onNavigateAfter?.(currentColumn, 1);
        return;
      }

      cells[nextIndex]?.focus();
    },
    [
      columns,
      getCells,
      onNavigateAfter,
      onNavigateBefore,
      onPageDown,
      onPageUp,
    ],
  );

  return {gridRef, handleKeyDown, focusCell, focusFirst, focusLast};
}
