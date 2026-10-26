import type {Ref, RefCallback} from 'react';
import type {TablePlugin} from 'components/Table/types';
import {isIndependentSurfaceEvent} from 'internal/forwardSurfaceEvent';
import {mergeRefs} from 'internal/mergeRefs';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

/**
 * Pointer affordance shared by every plugin that makes whole rows clickable.
 * Hover fill stays with the table's `hasHover` option.
 */
export const clickableRowClassName = css({cursor: 'pointer'});

const ROW_CONTROL_CELL_MARKER = 'silver-table-row-control-cell';

/**
 * Marks a body cell whose clicks, including on the padding around its content,
 * belong to that content rather than to a whole-row click action. Plugins apply
 * it from `transformBodyCell` to their control columns (selection checkbox,
 * expansion chevron) and to consumer-ignored columns.
 */
export const rowControlCellClassName = cx(
  ROW_CONTROL_CELL_MARKER,
  css({cursor: 'auto'}),
);

function isRowControlCellEvent(event: MouseEvent, row: HTMLElement): boolean {
  const target = event.target instanceof Element ? event.target : null;
  const cell = target?.closest('td, th');
  return (
    cell != null &&
    row.contains(cell) &&
    cell.classList.contains(ROW_CONTROL_CELL_MARKER)
  );
}

const rowClickPluginOwners = new WeakMap<object, string>();

/**
 * Registers a plugin as installing a whole-row click action, so `Table` can
 * reject a configuration with more than one.
 */
export function registerRowClickPlugin<T extends Record<string, unknown>>(
  plugin: TablePlugin<T>,
  owner: string,
): TablePlugin<T> {
  rowClickPluginOwners.set(plugin, owner);
  return plugin;
}

/**
 * A row can do only one thing when clicked, so combining two whole-row click
 * actions (for example a row link and `hasRowClickExpansion`) is a usage error:
 * it throws in development and logs in production, where each row keeps the
 * first action that claims it.
 */
export function assertSingleRowClickPlugin<T extends Record<string, unknown>>(
  plugins: TablePlugin<T>[],
): void {
  const owners = plugins.flatMap(plugin => {
    const owner = rowClickPluginOwners.get(plugin);
    return owner == null ? [] : [owner];
  });
  if (owners.length < 2) {
    return;
  }

  const message =
    `Table: rows have more than one click action (${owners.join(', ')}). ` +
    'Enable at most one whole-row click action per table.';
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(message);
  }
  console.error(message);
}

const ROW_CLICK_OWNER_ATTRIBUTE = 'data-row-click-owner';

// Production fallback for a configuration `assertSingleRowClickPlugin` has
// already reported: the first action attached to a row keeps it.
function claimRowClick(row: HTMLElement, owner: string): (() => void) | null {
  const existingOwner = row.getAttribute(ROW_CLICK_OWNER_ATTRIBUTE);
  if (existingOwner != null && existingOwner !== owner) {
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
 * level. Clicks that belong to nested controls, control cells, layered
 * surfaces, or a text selection are ignored. The event keeps propagating so
 * React handlers inside the row still run.
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
