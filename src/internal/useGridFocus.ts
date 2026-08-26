'use client';

import {useCallback, useRef} from 'react';

export interface UseGridFocusOptions {
  cellSelector?: string;
  columns: number;
  getIsCellDisabled?: (cell: HTMLElement) => boolean;
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
  getIsCellDisabled,
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
      if (cells.length === 0) {
        return;
      }
      const clampedIndex = Math.max(0, Math.min(index, cells.length - 1));
      const cell = cells[clampedIndex];
      if (getIsCellDisabled?.(cell) !== true) {
        cell.focus();
      }
    },
    [getCells, getIsCellDisabled],
  );

  const focusFirst = useCallback(() => {
    getCells()
      .find(cell => getIsCellDisabled?.(cell) !== true)
      ?.focus();
  }, [getCells, getIsCellDisabled]);

  const focusLast = useCallback(() => {
    const cells = getCells();
    for (let index = cells.length - 1; index >= 0; index -= 1) {
      const cell = cells[index];
      if (getIsCellDisabled?.(cell) !== true) {
        cell.focus();
        return;
      }
    }
  }, [getCells, getIsCellDisabled]);

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
      let searchStep = 1;
      let searchStart: number | null = null;
      let searchEnd = cells.length - 1;

      switch (event.key) {
        case 'ArrowRight':
          searchStart = currentIndex + 1;
          break;
        case 'ArrowLeft':
          searchStart = currentIndex - 1;
          searchEnd = 0;
          searchStep = -1;
          break;
        case 'ArrowDown':
          if (currentRow >= totalRows - 1) {
            onNavigateAfter?.(currentColumn, columns);
          } else {
            searchStart = currentIndex + columns;
            searchStep = columns;
          }
          break;
        case 'ArrowUp':
          if (currentRow <= 0) {
            onNavigateBefore?.(currentColumn, columns);
          } else {
            searchStart = currentIndex - columns;
            searchEnd = 0;
            searchStep = -columns;
          }
          break;
        case 'Home':
          searchStart =
            event.ctrlKey || event.metaKey ? 0 : currentRow * columns;
          searchEnd =
            event.ctrlKey || event.metaKey
              ? cells.length - 1
              : Math.min((currentRow + 1) * columns - 1, cells.length - 1);
          break;
        case 'End':
          searchStart =
            event.ctrlKey || event.metaKey
              ? cells.length - 1
              : Math.min((currentRow + 1) * columns - 1, cells.length - 1);
          searchEnd = event.ctrlKey || event.metaKey ? 0 : currentRow * columns;
          searchStep = -1;
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

      if (searchStart == null) {
        return;
      }

      const isWithinSearchBounds = (index: number): boolean =>
        searchStep > 0 ? index <= searchEnd : index >= searchEnd;
      for (
        let index = searchStart;
        isWithinSearchBounds(index);
        index += searchStep
      ) {
        const cell = cells[index];
        if (getIsCellDisabled?.(cell) !== true) {
          nextIndex = index;
          break;
        }
      }

      if (nextIndex == null && searchStart < 0) {
        onNavigateBefore?.(currentColumn, 1);
        return;
      }

      if (nextIndex == null && searchStart >= cells.length) {
        onNavigateAfter?.(currentColumn, 1);
        return;
      }

      if (nextIndex != null) {
        cells[nextIndex]?.focus();
      }
    },
    [
      columns,
      getCells,
      getIsCellDisabled,
      onNavigateAfter,
      onNavigateBefore,
      onPageDown,
      onPageUp,
    ],
  );

  return {gridRef, handleKeyDown, focusCell, focusFirst, focusLast};
}
