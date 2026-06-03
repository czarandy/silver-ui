import type {Meta, StoryObj} from '@storybook/react-vite';
import {RotateCcw, Settings2} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Badge} from '../Badge';
import {Button} from '../Button';
import {EmptyState} from '../EmptyState';
import type {SearchFilterInputConfig} from '../SearchFilterInput';
import {Table} from './Table';
import {TableBody} from './TableBody';
import {TableCell} from './TableCell';
import {TableFooter} from './TableFooter';
import {TableHeader} from './TableHeader';
import {TableHeaderCell} from './TableHeaderCell';
import {TableRow} from './TableRow';
import {pixel, proportional} from './columnUtils';
import {useTableColumnResize} from './plugins/columnResize';
import {useTableColumnSettings} from './plugins/columnSettings';
import {
  useTableFiltering,
  useTableFilterState,
  type TableFilterState,
  type TableFilterVariant,
} from './plugins/filtering';
import {paginateData, useTablePagination} from './plugins/pagination';
import {useTableSelection, useTableSelectionState} from './plugins/selection';
import {useTableSortable, useTableSortableState} from './plugins/sortable';
import type {TableColumn, TableDividers} from './types';

interface TaskRow extends Record<string, unknown> {
  budget: number;
  due: string;
  id: string;
  notes: string;
  owner: string;
  priority: 'High' | 'Low' | 'Medium';
  progress: string;
  status: 'Blocked' | 'Done' | 'In progress' | 'Ready';
  task: string;
}

const data: TaskRow[] = [
  {
    budget: 18200,
    due: 'Jun 12',
    id: 'design',
    notes:
      'Prepare the final handoff package with annotated screenshots, links to key decisions, and open follow-up items.',
    owner: 'Ada Lovelace',
    priority: 'High',
    progress: '70%',
    status: 'In progress',
    task: 'Design review',
  },
  {
    budget: 9600,
    due: 'Jun 17',
    id: 'migration',
    notes:
      'Move remaining accounts to the new billing pipeline after validating invoice previews with support.',
    owner: 'Grace Hopper',
    priority: 'Medium',
    progress: '45%',
    status: 'Ready',
    task: 'Billing migration',
  },
  {
    budget: 13400,
    due: 'Jun 21',
    id: 'qa',
    notes:
      'Run the cross-browser verification pass and log issues against the release checklist.',
    owner: 'Katherine Johnson',
    priority: 'High',
    progress: '20%',
    status: 'Blocked',
    task: 'QA pass',
  },
  {
    budget: 7200,
    due: 'Jun 24',
    id: 'docs',
    notes:
      'Refresh the administrator guide and add examples for importing historical project data.',
    owner: 'Hedy Lamarr',
    priority: 'Low',
    progress: '100%',
    status: 'Done',
    task: 'Docs refresh',
  },
  {
    budget: 15100,
    due: 'Jun 27',
    id: 'alerts',
    notes:
      'Tune noisy alert thresholds and group notifications by service owner for faster triage.',
    owner: 'Alan Turing',
    priority: 'Medium',
    progress: '55%',
    status: 'In progress',
    task: 'Alert tuning',
  },
  {
    budget: 5400,
    due: 'Jul 2',
    id: 'research',
    notes:
      'Interview workflow owners and summarize the strongest opportunities for dashboard consolidation.',
    owner: 'Mary Jackson',
    priority: 'Low',
    progress: '10%',
    status: 'Ready',
    task: 'Research synthesis',
  },
];

const columns: TableColumn<TaskRow>[] = [
  {header: 'Task', key: 'task', sortable: true, width: proportional(2)},
  {header: 'Owner', key: 'owner', sortable: true, width: proportional(2)},
  {
    header: 'Status',
    key: 'status',
    renderCell: item => (
      <Badge
        color={
          item.status === 'Done'
            ? 'success'
            : item.status === 'Blocked'
              ? 'warning'
              : item.status === 'Ready'
                ? 'info'
                : 'neutral'
        }
        label={item.status}
        size="lg"
      />
    ),
    sortable: true,
    width: pixel(132),
  },
  {align: 'end', header: 'Budget', key: 'budget', sortable: true},
  {header: 'Due', key: 'due', sortable: true, width: pixel(96)},
];

