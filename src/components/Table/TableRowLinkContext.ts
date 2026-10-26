'use client';

import {createContext, type RefCallback} from 'react';

/**
 * Connects a body `TableRow` to the one `TableRowLink` rendered inside it. The
 * row forwards clicks on its surface to the registered link, so the link stays
 * the row's real, keyboard-reachable navigation control.
 */
export interface TableRowLinkRegistry {
  /**
   * The row's link, or null when no enabled `TableRowLink` is mounted.
   */
  getLink: () => HTMLElement | null;
  /**
   * Registers a link element and returns its unregister cleanup.
   */
  register: (link: HTMLElement) => () => void;
  /**
   * Ref callback for the row element, which mirrors registration onto the
   * `data-has-row-link` attribute that drives clickable-row styling.
   */
  rowRef: RefCallback<HTMLTableRowElement>;
}

export const TableRowLinkContext = createContext<TableRowLinkRegistry | null>(
  null,
);
TableRowLinkContext.displayName = 'TableRowLinkContext';

const MULTIPLE_LINKS_MESSAGE =
  'TableRow: render at most one TableRowLink per row. A clickable row ' +
  'forwards to a single link, so additional TableRowLinks are ignored.';

/**
 * Creates the per-row registry. Registration is tracked outside React state so
 * marking a row clickable never re-renders it; the row attribute is toggled
 * directly instead.
 */
export function createTableRowLinkRegistry(): TableRowLinkRegistry {
  const links = new Set<HTMLElement>();
  let row: HTMLTableRowElement | null = null;

  const syncRowAttribute = (): void => {
    row?.toggleAttribute('data-has-row-link', links.size > 0);
  };

  return {
    getLink: () => links.values().next().value ?? null,
    register: link => {
      if (links.size > 0 && !links.has(link)) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(MULTIPLE_LINKS_MESSAGE);
        }
        console.error(MULTIPLE_LINKS_MESSAGE);
      }
      links.add(link);
      syncRowAttribute();
      return () => {
        links.delete(link);
        syncRowAttribute();
      };
    },
    rowRef: element => {
      row = element;
      syncRowAttribute();
      return () => {
        row = null;
      };
    },
  };
}
