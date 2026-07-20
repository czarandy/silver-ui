import {Temporal} from '@js-temporal/polyfill';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useMemo, useState} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {SearchFilterInputConfig} from 'components/SearchFilterInput';
import {Table} from 'components/Table/Table';
import {TableBody} from 'components/Table/TableBody';
import {TableCell} from 'components/Table/TableCell';
import {TableFooter} from 'components/Table/TableFooter';
import {TableHeader} from 'components/Table/TableHeader';
import {TableHeaderCell} from 'components/Table/TableHeaderCell';
import {TableRow} from 'components/Table/TableRow';
import {
  defaultCellRenderer,
  generateColumns,
  pixel,
  proportional,
  resolveColumnWidths,
} from 'components/Table/columnUtils';
import {useTableColumnResize} from 'components/Table/plugins/columnResize';
import {
  useTableColumnSettings,
  useTableColumnSettingsState,
} from 'components/Table/plugins/columnSettings';
import {
  toSearchFilters,
  useTableFiltering,
  useTableFilterState,
} from 'components/Table/plugins/filtering';
import {
  paginateData,
  useTablePagination,
} from 'components/Table/plugins/pagination';
import {
  useTableSelection,
  useTableSelectionState,
} from 'components/Table/plugins/selection';
import {
  useTableSortable,
  useTableSortableState,
} from 'components/Table/plugins/sortable';
import type {TableColumn, TablePlugin} from 'components/Table/types';
import {useBaseTablePlugins} from 'components/Table/useBaseTablePlugins';

interface PersonRow extends Record<string, unknown> {
  age: number;
  id: string;
  name: string;
  role: string;
}

const data: PersonRow[] = [
  {age: 30, id: '1', name: 'Alice', role: 'Admin'},
  {age: 24, id: '2', name: 'Bob', role: 'User'},
];

const columns: TableColumn<PersonRow>[] = [
  {key: 'name', header: 'Name', sortable: true, width: pixel(160)},
  {key: 'age', align: 'end', header: 'Age', sortable: true},
  {key: 'role', header: 'Role'},
];

const hoverBgClass = 'hover:[@media_(hover:_hover)]:silver-bg_bg.hover';
const hoverSubtleBgClass = 'hover:[@media_(hover:_hover)]:silver-bg_bg.subtle';
const lastBodyRowDividerResetClass =
  '[tbody_>_tr:last-child_>_&]:silver-bd-b-w_0';
