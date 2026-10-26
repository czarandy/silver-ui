import type {Ref, RefCallback} from 'react';
import type {TablePlugin} from 'components/Table/types';
import {isIndependentSurfaceEvent} from 'internal/forwardSurfaceEvent';
import {mergeRefs} from 'internal/mergeRefs';
import {css} from 'styled-system/css';

/**
 * Pointer affordance shared by every plugin that makes whole rows clickable.
 * Control cells keep the normal cursor. Hover fill stays with the table's
 * `hasHover` option.
 */
export const clickableRowClassName = css({
  cursor: 'pointer',
  '& > .silver-table-row-control-cell': {cursor: 'auto'},
});

/**
 * Pointer affordance for rows with a row link. A row shows the pointer only
 * while it contains the link (marked `data-table-row-link`), so a row whose link
 * column is hidden or empty looks as inert as it is.
 */
export const linkedRowClassName = css({
  '&:has([data-table-row-link])': {
    cursor: 'pointer',
    '& > .silver-table-row-control-cell': {cursor: 'auto'},
  },
});

/**
 * Marks a body cell whose clicks, including on the padding around its content,
 * belong to that content rather than to a whole-row click action. Plugins apply
 * it from `transformBodyCell` to their control columns (selection checkbox,
 * expansion chevron) and to consumer-ignored columns. It carries no styles of
 * its own.
 */
export const rowControlCellClassName = 'silver-table-row-control-cell';

function isRowControlCellEvent(event: MouseEvent, row: HTMLElement): boolean {
  const target = event.target instanceof Element ? event.target : null;
  const cell = target?.closest('td, th');
  return (
    cell != null &&
    row.contains(cell) &&
    cell.classList.contains(rowControlCellClassName)
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

const loggedConflicts = new Set<string>();

/**
 * A row can do only one thing when clicked, so combining two whole-row click
 * actions (for example a row link and `hasRowClickExpansion`) is a usage error:
 * it throws in development and logs once in production, where each row keeps
 * the first action that claims it.
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
  if (!loggedConflicts.has(message)) {
    loggedConflicts.add(message);
    console.error(message);
  }
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

type RowClickHandler = (event: MouseEvent, row: HTMLTableRowElement) => void;

export interface RowClickHandlers {
  /**
   * Called for a middle-button `auxclick` on the row surface.
   */
  onAuxClick?: RowClickHandler;
  /**
   * Called for a click on the row surface.
   */
  onClick: RowClickHandler;
}

/**
 * Creates the row ref through which a plugin makes a whole row clickable.
 * `TableRow` exposes only className/style/ref, so listeners attach at the DOM
 * level. Clicks that belong to nested controls, control cells, layered
 * surfaces, or a text selection are ignored.
 *
 * The action runs once the click reaches the window, after React's handlers
 * (including a React root on the document): a handler inside the row opts out
 * with `stopPropagation()` or `preventDefault()`, and the row never stops the
 * click itself.
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

    const runAfterBubbling = (
      event: MouseEvent,
      getHandler: () => RowClickHandler | undefined,
    ): void => {
      const view = row.ownerDocument.defaultView;
      if (
        view == null ||
        isIndependentSurfaceEvent(event, row) ||
        isRowControlCellEvent(event, row)
      ) {
        return;
      }
      // `once` also discards the listener on the next click when a handler
      // stopped this one before it reached the window.
      view.addEventListener(
        event.type,
        bubbled => {
          if (bubbled === event && !event.defaultPrevented) {
            getHandler()?.(event, row);
          }
        },
        {once: true},
      );
    };
    const handleClick = (event: MouseEvent): void => {
      runAfterBubbling(event, () => getHandlers().onClick);
    };
    const handleAuxClick = (event: MouseEvent): void => {
      if (event.button === 1) {
        runAfterBubbling(event, () => getHandlers().onAuxClick);
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