const longTextColumns: TableColumn<TaskRow>[] = [
  {header: 'Task', key: 'task', width: pixel(180)},
  {header: 'Notes', key: 'notes', width: proportional(3)},
  {header: 'Owner', key: 'owner', width: pixel(180)},
];

const widthColumns: TableColumn<TaskRow>[] = [
  {header: 'Fixed 160px', key: 'task', width: pixel(160)},
  {
    header: '2fr min 180px',
    key: 'notes',
    width: proportional(2, {minWidth: 180}),
  },
  {
    header: '1fr min 120px',
    key: 'owner',
    width: proportional(1, {minWidth: 120}),
  },
  {header: 'Fixed 96px', key: 'due', width: pixel(96)},
];

const filterSearchConfig: SearchFilterInputConfig = {
  fields: [
    {
      key: 'owner',
      label: 'Owner',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {label: 'Blocked', value: 'Blocked'},
              {label: 'Done', value: 'Done'},
              {label: 'In progress', value: 'In progress'},
              {label: 'Ready', value: 'Ready'},
            ],
          },
        },
      ],
    },
  ],
  name: 'tasks',
};

const filterColumns: TableColumn<TaskRow>[] = [
  {...columns[0], filter: 'owner'},
  {...columns[1], filter: 'owner'},
  {...columns[2], filter: 'status'},
  columns[3],
  columns[4],
];