const maxWidthZeroClass = 'silver-max-w_0';
const overflowHiddenClass = 'silver-ov_hidden';
const overflowWrapAnywhereClass = 'silver-ov-wrap_anywhere';
const overflowWrapBreakWordClass = 'silver-ov-wrap_break-word';
const rowDividerWidthClass = 'silver-bd-b-w_default';
const sortIconActiveColorClass = 'silver-c_primary';
const sortIconInactiveOpacityClass = 'silver-op_0.35';
const emptyStatePaddingClass = 'silver-py_8';
const stripedBgClass = 'even:silver-bg_bg.subtle';
const textOverflowEllipsisClass = 'silver-tov_ellipsis';
const whiteSpaceNormalClass = 'silver-white-space_normal';
const whiteSpaceNowrapClass = 'silver-white-space_nowrap';
const wordBreakBreakWordClass = 'silver-wb_break-word';

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('Table', () => {
  it('renders data-driven columns, cells, and empty state', () => {
    const {rerender} = render(
      <Table columns={columns} data={data} idKey="id" />,
    );

    const nameHeader = screen.getByRole('columnheader', {name: 'Name'});
    expect(nameHeader).toBeInTheDocument();
    expect(nameHeader).toHaveAttribute('data-column-key', 'name');
    expect(nameHeader).toHaveAttribute('title', 'Name');
    expect(screen.getByText('Name')).toHaveClass('silver-fs_md');
    expect(screen.getByRole('cell', {name: 'Alice'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '24'})).toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    const emptyStateCell = screen.getByRole('cell');
    expect(emptyStateCell).toHaveAttribute('data-part', 'empty-state');
    expect(emptyStateCell).toHaveClass(emptyStatePaddingClass);
  });

  it('does not render the empty state when data is undefined', () => {
    render(<Table columns={columns} />);

    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('renders a custom empty state and suppresses it with null', () => {
    const {rerender} = render(
      <Table
        columns={columns}
        data={[]}
        emptyState={<span>Nothing here</span>}
      />,
    );

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} emptyState={null} />);

    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
    expect(screen.queryByText('No data')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('cell')).toHaveLength(0);
  });

  it('uses a function idKey for row identity', () => {
    const idKey = vi.fn((item: PersonRow) => `row-${item.id}`);
    render(<Table columns={columns} data={data} idKey={idKey} />);

    expect(idKey).toHaveBeenCalledWith(data[0]);
    expect(idKey).toHaveBeenCalledWith(data[1]);
    expect(screen.getByRole('cell', {name: 'Alice'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'Bob'})).toBeInTheDocument();
  });

  it('applies visual context props through row and cell classes', () => {
    const {rerender} = render(
      <Table
        columns={columns}
        data={data}
        density="compact"
        dividers="grid"
        hasHover
        isStriped
        textOverflow="truncate"
        verticalAlign="top"
      />,
    );

    const getParts = () => {
      const row = screen.getAllByRole('row')[1];
      const header = screen.getByRole('columnheader', {name: 'Name'});
      const cell = screen.getByRole('cell', {name: 'Alice'});
      return {
        cellClassName: cell.className,
        headerClassName: header.className,
        rowClassName: row.className,
      };
    };

    const compactGridClasses = getParts();

    rerender(
      <Table
        columns={columns}
        data={data}
        density="spacious"
        dividers="none"
        textOverflow="wrap"
        verticalAlign="bottom"
      />,
    );

    const spaciousNoDividerClasses = getParts();

    expect(compactGridClasses.cellClassName).not.toEqual(
      spaciousNoDividerClasses.cellClassName,
    );
    expect(compactGridClasses.headerClassName).not.toEqual(
      spaciousNoDividerClasses.headerClassName,
    );
    expect(compactGridClasses.rowClassName).not.toEqual(
      spaciousNoDividerClasses.rowClassName,
    );
  });

  it('keeps hover and stripe styling off the header row', () => {
    render(<Table columns={columns} data={data} hasHover isStriped />);

    const [headerRow, firstBodyRow] = screen.getAllByRole('row');

    expect(headerRow).not.toHaveClass(hoverBgClass);
    expect(headerRow).not.toHaveClass(stripedBgClass);
    expect(firstBodyRow).toHaveClass(hoverBgClass);
    expect(firstBodyRow).toHaveClass(stripedBgClass);
  });

  it('keeps the unstriped hover highlight off the header row', () => {
    render(<Table columns={columns} data={data} hasHover />);

    const [headerRow, firstBodyRow] = screen.getAllByRole('row');

    expect(headerRow).not.toHaveClass(hoverSubtleBgClass);
    expect(firstBodyRow).toHaveClass(hoverSubtleBgClass);
  });

  it('applies XDSTable-compatible cell overflow classes', () => {
    const {rerender} = render(
      <Table columns={columns} data={data} textOverflow="truncate" />,
    );

    const header = screen.getByRole('columnheader', {name: 'Name'});
    const truncatedCell = screen.getByRole('cell', {name: 'Alice'});

    expect(header).toHaveClass(maxWidthZeroClass);
    expect(header).toHaveClass(overflowHiddenClass);
    expect(header).toHaveClass(textOverflowEllipsisClass);
    expect(header).toHaveClass(whiteSpaceNowrapClass);
    expect(truncatedCell).toHaveClass(maxWidthZeroClass);
    expect(truncatedCell).toHaveClass(overflowHiddenClass);
    expect(truncatedCell).toHaveClass(textOverflowEllipsisClass);
    expect(truncatedCell).toHaveClass(whiteSpaceNowrapClass);

    rerender(<Table columns={columns} data={data} textOverflow="wrap" />);

    const wrappedCell = screen.getByRole('cell', {name: 'Alice'});
    expect(wrappedCell).toHaveClass(maxWidthZeroClass);
    expect(wrappedCell).toHaveClass(overflowHiddenClass);
    expect(wrappedCell).toHaveClass(overflowWrapBreakWordClass);
    expect(wrappedCell).toHaveClass(whiteSpaceNormalClass);
    expect(wrappedCell).toHaveClass(wordBreakBreakWordClass);
    expect(wrappedCell).not.toHaveClass(overflowWrapAnywhereClass);
  });

  it('suppresses row dividers on final body row cells for row and grid dividers', () => {
    const {rerender} = render(<Table columns={columns} data={data} />);

    const expectRowDividerReset = () => {
      const [headerRow, firstBodyRow, lastBodyRow] = screen.getAllByRole('row');
      const firstBodyCells = within(firstBodyRow).getAllByRole('cell');
      const lastBodyCells = within(lastBodyRow).getAllByRole('cell');

      expect(
        within(headerRow).getByRole('columnheader', {name: 'Name'}),
      ).toHaveClass(rowDividerWidthClass);
      for (const cell of firstBodyCells) {
        expect(cell).toHaveClass(rowDividerWidthClass);
        expect(cell).toHaveClass(lastBodyRowDividerResetClass);
        expect(cell.matches('tbody > tr:last-child > td')).toBe(false);
      }
      for (const cell of lastBodyCells) {
        expect(cell).toHaveClass(rowDividerWidthClass);
        expect(cell).toHaveClass(lastBodyRowDividerResetClass);
        expect(cell.matches('tbody > tr:last-child > td')).toBe(true);
      }
    };

    expectRowDividerReset();

    rerender(<Table columns={columns} data={data} dividers="grid" />);

    expectRowDividerReset();
  });

  it('does not add final body row divider reset for column or no dividers', () => {
    const {rerender} = render(
      <Table columns={columns} data={data} dividers="columns" />,
    );

    for (const cell of screen.getAllByRole('cell')) {
      expect(cell).not.toHaveClass(rowDividerWidthClass);
      expect(cell).not.toHaveClass(lastBodyRowDividerResetClass);
    }

    rerender(<Table columns={columns} data={data} dividers="none" />);

    for (const cell of screen.getAllByRole('cell')) {
      expect(cell).not.toHaveClass(rowDividerWidthClass);
      expect(cell).not.toHaveClass(lastBodyRowDividerResetClass);
    }
  });

  it('supports children mode primitives', () => {
    render(
      <Table>
        <thead>
          <tr>
            <th>Manual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </Table>,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Manual'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'Content'})).toBeInTheDocument();
  });
});

describe('TableFooter', () => {
  it('forwards props to the tfoot element and renders children', () => {
    let footerRef: HTMLTableSectionElement | null = null;
    render(
      <table>
        <TableFooter
          className="custom-footer"
          data-testid="footer"
          ref={element => {
            footerRef = element;
          }}
          style={{color: 'rgb(255, 0, 0)'}}>
          <tr>
            <td>Total</td>
          </tr>
        </TableFooter>
      </table>,
    );

    const footer = screen.getByTestId('footer');
    expect(footer.tagName).toBe('TFOOT');
    expect(footer).toBe(footerRef);
    expect(footer).toHaveClass('custom-footer');
    expect(footer).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(screen.getByRole('cell', {name: 'Total'})).toBeInTheDocument();
  });
});

describe('TableRow', () => {
  it('applies hover and stripe styling only to rows inside the body', () => {
    render(
      <Table hasHover isStriped>
        <TableHeader>
          <TableRow data-testid="header-row">
            <TableHeaderCell>Name</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-testid="body-row">
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow data-testid="footer-row">
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    const bodyRow = screen.getByTestId('body-row');

    for (const testId of ['header-row', 'footer-row']) {
      const row = screen.getByTestId(testId);
      expect(row).not.toHaveClass(hoverBgClass);
      expect(row).not.toHaveClass(stripedBgClass);
    }

    expect(bodyRow).toHaveClass(hoverBgClass);
    expect(bodyRow).toHaveClass(stripedBgClass);
  });
});

describe('Table plugins', () => {
  it('orders named first-party plugin records canonically', () => {
    const columnSettingsPlugin: TablePlugin<PersonRow> = {};
    const sortPlugin: TablePlugin<PersonRow> = {};
    const selectionPlugin: TablePlugin<PersonRow> = {};
    const filteringPlugin: TablePlugin<PersonRow> = {};
    const columnResizePlugin: TablePlugin<PersonRow> = {};
    const paginationPlugin: TablePlugin<PersonRow> = {};

    const {result} = renderHook(() =>
      useBaseTablePlugins<PersonRow>({
        pagination: paginationPlugin,
        selection: selectionPlugin,
        columnResize: columnResizePlugin,
        sort: sortPlugin,
        filtering: filteringPlugin,
        columnSettings: columnSettingsPlugin,
      }),
    );

    expect(result.current).toEqual([
      columnSettingsPlugin,
      sortPlugin,
      selectionPlugin,
      filteringPlugin,
      columnResizePlugin,
      paginationPlugin,
    ]);
  });

  it('preserves custom named plugin order after known plugins', () => {
    const selectionPlugin: TablePlugin<PersonRow> = {};
    const customBeforePlugin: TablePlugin<PersonRow> = {};
    const customAfterPlugin: TablePlugin<PersonRow> = {};

    const {result} = renderHook(() =>
      useBaseTablePlugins<PersonRow>({
        customBefore: customBeforePlugin,
        selection: selectionPlugin,
        customAfter: customAfterPlugin,
      }),
    );

    expect(result.current).toEqual([
      selectionPlugin,
      customBeforePlugin,
      customAfterPlugin,
    ]);
  });

  it('preserves plugin array order exactly', () => {
    const paginationPlugin: TablePlugin<PersonRow> = {};
    const selectionPlugin: TablePlugin<PersonRow> = {};
    const columnSettingsPlugin: TablePlugin<PersonRow> = {};

    const {result} = renderHook(() =>
      useBaseTablePlugins<PersonRow>([
        paginationPlugin,
        selectionPlugin,
        columnSettingsPlugin,
      ]),
    );

    expect(result.current).toEqual([
      paginationPlugin,
      selectionPlugin,
      columnSettingsPlugin,
    ]);
  });

  it('sorts local data and renders sortable headers', async () => {
    const user = userEvent.setup();

    function SortableTable() {
      const sortable = useTableSortableState<PersonRow, string>({
        data,
        comparators: {age: (a, b) => a.age - b.age},
      });
      const sortPlugin = useTableSortable<PersonRow>(sortable.sortConfig);
      return (
        <Table
          columns={columns}
          data={sortable.sortedData}
          plugins={{sortPlugin}}
        />
      );
    }

    render(<SortableTable />);
    await user.click(screen.getByRole('button', {name: 'Sort by Age'}));

    const rows = screen.getAllByRole('row');
    expect(
      within(rows[1]).getByRole('cell', {name: 'Bob'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /Age, sorted ascending/}),
    ).toBeInTheDocument();
    const ageHeader = screen.getByRole('columnheader', {name: /Age/});
    expect(ageHeader).toHaveAttribute('aria-sort', 'ascending');

    await user.click(
      screen.getByRole('button', {name: /Age, sorted ascending/}),
    );
    expect(ageHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('sorts NaN values after valid numbers without disrupting their order', () => {
    const sortData = [
      {id: '1', name: 'Alice', score: 10},
      {id: '2', name: 'Bob', score: Number.NaN},
      {id: '3', name: 'Carol', score: 5},
      {id: '4', name: 'Dave', score: 20},
    ];

    const {result} = renderHook(() =>
      useTableSortableState({
        data: sortData,
        sort: [{direction: 'ascending', sortKey: 'score'}],
      }),
    );

    expect(result.current.sortedData.map(row => row.name)).toEqual([
      'Carol',
      'Alice',
      'Dave',
      'Bob',
    ]);
  });

  it('applies multi-sort tiebreakers to rows with NaN values', () => {
    const sortData = [
      {id: '1', name: 'Charlie', score: Number.NaN},
      {id: '2', name: 'Alice', score: Number.NaN},
      {id: '3', name: 'Bob', score: 5},
    ];

    const {result} = renderHook(() =>
      useTableSortableState({
        data: sortData,
        sort: [
          {direction: 'ascending', sortKey: 'score'},
          {direction: 'ascending', sortKey: 'name'},
        ],
      }),
    );

    expect(result.current.sortedData.map(row => row.name)).toEqual([
      'Bob',
      'Alice',
      'Charlie',
    ]);
  });

  it('dims inactive sort icons and marks active sort icons distinctly', () => {
    function SortableTable() {
      const sortPlugin = useTableSortable<PersonRow>({
        sort: [{direction: 'ascending', sortKey: 'name'}],
        onSortChange: () => {},
      });
      return <Table columns={columns} data={data} plugins={{sortPlugin}} />;
    }

    render(<SortableTable />);

    const activeButton = screen.getByRole('button', {
      name: /Name, sorted ascending/,
    });
    const inactiveButton = screen.getByRole('button', {name: 'Sort by Age'});
    const activeIcon = within(activeButton).getByTestId('table-sort-icon-name');
    const inactiveIcon = within(inactiveButton).getByTestId(
      'table-sort-icon-age',
    );

    expect(activeIcon).toHaveAttribute('data-table-sort-icon-state', 'active');
    expect(activeIcon).toHaveClass(sortIconActiveColorClass);
    expect(activeIcon).not.toHaveClass(sortIconInactiveOpacityClass);
    expect(inactiveIcon).toHaveAttribute(
      'data-table-sort-icon-state',
      'inactive',
    );
    expect(inactiveIcon).toHaveClass(sortIconInactiveOpacityClass);
  });

  it('supports multi-sort, unsorted state, and custom comparators', async () => {
    const user = userEvent.setup();
    const sortData: PersonRow[] = [
      {age: 30, id: '1', name: 'Charlie', role: 'User'},
      {age: 40, id: '2', name: 'Alice', role: 'Admin'},
      {age: 20, id: '3', name: 'Bob', role: 'User'},
    ];
    const roleOrder = new Map([
      ['Admin', 0],
      ['User', 1],
    ]);
    const sortableColumns: TableColumn<PersonRow>[] = columns.map(column =>
      column.key === 'role' ? {...column, sortable: true} : column,
    );

    function SortableTable() {
      const sortable = useTableSortableState<PersonRow, string>({
        data: sortData,
        comparators: {
          role: (a, b) =>
            (roleOrder.get(a.role) ?? 99) - (roleOrder.get(b.role) ?? 99),
        },
        isMultiSortEnabled: true,
      });
      const sortPlugin = useTableSortable<PersonRow>(sortable.sortConfig);
      return (
        <Table
          columns={sortableColumns}
          data={sortable.sortedData}
          plugins={{sortPlugin}}
        />
      );
    }

    render(<SortableTable />);
    await user.click(screen.getByRole('button', {name: 'Sort by Role'}));
    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('button', {name: 'Sort by Age'}));
    await user.keyboard('{/Shift}');

    const rows = screen.getAllByRole('row');
    expect(
      within(rows[1]).getByRole('cell', {name: 'Alice'}),
    ).toBeInTheDocument();
    expect(
      within(rows[2]).getByRole('cell', {name: 'Bob'}),
    ).toBeInTheDocument();
    expect(
      within(rows[3]).getByRole('cell', {name: 'Charlie'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /Age, sorted ascending, priority 2 of 2/,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {name: /Age, sorted ascending/}),
    );
    await user.click(
      screen.getByRole('button', {name: /Age, sorted descending/}),
    );
    expect(
      screen.getByRole('button', {name: 'Sort by Age'}),
    ).toBeInTheDocument();
  });

  it('adds selection checkboxes and updates selection state', async () => {
    const user = userEvent.setup();

    function SelectableTable() {
      const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
      const selection = useTableSelectionState({
        data,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      return (
        <>
          <output aria-label="Selected count">{selectedKeys.size}</output>
          <Table
            columns={columns}
            data={data}
            idKey="id"
            plugins={{selectionPlugin}}
          />
        </>
      );
    }

    render(<SelectableTable />);
    await user.click(screen.getAllByLabelText('Select row')[0]);
    expect(screen.getByLabelText('Selected count')).toHaveTextContent('1');

    await user.click(screen.getByLabelText('Select all rows'));
    expect(screen.getByLabelText('Selected count')).toHaveTextContent('2');
  });

  it('applies selected row styling with a token-safe class', () => {
    function SelectableTable() {
      const [selectedKeys, setSelectedKeys] = useState(
        () => new Set<string>(['1']),
      );
      const selection = useTableSelectionState({
        data,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      const rowPlugin: TablePlugin<PersonRow> = {
        transformBodyRow(props) {
          return {
            ...props,
            className: [props.className, 'custom-row']
              .filter(Boolean)
              .join(' '),
            htmlProps: {
              ...props.htmlProps,
              className: 'html-row',
              style: {
                ...props.htmlProps.style,
                color: 'rgb(255, 0, 0)',
              },
            },
          };
        },
      };
      return (
        <Table
          columns={columns}
          data={data}
          idKey="id"
          plugins={[rowPlugin, selectionPlugin]}
        />
      );
    }

    render(<SelectableTable />);

    const rows = screen.getAllByRole('row');
    const selectedRow = rows.find(
      row => within(row).queryByRole('cell', {name: 'Alice'}) != null,
    );
    const unselectedRow = rows.find(
      row => within(row).queryByRole('cell', {name: 'Bob'}) != null,
    );

    if (selectedRow == null || unselectedRow == null) {
      throw new Error('Expected selectable table rows to render');
    }

    expect(selectedRow).toHaveClass('custom-row');
    expect(selectedRow).toHaveClass('html-row');
    expect(unselectedRow).toHaveClass('custom-row');
    expect(unselectedRow).toHaveClass('html-row');
    expect(selectedRow.getAttribute('class')).not.toBe(
      unselectedRow.getAttribute('class'),
    );
    expect(selectedRow.getAttribute('style') ?? '').not.toContain(
      'token(colors.bg.selected)',
    );
    expect(selectedRow).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('updates selection without re-rendering row content', async () => {
    const user = userEvent.setup();
    const renderName = vi.fn((row: PersonRow) => row.name);
    const trackedColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', renderCell: renderName},
      {key: 'role', header: 'Role'},
    ];

    function SelectableTable() {
      const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
      const selection = useTableSelectionState({
        data,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      const plugins = useMemo(
        () => ({selection: selectionPlugin}),
        [selectionPlugin],
      );

      return (
        <Table
          columns={trackedColumns}
          data={data}
          idKey="id"
          plugins={plugins}
        />
      );
    }

    render(<SelectableTable />);
    expect(renderName).toHaveBeenCalledTimes(2);

    await user.click(screen.getAllByLabelText('Select row')[0]);

    expect(renderName).toHaveBeenCalledTimes(2);
    expect(screen.getAllByLabelText('Select row')[0]).toBeChecked();
    const selectedRow = screen
      .getAllByRole('row')
      .find(row => within(row).queryByRole('cell', {name: 'Alice'}) != null);
    expect(selectedRow).toHaveAttribute('aria-selected', 'true');
  });

  it('renders pagination around the table', () => {
    function PaginatedTable() {
      const paginationPlugin = useTablePagination<PersonRow>({
        onPageChange: () => {},
        page: 1,
        pageSize: 1,
        totalItems: data.length,
      });
      return (
        <Table
          columns={columns}
          data={data.slice(0, 1)}
          plugins={{paginationPlugin}}
        />
      );
    }

    render(<PaginatedTable />);
    expect(
      screen.getByRole('navigation', {name: 'Table pagination'}),
    ).toBeInTheDocument();
  });

  it('filters and reorders columns with column settings', () => {
    function SettingsTable() {
      const settingsPlugin = useTableColumnSettings<PersonRow>({
        activeColumnKeys: ['role', 'name'],
        columns: [
          {key: 'name', label: 'Name'},
          {key: 'age', label: 'Age'},
          {key: 'role', label: 'Role'},
        ],
        onChangeActiveColumnKeys: () => {},
      });
      return <Table columns={columns} data={data} plugins={{settingsPlugin}} />;
    }

    render(<SettingsTable />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map(header => header.textContent)).toEqual(['Role', 'Name']);
    expect(
      screen.queryByRole('columnheader', {name: 'Age'}),
    ).not.toBeInTheDocument();
  });

  it('does not re-render row content when transformed columns are shallow-equal', () => {
    const renderName = vi.fn((row: PersonRow) => row.name);
    const trackingColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', renderCell: renderName},
      {key: 'age', header: 'Age'},
    ];
    const shallowCloneColumnsPlugin: TablePlugin<PersonRow> = {
      transformColumns: currentColumns => [...currentColumns],
    };
    const stablePlugins = [shallowCloneColumnsPlugin];

    function ParentRerenderTable() {
      const [count, setCount] = useState(0);
      return (
        <>
          <button onClick={() => setCount(value => value + 1)} type="button">
            Rerender {count}
          </button>
          <Table
            columns={trackingColumns}
            data={data}
            idKey="id"
            plugins={stablePlugins}
          />
        </>
      );
    }

    render(<ParentRerenderTable />);
    expect(renderName).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', {name: 'Rerender 0'}));

    expect(
      screen.getByRole('button', {name: 'Rerender 1'}),
    ).toBeInTheDocument();
    expect(renderName).toHaveBeenCalledTimes(2);
  });

  it('applies column settings before selection for named plugin records', async () => {
    const user = userEvent.setup();

    function SettingsSelectionTable() {
      const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
      const selection = useTableSelectionState({
        data,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      const columnSettingsPlugin = useTableColumnSettings<PersonRow>({
        activeColumnKeys: ['role', 'name'],
        columns: [
          {key: 'name', label: 'Name'},
          {key: 'age', label: 'Age'},
          {key: 'role', label: 'Role'},
        ],
        onChangeActiveColumnKeys: () => {},
      });
      return (
        <>
          <output aria-label="Selected count">{selectedKeys.size}</output>
          <Table
            columns={columns}
            data={data}
            idKey="id"
            plugins={{
              selection: selectionPlugin,
              columnSettings: columnSettingsPlugin,
            }}
          />
        </>
      );
    }

    render(<SettingsSelectionTable />);

    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Select row')).toHaveLength(2);
    expect(
      screen.queryByRole('columnheader', {name: 'Age'}),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Role'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: 'Name'}),
    ).toBeInTheDocument();

    await user.click(screen.getAllByLabelText('Select row')[0]);
    expect(screen.getByLabelText('Selected count')).toHaveTextContent('1');
  });

  it('applies filtering and column resize after canonical column transforms', () => {
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
      ],
      name: 'people',
    };
    const orderedColumns: TableColumn<PersonRow>[] = [
      {...columns[0], filter: 'name'},
      {key: 'age', header: 'Age', width: pixel(160)},
      {key: 'role', header: 'Role', width: pixel(160)},
    ];
    const orderedColumnSettings = [
      {key: 'name', label: 'Name'},
      {key: 'age', label: 'Age'},
      {key: 'role', label: 'Role'},
    ];

    function CanonicalPluginTable() {
      const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
      const selection = useTableSelectionState({
        data,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      const columnSettings = useTableColumnSettings<PersonRow>({
        activeColumnKeys: ['role', 'name'],
        columns: orderedColumnSettings,
        onChangeActiveColumnKeys: () => {},
      });
      const filtering = useTableFiltering<PersonRow>({
        filters: {},
        onFilterChange: () => {},
        searchConfig,
        variant: 'inline',
      });
      const columnResize = useTableColumnResize<PersonRow>({
        columnWidths: {name: 160, role: 160},
        columns: orderedColumns as TableColumn<Record<string, unknown>>[],
      });
      return (
        <Table
          columns={orderedColumns}
          data={data}
          idKey="id"
          plugins={{
            columnResize,
            filtering,
            selection: selectionPlugin,
            columnSettings,
          }}
        />
      );
    }

    render(<CanonicalPluginTable />);

    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(
      screen.queryByRole('columnheader', {name: 'Age'}),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Filter Name')).toBeInTheDocument();
    expect(
      screen.getByRole('separator', {name: 'Resize column Role'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('separator', {name: 'Resize column Name'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('separator', {name: 'Resize column Age'}),
    ).not.toBeInTheDocument();
  });

  it('renders resize handles and commits keyboard resize changes', async () => {
    const user = userEvent.setup();
    const onColumnResizeEnd = vi.fn();

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {name: 160},
        columns: columns as TableColumn<Record<string, unknown>>[],
        maxWidth: 220,
        minWidth: 120,
        onColumnResizeEnd,
      });
      return <Table columns={columns} data={data} plugins={{resizePlugin}} />;
    }

    render(<ResizableTable />);
    const handle = screen.getByRole('separator', {name: 'Resize column Name'});
    handle.focus();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await user.keyboard('{Home}');
    await user.keyboard('{End}');

    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 120, name: 170});
    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 120, name: 210});
    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 120, name: 120});
    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 120, name: 220});
  });

  it('adds ARIA separator attributes to resize handles', () => {
    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {name: 160},
        columns: columns as TableColumn<Record<string, unknown>>[],
        maxWidth: 220,
        minWidth: 120,
      });
      return <Table columns={columns} data={data} plugins={{resizePlugin}} />;
    }

    render(<ResizableTable />);

    const handle = screen.getByRole('separator', {name: 'Resize column Name'});
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('aria-valuenow', '160');
    expect(handle).toHaveAttribute('aria-valuemin', '120');
    expect(handle).toHaveAttribute('aria-valuemax', '220');
  });

  it('uses RTL-aware ArrowLeft and ArrowRight resize behavior', () => {
    const onColumnResizeEnd = vi.fn();
    const rtlColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: pixel(100)},
      {key: 'age', header: 'Age', width: pixel(100)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {age: 200, name: 200},
        columns: rtlColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table
          columns={rtlColumns}
          data={data}
          plugins={{resizePlugin}}
          tableProps={{style: {direction: 'rtl'}}}
        />
      );
    }

    render(<ResizableTable />);
    fireEvent.keyDown(
      screen.getByRole('separator', {name: 'Resize column Name'}),
      {key: 'ArrowRight'},
    );

    expect(onColumnResizeEnd).toHaveBeenCalledWith({name: 190});
  });

  it('resizes the neighbor for proportional columns and commits multiple widths', () => {
    const onColumnResizeEnd = vi.fn();
    const proportionalColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: proportional(1)},
      {key: 'age', header: 'Age', width: proportional(1)},
      {key: 'role', header: 'Role', width: proportional(1)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {age: 200, name: 200, role: 200},
        columns: proportionalColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table
          columns={proportionalColumns}
          data={data}
          plugins={{resizePlugin}}
        />
      );
    }

    render(<ResizableTable />);
    fireEvent.keyDown(
      screen.getByRole('separator', {name: 'Resize column Name'}),
      {key: 'ArrowRight'},
    );

    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 190, name: 210});
  });

  it('skips the last resizable proportional column resize handle', () => {
    const proportionalColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: proportional(1)},
      {key: 'age', header: 'Age', width: proportional(1)},
      {key: 'role', header: 'Role', width: proportional(1)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columns: proportionalColumns as TableColumn<Record<string, unknown>>[],
      });
      return (
        <Table
          columns={proportionalColumns}
          data={data}
          plugins={{resizePlugin}}
        />
      );
    }

    render(<ResizableTable />);

    expect(screen.getAllByRole('separator')).toHaveLength(2);
    expect(
      screen.queryByRole('separator', {name: 'Resize column Role'}),
    ).not.toBeInTheDocument();
  });

  it('commits resize changes for a last pixel column handle', () => {
    const onColumnResizeEnd = vi.fn();
    const pixelLastColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: proportional(1)},
      {key: 'age', header: 'Age', width: proportional(1)},
      {key: 'role', header: 'Role', width: pixel(160)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {role: 160},
        columns: pixelLastColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table
          columns={pixelLastColumns}
          data={data}
          plugins={{resizePlugin}}
        />
      );
    }

    render(<ResizableTable />);
    fireEvent.keyDown(
      screen.getByRole('separator', {name: 'Resize column Role'}),
      {key: 'ArrowRight'},
    );

    expect(onColumnResizeEnd).toHaveBeenCalledWith({role: 170});
  });

  it('shrinks a last pixel column handle down to its minimum width', () => {
    const onColumnResizeEnd = vi.fn();
    const pixelLastColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: proportional(1)},
      {key: 'age', header: 'Age', width: proportional(1)},
      {key: 'role', header: 'Role', width: pixel(160)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {role: 160},
        columns: pixelLastColumns as TableColumn<Record<string, unknown>>[],
        minWidth: 120,
        onColumnResizeEnd,
      });
      return (
        <Table
          columns={pixelLastColumns}
          data={data}
          plugins={{resizePlugin}}
        />
      );
    }

    render(<ResizableTable />);
    const handle = screen.getByRole('separator', {name: 'Resize column Role'});

    fireEvent.pointerDown(handle, {clientX: 160});
    fireEvent.pointerMove(window, {clientX: 110});
    fireEvent.pointerUp(window, {clientX: 110});

    expect(onColumnResizeEnd).toHaveBeenCalledWith({role: 120});
  });

  it('cleans up pointer cancel without committing a resize', () => {
    const onColumnResizeEnd = vi.fn();
    const pointerColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: pixel(100)},
      {key: 'age', header: 'Age', width: pixel(100)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {age: 200, name: 200},
        columns: pointerColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table columns={pointerColumns} data={data} plugins={{resizePlugin}} />
      );
    }

    render(<ResizableTable />);
    const handle = screen.getByRole('separator', {name: 'Resize column Name'});
    const nameHeader = screen.getByRole('columnheader', {name: /Name/});

    fireEvent.pointerDown(handle, {clientX: 100});
    fireEvent.pointerMove(window, {clientX: 150});
    expect(nameHeader).toHaveStyle({width: '250px'});

    fireEvent.pointerCancel(window);

    expect(onColumnResizeEnd).not.toHaveBeenCalled();
    expect(nameHeader).toHaveStyle({width: '200px'});
  });

  it('cleans up an active column resize when the table unmounts', () => {
    const onColumnResizeEnd = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const pointerColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: pixel(100)},
      {key: 'age', header: 'Age', width: pixel(100)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {age: 200, name: 200},
        columns: pointerColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table columns={pointerColumns} data={data} plugins={{resizePlugin}} />
      );
    }

    const {unmount} = render(<ResizableTable />);
    const handle = screen.getByRole('separator', {name: 'Resize column Name'});
    fireEvent.pointerDown(handle, {clientX: 100});

    const pointerListeners = (
      ['pointermove', 'pointerup', 'pointercancel'] as const
    ).map(eventType => ({
      eventType,
      listener: [...addEventListenerSpy.mock.calls]
        .reverse()
        .find(([type]) => type === eventType)?.[1],
    }));

    unmount();

    for (const {eventType, listener} of pointerListeners) {
      expect(listener).toBeTypeOf('function');
      expect(removeEventListenerSpy).toHaveBeenCalledWith(eventType, listener);
    }

    fireEvent.pointerUp(window, {clientX: 150});
    expect(onColumnResizeEnd).not.toHaveBeenCalled();
  });

  it('commits all affected proportional column widths after pointer drag', () => {
    const onColumnResizeEnd = vi.fn();
    const proportionalColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', width: proportional(1)},
      {key: 'age', header: 'Age', width: proportional(1)},
      {key: 'role', header: 'Role', width: proportional(1)},
    ];

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {age: 200, name: 200, role: 200},
        columns: proportionalColumns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return (
        <Table
          columns={proportionalColumns}
          data={data}
          plugins={{resizePlugin}}
        />
      );
    }

    render(<ResizableTable />);
    const handle = screen.getByRole('separator', {name: 'Resize column Name'});

    fireEvent.pointerDown(handle, {clientX: 100});
    fireEvent.pointerMove(window, {clientX: 150});
    fireEvent.pointerUp(window, {clientX: 150});

    expect(onColumnResizeEnd).toHaveBeenCalledWith({age: 150, name: 250});
  });

  it('renders inline filters and converts table filters to SearchFilterInput filters', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
      ],
      name: 'people',
    };
    const filterColumns: TableColumn<PersonRow>[] = [
      {...columns[0], filter: 'name'},
      columns[1],
    ];

    function FilteredTable() {
      const [filters, setFilters] = useState<
        Record<string, string | undefined>
      >({});
      const filteringPlugin = useTableFiltering<PersonRow>({
        filters,
        onFilterChange: (columnKey, value) => {
          setFilters(previous => ({
            ...previous,
            [columnKey]: typeof value === 'string' ? value : undefined,
          }));
          onFilterChange(columnKey, value);
        },
        searchConfig,
        variant: 'inline',
      });
      return (
        <Table
          columns={filterColumns}
          data={data}
          plugins={{filteringPlugin}}
        />
      );
    }

    render(<FilteredTable />);
    expect(screen.getByRole('columnheader', {name: /Name/})).not.toHaveStyle({
      display: 'flex',
    });
    expect(screen.getByRole('columnheader', {name: 'Age'})).toHaveStyle({
      verticalAlign: 'bottom',
    });
    await user.type(screen.getByLabelText('Filter Name'), 'Ali');
    expect(onFilterChange).toHaveBeenLastCalledWith('name', 'Ali');

    expect(
      toSearchFilters<PersonRow>({name: 'Ali'}, filterColumns, searchConfig),
    ).toEqual([
      {
        field: 'name',
        operator: 'contains',
        value: {type: 'string', value: 'Ali'},
      },
    ]);
  });

  it('uses popover actions without a duplicate input clear button', async () => {
    const user = userEvent.setup();
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
      ],
      name: 'people',
    };
    const filterColumns: TableColumn<PersonRow>[] = [
      {...columns[0], filter: 'name'},
      columns[1],
    ];

    function FilteredTable() {
      const [filters, setFilters] = useState<
        Record<string, string | undefined>
      >({});
      const filteringPlugin = useTableFiltering<PersonRow>({
        filters,
        onFilterChange: (columnKey, value) => {
          setFilters(previous => ({
            ...previous,
            [columnKey]: typeof value === 'string' ? value : undefined,
          }));
        },
        searchConfig,
        variant: 'popover',
      });
      return (
        <Table
          columns={filterColumns}
          data={data}
          plugins={{filteringPlugin}}
        />
      );
    }

    render(<FilteredTable />);
    await user.click(screen.getByRole('button', {name: 'Filter Name'}));
    await user.type(screen.getByPlaceholderText('Filter Name'), 'Ada');

    expect(
      screen.queryByRole('button', {name: 'Clear Filter Name'}),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('adds proportional min-width to widthless inline filter columns', () => {
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
      ],
      name: 'people',
    };
    const filterColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', filter: 'name'},
      {key: 'age', header: 'Age'},
    ];
    const {result} = renderHook(() =>
      useTableFiltering<PersonRow>({
        filters: {},
        onFilterChange: () => {},
        searchConfig,
        variant: 'inline',
      }),
    );

    const transformed = result.current.transformColumns?.(filterColumns);
    const widths = resolveColumnWidths(transformed ?? []);

    expect(transformed?.[0].width).toEqual(proportional(1));
    expect(widths.columns.get('name')?.style).toMatchObject({
      minWidth: '120px',
    });
    expect(transformed?.[1]).toBe(filterColumns[1]);
  });

  it('does not change popover filter columns or explicit widths', () => {
    const explicitWidth = pixel(180);
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
      ],
      name: 'people',
    };
    const filterColumns: TableColumn<PersonRow>[] = [
      {key: 'name', header: 'Name', filter: 'name', width: explicitWidth},
      {key: 'age', header: 'Age', filter: 'name'},
    ];
    const {result: inlineResult} = renderHook(() =>
      useTableFiltering<PersonRow>({
        filters: {},
        onFilterChange: () => {},
        searchConfig,
        variant: 'inline',
      }),
    );
    const {result: popoverResult} = renderHook(() =>
      useTableFiltering<PersonRow>({
        filters: {},
        onFilterChange: () => {},
        searchConfig,
        variant: 'popover',
      }),
    );

    const transformed = inlineResult.current.transformColumns?.(filterColumns);

    expect(transformed?.[0]).toBe(filterColumns[0]);
    expect(transformed?.[0].width).toBe(explicitWidth);
    expect(popoverResult.current.transformColumns).toBeUndefined();
  });
});

