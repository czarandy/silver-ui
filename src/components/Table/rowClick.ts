import type {Ref, RefCallback} from 'react';
import {isIndependentSurfaceEvent} from 'internal/forwardSurfaceEvent';
import {mergeRefs} from 'internal/mergeRefs';
import {css} from 'styled-system/css';

/**
 * Pointer affordance shared by every plugin that makes whole rows clickable.
 * Hover fill stays with the table's `hasHover` option.
 */
export const clickableRowClassName = css({cursor: 'pointer'});

/**
 * Marks plugin control content (selection checkbox, expansion chevron) as
 * `data-table-row-control=""`. A click anywhere in a cell containing it,
 * including the cell padding around the control, belongs to that control
 * rather than to the row.
 */
const ROW_CONTROL_CELL_ATTRIBUTE = 'data-table-row-control';

const ROW_CLICK_OWNER_ATTRIBUTE = 'data-row-click-owner';

function isRowControlCellEvent(event: MouseEvent, row: HTMLElement): boolean {
  const target = event.target instanceof Element ? event.target : null;
  const cell = target?.closest('td, th');
  return (
    cell != null &&
    row.contains(cell) &&
    cell.querySelector(`[${ROW_CONTROL_CELL_ATTRIBUTE}]`) != null
  );
}

/**
 * Claims the row's single whole-row click action. A row can do only one thing
 * when clicked, so a second owner (for example a row link combined with
 * `hasRowClickExpansion`) is a usage error: it throws in development, and in
 * production logs and leaves the row with its first owner.
 */
function claimRowClick(row: HTMLElement, owner: string): (() => void) | null {
  const existingOwner = row.getAttribute(ROW_CLICK_OWNER_ATTRIBUTE);
  if (existingOwner != null && existingOwner !== owner) {
    const message =
      `Table: a row has two click actions, ${existingOwner} and ${owner}. ` +
      'Enable at most one whole-row click action per table.';
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(message);
    }
    console.error(message);
    return null;
  }

  row.setAttribute(ROW_CLICK_OWNER_ATTRIBUTE, owner);
  return () => {
    if (row.getAttribute(ROW_CLICK_OWNER_ATTRIBUTE) === owner) {
      row.removeAttribute(ROW_CLICK_OWNER_ATTRIBUTE);
    }
  };
}

export interface RowClickHandlers {
  /**
   * Called for a middle-button `auxclick` on the row surface.
   */
  onAuxClick?: (event: MouseEvent) => void;
  /**
   * Called for a click on the row surface.
   */
  onClick: (event: MouseEvent) => void;
}

/**
 * Creates the row ref through which a plugin makes a whole row clickable.
 * `TableRow` exposes only className/style/ref, so listeners attach at the DOM
 * level. Clicks that belong to nested controls, plugin control cells, layered
 * surfaces, or a text selection are ignored.
 *
 * Row transforms run as callback factories, not as React component renders.
 */
export function createRowClickRef(
  owner: string,
  getHandlers: () => RowClickHandlers,
  ref: Ref<HTMLTableRowElement> | undefined,
): RefCallback<HTMLTableRowElement> {
  const clickRef: RefCallback<HTMLTableRowElement> = row => {
    if (row == null) {
      return;
    }
    const release = claimRowClick(row, owner);
    if (release == null) {
      return;
    }

    const isRowEvent = (event: MouseEvent): boolean =>
      !isIndependentSurfaceEvent(event, row) &&
      !isRowControlCellEvent(event, row);
    const handleClick = (event: MouseEvent): void => {
      if (isRowEvent(event)) {
        getHandlers().onClick(event);
      }
    };
    const handleAuxClick = (event: MouseEvent): void => {
      const {onAuxClick} = getHandlers();
      if (onAuxClick != null && event.button === 1 && isRowEvent(event)) {
        onAuxClick(event);
      }
    };
    row.addEventListener('click', handleClick);
    row.addEventListener('auxclick', handleAuxClick);
    return () => {
      row.removeEventListener('click', handleClick);
      row.removeEventListener('auxclick', handleAuxClick);
      release();
    };
  };
  return ref == null ? clickRef : mergeRefs(ref, clickRef);
}