const meta = {
  title: 'Components/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

function filterData(rows: TaskRow[], filters: TableFilterState): TaskRow[] {
  return rows.filter(row => {
    const owner = filters.owner;
    const status = filters.status;
    return (
      (typeof owner !== 'string' ||
        row.owner.toLocaleLowerCase().includes(owner.toLocaleLowerCase())) &&
      (typeof status !== 'string' || row.status === status)
    );
  });
}

function DensityStory() {
  return (
    <div style={{display: 'grid', gap: 24}}>
      <Table columns={columns} data={data.slice(0, 2)} density="compact" />
      <Table columns={columns} data={data.slice(0, 2)} density="balanced" />
      <Table columns={columns} data={data.slice(0, 2)} density="spacious" />
    </div>
  );
}

function DividersStory() {
  const variants: TableDividers[] = ['rows', 'columns', 'grid', 'none'];
  return (
    <div style={{display: 'grid', gap: 24}}>
      {variants.map(variant => (
        <Table
          columns={columns}
          data={data.slice(0, 2)}
          dividers={variant}
          key={variant}
        />
      ))}
    </div>
  );
}

function TextOverflowStory() {
  const overflowData = data.slice(0, 3).map((item, index) =>
    index === 0
      ? {
          ...item,
          notes:
            'UnbrokenIdentifier_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ with surrounding copy to compare truncation and wrapping.',
        }
      : item,
  );

  return (
    <div style={{display: 'grid', gap: 24}}>
      <Table
        columns={longTextColumns}
        data={overflowData}
        textOverflow="truncate"
      />
      <Table
        columns={longTextColumns}
        data={overflowData}
        textOverflow="wrap"
      />
    </div>
  );
}

function VerticalAlignStory() {
  return (
    <div style={{display: 'grid', gap: 24}}>
      <Table
        columns={longTextColumns}
        data={data.slice(0, 2)}
        verticalAlign="top"
      />
      <Table
        columns={longTextColumns}
        data={data.slice(0, 2)}
        verticalAlign="middle"
      />
      <Table
        columns={longTextColumns}
        data={data.slice(0, 2)}
        verticalAlign="bottom"
      />
    </div>
  );
}

function SortableStory() {
  const sortable = useTableSortableState<TaskRow, string>({
    data,
    isMultiSortEnabled: true,
  });
  const sortPlugin = useTableSortable<TaskRow>(sortable.sortConfig);
  return (
    <Table
      columns={columns}
      data={sortable.sortedData}
      idKey="id"
      plugins={{sortPlugin}}
    />
  );
}

function SelectionStory() {
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set<string>(['design']),
  );
  const selection = useTableSelectionState({
    data,
    getIsItemEnabled: item => item.status !== 'Blocked',
    getIsItemSelectable: item => item.status !== 'Done',
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selection.selectionConfig);
  return (
    <Table
      columns={columns}
      data={data}
      idKey="id"
      plugins={{selectionPlugin}}
    />
  );
}

function PaginationStory() {
  const [page, setPage] = useState(1);
  const pageSize = 2;
  const paginationPlugin = useTablePagination<TaskRow>({
    onPageChange: setPage,
    page,
    pageSize,
    position: 'both',
    totalItems: data.length,
    variant: 'pages',
  });
  return (
    <Table
      columns={columns}
      data={paginateData(data, {page, pageSize})}
      idKey="id"
      plugins={{paginationPlugin}}
    />
  );
}

function ColumnSettingsStory() {
  const defaultKeys = ['task', 'owner', 'status', 'due'];
  const [activeColumnKeys, setActiveColumnKeys] = useState(defaultKeys);
  const settingsPlugin = useTableColumnSettings<TaskRow>({
    activeColumnKeys,
    columns: [
      {isAlwaysVisible: true, key: 'task', label: 'Task'},
      {key: 'owner', label: 'Owner'},
      {key: 'status', label: 'Status'},
      {key: 'budget', label: 'Budget'},
      {key: 'due', label: 'Due'},
    ],
    defaultColumnKeys: defaultKeys,
    onChangeActiveColumnKeys: keys => {
      setActiveColumnKeys([...keys]);
    },
  });
  return (
    <div style={{display: 'grid', gap: 12}}>
      <div style={{display: 'flex', gap: 8}}>
        <Button
          icon={Settings2}
          label="Show budget"
          onClick={() => {
            setActiveColumnKeys(['task', 'owner', 'status', 'budget', 'due']);
          }}
          size="sm"
          variant="secondary"
        />
        <Button
          icon={Settings2}
          label="Reorder"
          onClick={() => {
            setActiveColumnKeys(['status', 'task', 'owner', 'due']);
          }}
          size="sm"
          variant="secondary"
        />
        <Button
          icon={RotateCcw}
          label="Reset"
          onClick={() => {
            setActiveColumnKeys(defaultKeys);
          }}
          size="sm"
          variant="ghost"
        />
      </div>
      <Table
        columns={columns}
        data={data}
        idKey="id"
        plugins={{settingsPlugin}}
      />
    </div>
  );
}

function ColumnResizeStory() {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    due: 128,
    task: 220,
    owner: 180,
  });
  const resizePlugin = useTableColumnResize<TaskRow>({
    columnWidths,
    columns: columns as TableColumn<Record<string, unknown>>[],
    minWidth: 96,
    onColumnResizeEnd: updates => {
      setColumnWidths(previous => ({...previous, ...updates}));
    },
  });
  return (
    <Table columns={columns} data={data} idKey="id" plugins={{resizePlugin}} />
  );
}

function FilteredTable({variant}: {variant: TableFilterVariant}) {
  const {filters, onFilterChange} = useTableFilterState();
  const filteredRows = useMemo(() => filterData(data, filters), [filters]);
  const filteringPlugin = useTableFiltering<TaskRow>({
    filters,
    onFilterChange,
    searchConfig: filterSearchConfig,
    variant,
  });
  return (
    <Table
      columns={filterColumns}
      data={filteredRows}
      emptyState={<EmptyState isCompact title="No matching tasks" />}
      idKey="id"
      plugins={{filteringPlugin}}
    />
  );
}

function FilteringStory() {
  return <FilteredTable variant="popover" />;
}