describe('Table utilities', () => {
  it('infers generated columns from sample data', () => {
    const generated = generateColumns([
      {
        count: 12,
        description: 'Short',
        id: 'a',
        name: 'Ada',
      },
      {
        count: 12345,
        description: 'A much longer piece of descriptive content',
        id: 'b',
        name: 'Grace Hopper',
      },
    ]);

    expect(generated.map(column => column.key)).toEqual([
      'count',
      'description',
      'id',
      'name',
    ]);
    expect(generated[0].header).toBe('Count');
    expect(generated[1].header).toBe('Description');
    expect(generated[2].header).toBe('Id');
    expect(generated[3].header).toBe('Name');
    expect(generated[0].width?.type).toBe('proportional');
    expect(generated[1].width?.type).toBe('proportional');
    expect(
      generated[1].width?.type === 'proportional'
        ? generated[1].width.value
        : 0,
    ).toBeGreaterThan(
      generated[0].width?.type === 'proportional'
        ? generated[0].width.value
        : 0,
    );
  });

  it('resolves pixel and proportional column widths', () => {
    const widths = resolveColumnWidths([
      {key: 'fixed', width: pixel(100)},
      {key: 'wide', width: proportional(2, {minWidth: 200})},
      {key: 'narrow', width: proportional(1, {minWidth: 120})},
    ]);

    expect(widths.tableMinWidth).toBe(460);
    expect(widths.columns.get('fixed')?.style).toEqual({
      minWidth: '100px',
      width: '100px',
    });
    expect(widths.columns.get('wide')?.style).toEqual({
      minWidth: '200px',
      width: `${(2 / 3) * 100}%`,
    });
    expect(widths.columns.get('narrow')?.style).toEqual({
      minWidth: '120px',
      width: `${(1 / 3) * 100}%`,
    });
  });

  it('renders supported primitive and temporal cell values by default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const item = {
      bigint: BigInt(42),
      bool: true,
      date: Temporal.PlainDate.from('2026-06-02'),
      missing: null,
      nativeDate: new globalThis.Date('2026-06-02T09:30:00Z'),
      object: {label: 'Ignored'},
      plainDateTime: Temporal.PlainDateTime.from('2026-06-02T09:30:00'),
    };

    expect(defaultCellRenderer(item, 'bigint')).toBe('42');
    expect(defaultCellRenderer(item, 'bool')).toBe('true');
    expect(defaultCellRenderer(item, 'date')).toBe('2026-06-02');
    expect(defaultCellRenderer(item, 'plainDateTime')).toBe(
      '2026-06-02T09:30:00',
    );
    expect(defaultCellRenderer(item, 'missing')).toBe('');
    expect(defaultCellRenderer(item, 'nativeDate')).toBe('');
    expect(defaultCellRenderer(item, 'object')).toBe('');

    // The unsupported-type values (nativeDate, object) warn and render empty.
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('paginates data with guarded page and page size values', () => {
    expect(paginateData([1, 2, 3, 4, 5], {page: 2, pageSize: 2})).toEqual([
      3, 4,
    ]);
    expect(paginateData([1, 2, 3], {page: 0, pageSize: 2})).toEqual([1, 2]);
    expect(paginateData([1, 2, 3], {page: 2, pageSize: 0})).toEqual([2]);
  });

  it('converts table filters for multiple operator types', () => {
    const searchConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          operators: [
            {key: 'contains', label: 'contains', value: {type: 'string'}},
          ],
        },
        {
          key: 'age',
          label: 'Age',
          operators: [
            {key: 'gte', label: 'is at least', value: {type: 'integer'}},
          ],
        },
        {
          key: 'role',
          label: 'Role',
          operators: [
            {
              key: 'is',
              label: 'is',
              value: {
                type: 'enum',
                values: [{label: 'Admin', value: 'Admin'}],
              },
            },
          ],
        },
        {
          key: 'tags',
          label: 'Tags',
          operators: [
            {key: 'any', label: 'has any', value: {type: 'string_list'}},
          ],
        },
        {
          key: 'created',
          label: 'Created',
          operators: [
            {
              key: 'on',
              label: 'on',
              value: {type: 'date_absolute'},
            },
          ],
        },
      ],
      name: 'people',
    };
    const filterColumns: TableColumn<Record<string, unknown>>[] = [
      {filter: 'name', key: 'name'},
      {filter: 'age', key: 'age'},
      {filter: 'role', key: 'role'},
      {filter: 'tags', key: 'tags'},
      {filter: 'created', key: 'created'},
    ];

    expect(
      toSearchFilters(
        {
          age: 30,
          created: Temporal.PlainDate.from('2026-06-02'),
          name: 'Ada',
          role: 'Admin',
          tags: ['systems', 'admin'],
        },
        filterColumns,
        searchConfig,
        'UTC',
      ),
    ).toEqual([
      {
        field: 'name',
        operator: 'contains',
        value: {type: 'string', value: 'Ada'},
      },
      {
        field: 'age',
        operator: 'gte',
        value: {type: 'integer', value: 30},
      },
      {
        field: 'role',
        operator: 'is',
        value: {type: 'enum', value: 'Admin'},
      },
      {
        field: 'tags',
        operator: 'any',
        value: {type: 'string_list', value: ['systems', 'admin']},
      },
      {
        field: 'created',
        operator: 'on',
        value: {type: 'date_absolute', unixSeconds: 1780358400},
      },
    ]);
  });
});

