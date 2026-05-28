import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type {SearchFilterInputConfig} from '../SearchFilterInput';
import {Table} from './Table';
import {pixel} from './columnUtils';
import {useTableColumnResize} from './plugins/columnResize';
import {useTableColumnSettings} from './plugins/columnSettings';
import {toSearchFilters, useTableFiltering} from './plugins/filtering';
import {useTablePagination} from './plugins/pagination';
import {useTableSelection, useTableSelectionState} from './plugins/selection';
import {useTableSortable, useTableSortableState} from './plugins/sortable';
import type {TableColumn} from './types';

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

describe('Table', () => {
  it('renders data-driven columns, cells, and empty state', () => {
    const {rerender} = render(
      <Table columns={columns} data={data} idKey="id" />,
    );

    expect(
      screen.getByRole('columnheader', {name: 'Name'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: 'Alice'})).toBeInTheDocument();
    expect(screen.getByRole('cell', {name: '24'})).toBeInTheDocument();

    rerender(<Table columns={columns} data={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
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

describe('Table plugins', () => {
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

  it('renders resize handles and commits keyboard resize changes', async () => {
    const user = userEvent.setup();
    const onColumnResizeEnd = vi.fn();

    function ResizableTable() {
      const resizePlugin = useTableColumnResize<PersonRow>({
        columnWidths: {name: 160},
        columns: columns as TableColumn<Record<string, unknown>>[],
        onColumnResizeEnd,
      });
      return <Table columns={columns} data={data} plugins={{resizePlugin}} />;
    }

    render(<ResizableTable />);
    const handle = screen.getByRole('button', {name: 'Resize Name column'});
    handle.focus();
    await user.keyboard('{ArrowRight}');

    expect(onColumnResizeEnd).toHaveBeenCalledWith({name: 170});
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
});
