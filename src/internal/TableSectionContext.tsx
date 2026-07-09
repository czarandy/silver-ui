'use client';

import {createContext, use} from 'react';
import type {ReactNode} from 'react';
import type {TableSection} from 'components/Table/types';

const TableSectionContext = createContext<TableSection>('body');
TableSectionContext.displayName = 'TableSectionContext';

/**
 * Section the nearest enclosing table row belongs to. Rows outside `<tbody>`
 * are not interactive, so they opt out of the hover and striping styling that
 * `TableContext` enables for body rows.
 */
export function useTableSection(): TableSection {
  return use(TableSectionContext);
}

/**
 * Marks its subtree as belonging to a table section. `TableHeader` and
 * `TableFooter` stay server components by delegating the context to this
 * client boundary.
 */
export function TableSectionProvider({
  children,
  section,
}: {
  children: ReactNode;
  section: TableSection;
}): React.JSX.Element {
  return <TableSectionContext value={section}>{children}</TableSectionContext>;
}

TableSectionProvider.displayName = 'TableSectionProvider';