describe('Table state hooks', () => {
  it('updates, removes, and clears filter state', async () => {
    const user = userEvent.setup();

    function FilterStateHarness() {
      const {clearAll, filters, onFilterChange} = useTableFilterState({
        role: 'Admin',
      });
      return (
        <>
          <output aria-label="Filters">{JSON.stringify(filters)}</output>
          <button
            onClick={() => {
              onFilterChange('owner', 'Ada');
            }}
            type="button">
            Set owner
          </button>
          <button
            onClick={() => {
              onFilterChange('role', null);
            }}
            type="button">
            Remove role
          </button>
          <button onClick={clearAll} type="button">
            Clear
          </button>
        </>
      );
    }

    render(<FilterStateHarness />);
    expect(screen.getByLabelText('Filters')).toHaveTextContent(
      '{"role":"Admin"}',
    );

    await user.click(screen.getByRole('button', {name: 'Set owner'}));
    expect(screen.getByLabelText('Filters')).toHaveTextContent(
      '{"role":"Admin","owner":"Ada"}',
    );

    await user.click(screen.getByRole('button', {name: 'Remove role'}));
    expect(screen.getByLabelText('Filters')).toHaveTextContent(
      '{"owner":"Ada"}',
    );

    await user.click(screen.getByRole('button', {name: 'Clear'}));
    expect(screen.getByLabelText('Filters')).toHaveTextContent('{}');
  });

  it('manages column settings state and protects always-visible columns', async () => {
    const user = userEvent.setup();

    function ColumnSettingsHarness() {
      const [activeColumnKeys, setActiveColumnKeys] = useState([
        'name',
        'role',
      ]);
      const state = useTableColumnSettingsState({
        activeColumnKeys,
        columns: [
          {isAlwaysVisible: true, key: 'name', label: 'Name'},
          {key: 'age', label: 'Age'},
          {key: 'role', label: 'Role'},
        ],
        defaultColumnKeys: ['name', 'role'],
        onChangeActiveColumnKeys: keys => {
          setActiveColumnKeys([...keys]);
        },
      });
      return (
        <>
          <output aria-label="Active columns">
            {state.activeColumnKeys.join(',')}
          </output>
          <output aria-label="Age active">
            {String(state.getIsColumnActive('age'))}
          </output>
          <output aria-label="Name toggleable">
            {String(state.getIsColumnToggleable('name'))}
          </output>
          <button
            onClick={() => {
              state.toggleColumn('name');
            }}
            type="button">
            Toggle name
          </button>
          <button
            onClick={() => {
              state.toggleColumn('age');
            }}
            type="button">
            Toggle age
          </button>
          <button onClick={state.showAllColumns} type="button">
            Show all
          </button>
          <button onClick={state.resetToDefault} type="button">
            Reset
          </button>
          <button
            onClick={() => {
              state.setActiveColumnKeys(['role']);
            }}
            type="button">
            Set role only
          </button>
        </>
      );
    }

    render(<ColumnSettingsHarness />);
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'name,role',
    );
    expect(screen.getByLabelText('Name toggleable')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', {name: 'Toggle name'}));
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'name,role',
    );

    await user.click(screen.getByRole('button', {name: 'Toggle age'}));
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'name,role,age',
    );
    expect(screen.getByLabelText('Age active')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', {name: 'Reset'}));
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'name,role',
    );

    await user.click(screen.getByRole('button', {name: 'Set role only'}));
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'role,name',
    );

    await user.click(screen.getByRole('button', {name: 'Show all'}));
    expect(screen.getByLabelText('Active columns')).toHaveTextContent(
      'name,age,role',
    );
  });
});

describe('Table horizontal scroll region', () => {
  it('exposes the scroll wrapper as a labeled, focusable group', () => {
    render(<Table columns={columns} data={data} idKey="id" />);

    const group = screen.getByRole('group', {name: 'Table scroll area'});
    expect(group).toHaveAttribute('data-part', 'wrapper');
    expect(group).toHaveAttribute('tabindex', '0');
  });

  it('names the scroll region after the table label', () => {
    render(<Table columns={columns} data={data} idKey="id" label="Team" />);

    expect(
      screen.getByRole('group', {name: 'Team scroll area'}),
    ).toBeInTheDocument();
  });

  it('lets a keyboard user focus the scroll region', async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} data={data} idKey="id" />);

    await user.tab();

    expect(
      screen.getByRole('group', {name: 'Table scroll area'}),
    ).toHaveFocus();
  });

  it('does not publish a landmark per table', () => {
    render(
      <>
        <Table columns={columns} data={data} idKey="id" label="First" />
        <Table columns={columns} data={data} idKey="id" label="Second" />
      </>,
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });
});