function InlineFilteringStory() {
  return <FilteredTable variant="inline" />;
}

function CombinedPluginsStory() {
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
  const {filters, onFilterChange} = useTableFilterState();
  const filteredRows = useMemo(() => filterData(data, filters), [filters]);
  const sortable = useTableSortableState<TaskRow, string>({
    data: filteredRows,
    defaultSort: [{direction: 'ascending', sortKey: 'due'}],
  });
  const selection = useTableSelectionState({
    data: sortable.sortedData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const pageSize = 3;
  const sortPlugin = useTableSortable<TaskRow>(sortable.sortConfig);
  const selectionPlugin = useTableSelection(selection.selectionConfig);
  const filteringPlugin = useTableFiltering<TaskRow>({
    filters,
    onFilterChange,
    searchConfig: filterSearchConfig,
    variant: 'popover',
  });
  const paginationPlugin = useTablePagination<TaskRow>({
    onPageChange: setPage,
    page,
    pageSize,
    totalItems: sortable.sortedData.length,
    variant: 'compact',
  });
  return (
    <Table
      columns={filterColumns}
      data={paginateData(sortable.sortedData, {page, pageSize})}
      idKey="id"
      plugins={{selectionPlugin, sortPlugin, filteringPlugin, paginationPlugin}}
    />
  );
}

export const Default: Story = {
  render: () => <Table columns={columns} data={data} idKey="id" />,
};

export const EmptyStateStory: Story = {
  name: 'Empty State',
  render: () => (
    <Table
      columns={columns}
      data={[]}
      emptyState={
        <EmptyState
          description="Try adjusting filters or creating a new task."
          isCompact
          title="No tasks found"
        />
      }
    />
  ),
};

export const DefaultEmptyState: Story = {
  render: () => <Table columns={columns} data={[]} />,
};

export const Density: Story = {
  render: () => <DensityStory />,
};

export const Dividers: Story = {
  render: () => <DividersStory />,
};

export const Striped: Story = {
  render: () => <Table columns={columns} data={data} idKey="id" isStriped />,
};

export const Hover: Story = {
  render: () => <Table columns={columns} data={data} hasHover idKey="id" />,
};

export const TextOverflow: Story = {
  render: () => <TextOverflowStory />,
};

export const VerticalAlign: Story = {
  render: () => <VerticalAlignStory />,
};

export const ColumnWidths: Story = {
  render: () => <Table columns={widthColumns} data={data} idKey="id" />,
};

export const CustomCellRendering: Story = {
  render: () => (
    <Table
      columns={[
        columns[0],
        columns[1],
        {
          header: 'Priority',
          key: 'priority',
          renderCell: item => (
            <Badge
              color={
                item.priority === 'High'
                  ? 'error'
                  : item.priority === 'Medium'
                    ? 'warning'
                    : 'neutral'
              }
              label={item.priority}
              size="lg"
            />
          ),
        },
        columns[2],
      ]}
      data={data}
      idKey="id"
    />
  ),
};

export const AutoColumns: Story = {
  render: () => <Table data={data.slice(0, 4)} idKey="id" />,
};

export const ChildrenMode: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Plan</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Manual rows</TableCell>
          <TableCell>Ready</TableCell>
          <TableCell>Ada Lovelace</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Rendered with table primitives.</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Sortable: Story = {
  render: () => <SortableStory />,
};

export const Selection: Story = {
  render: () => <SelectionStory />,
};

export const Pagination: Story = {
  render: () => <PaginationStory />,
};

export const ColumnSettings: Story = {
  render: () => <ColumnSettingsStory />,
};

export const ColumnResize: Story = {
  render: () => <ColumnResizeStory />,
};

export const Filtering: Story = {
  render: () => <FilteringStory />,
};

export const InlineFiltering: Story = {
  render: () => <InlineFilteringStory />,
};

export const CombinedPlugins: Story = {
  render: () => <CombinedPluginsStory />,
};
