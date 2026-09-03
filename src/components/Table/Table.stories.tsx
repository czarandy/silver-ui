import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {RotateCcw, Settings2} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {EmptyState} from 'components/EmptyState';
import {Item} from 'components/Item';
import type {SearchFilterInputConfig} from 'components/SearchFilterInput';
import {Table} from 'components/Table/Table';
import {TableBody} from 'components/Table/TableBody';
import {TableCell} from 'components/Table/TableCell';
import {TableFooter} from 'components/Table/TableFooter';
import {TableHeader} from 'components/Table/TableHeader';
import {TableHeaderCell} from 'components/Table/TableHeaderCell';
import {TableRow} from 'components/Table/TableRow';
import {pixel, proportional} from 'components/Table/columnUtils';
import {useTableColumnResize} from 'components/Table/plugins/columnResize';
import {useTableColumnSettings} from 'components/Table/plugins/columnSettings';
import {
  useTableRowExpansion,
  useTableRowExpansionState,
} from 'components/Table/plugins/expansion';
import {
  useTableFiltering,
  useTableFilterState,
  type TableFilterState,
  type TableFilterVariant,
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
import type {TableColumn, TableDividers} from 'components/Table/types';

interface TaskRow extends Record<string, unknown> {
  budget: number;
  due: string;
  id: string;
  notes: string;
  owner: string;
  priority: 'High' | 'Low' | 'Medium';
  progress: string;
  status: 'Blocked' | 'Done' | 'In progress' | 'Ready';
  subtasks?: TaskRow[];
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

interface ContactRow extends Record<string, unknown> {
  dob: Temporal.PlainDate | null;
  email: string;
  id: string;
  name: string;
}

const contactData: ContactRow[] = [
  {
    dob: Temporal.PlainDate.from('1980-01-19'),
    email: 'alex.morgan@example.com',
    id: 'alex',
    name: 'Alex Morgan',
  },
  {
    dob: Temporal.PlainDate.from('1983-09-27'),
    email: 'sam.rivera@example.com',
    id: 'sam',
    name: 'Sam Rivera',
  },
  {
    dob: null,
    email: 'jordan.lee@example.com',
    id: 'jordan',
    name: 'Jordan Lee',
  },
  {
    dob: Temporal.PlainDate.from('1994-08-22'),
    email: 'taylor.kim@example.com',
    id: 'taylor',
    name: 'Taylor Kim',
  },
];

const contactColumns: TableColumn<ContactRow>[] = [
  {
    header: 'Name',
    key: 'name',
    renderCell: item => (
      <Item description={item.email} label={item.name} padding={0} />
    ),
    width: proportional(2),
  },
  {
    header: 'DOB',
    key: 'dob',
    renderCell: item => item.dob?.toString() ?? '—',
    width: pixel(180),
  },
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

interface FileRow extends Record<string, unknown> {
  children?: FileRow[];
  id: string;
  kind: 'file' | 'folder';
  modified: string;
  name: string;
  size: string;
}

const fileTree: FileRow[] = [
  {
    children: [
      {
        children: [
          {
            id: 'src/components/Button.tsx',
            kind: 'file',
            modified: 'Jun 18',
            name: 'Button.tsx',
            size: '4.2 KB',
          },
          {
            id: 'src/components/Table.tsx',
            kind: 'file',
            modified: 'Jun 20',
            name: 'Table.tsx',
            size: '12.8 KB',
          },
        ],
        id: 'src/components',
        kind: 'folder',
        modified: 'Jun 20',
        name: 'components',
        size: '—',
      },
      {
        children: [
          {
            id: 'src/utils/format.ts',
            kind: 'file',
            modified: 'Jun 17',
            name: 'format.ts',
            size: '1.3 KB',
          },
        ],
        id: 'src/utils',
        kind: 'folder',
        modified: 'Jun 17',
        name: 'utils',
        size: '—',
      },
      {
        id: 'src/index.ts',
        kind: 'file',
        modified: 'Jun 20',
        name: 'index.ts',
        size: '0.4 KB',
      },
    ],
    id: 'src',
    kind: 'folder',
    modified: 'Jun 20',
    name: 'src',
    size: '—',
  },
  {
    children: [
      {
        id: 'public/favicon.ico',
        kind: 'file',
        modified: 'May 20',
        name: 'favicon.ico',
        size: '15 KB',
      },
    ],
    id: 'public',
    kind: 'folder',
    modified: 'Jun 1',
    name: 'public',
    size: '—',
  },
  {
    id: 'package.json',
    kind: 'file',
    modified: 'Jun 22',
    name: 'package.json',
    size: '1.8 KB',
  },
  {
    id: 'README.md',
    kind: 'file',
    modified: 'Jun 1',
    name: 'README.md',
    size: '0.6 KB',
  },
];

const fileColumns: TableColumn<FileRow>[] = [
  {header: 'Name', key: 'name', width: proportional(2)},
  {header: 'Kind', key: 'kind', width: pixel(90)},
  {header: 'Size', key: 'size', width: pixel(90)},
  {header: 'Modified', key: 'modified', width: pixel(110)},
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
        <Table dividers={variant} key={variant} label={`${variant} dividers`}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Cost</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Compute</TableCell>
              <TableCell>$18.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Storage</TableCell>
              <TableCell>$6.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$24.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
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

function MultilineSelectionStory() {
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(contactData.map(item => item.id)),
  );
  const selection = useTableSelectionState({
    data: contactData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selection.selectionConfig);
  return (
    <Table
      columns={contactColumns}
      data={contactData}
      idKey="id"
      plugins={{selectionPlugin}}
      verticalAlign="top"
    />
  );
}

function StripedSelectionStory() {
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set([contactData[0].id, contactData[2].id]),
  );
  const selection = useTableSelectionState({
    data: contactData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selection.selectionConfig);
  return (
    <Table
      columns={contactColumns}
      data={contactData}
      idKey="id"
      isStriped
      plugins={{selectionPlugin}}
      verticalAlign="top"
    />
  );
}

function SelectionMinimumWidthStory() {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
  const selection = useTableSelectionState({
    data,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selection.selectionConfig);
  return (
    <div style={{maxWidth: '100%', width: '560px'}}>
      <Table
        columns={[
          {header: 'Task', key: 'task'},
          {header: 'Owner', key: 'owner'},
          {header: 'Status', key: 'status'},
          {align: 'end', header: 'Budget', key: 'budget'},
          {header: 'Due', key: 'due'},
        ]}
        data={data}
        idKey="id"
        plugins={{selectionPlugin}}
        style={{minWidth: '760px'}}
      />
    </div>
  );
}

function RowExpansionStory() {
  const expansion = useTableRowExpansionState<FileRow>({
    data: fileTree,
    defaultExpandedKeys: ['src'],
    getChildren: item => item.children,
    getRowKey: item => item.id,
  });
  const expansionPlugin = useTableRowExpansion<FileRow>({
    ...expansion.expansionConfig,
    hasExpandAllToggle: true,
  });
  return (
    <Table
      columns={fileColumns}
      data={expansion.data}
      hasHover
      idKey="id"
      plugins={{expansion: expansionPlugin}}
    />
  );
}

function RowExpansionRowClickStory() {
  const expansion = useTableRowExpansionState<FileRow>({
    data: fileTree,
    getChildren: item => item.children,
    getRowKey: item => item.id,
  });
  const expansionPlugin = useTableRowExpansion<FileRow>({
    ...expansion.expansionConfig,
    getExpanderLabel: (item, isExpanded) =>
      isExpanded ? `Collapse ${item.name}` : `Expand ${item.name}`,
    hasRowClickExpansion: true,
  });
  return (
    <Table
      columns={fileColumns}
      data={expansion.data}
      hasHover
      idKey="id"
      plugins={{expansion: expansionPlugin}}
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

const combinedTaskTree: TaskRow[] = data.map(row => {
  if (row.id === 'design') {
    return {
      ...row,
      subtasks: [
        {
          budget: 4200,
          due: 'Jun 10',
          id: 'design/annotations',
          notes: 'Annotate the final screens with decision links.',
          owner: 'Ada Lovelace',
          priority: 'High',
          progress: '90%',
          status: 'In progress',
          task: 'Annotate screens',
        },
        {
          budget: 2600,
          due: 'Jun 11',
          id: 'design/handoff',
          notes: 'Package decisions and open follow-up items.',
          owner: 'Ada Lovelace',
          priority: 'Medium',
          progress: '40%',
          status: 'Ready',
          task: 'Handoff package',
        },
      ],
    };
  }
  if (row.id === 'qa') {
    return {
      ...row,
      subtasks: [
        {
          budget: 3800,
          due: 'Jun 19',
          id: 'qa/browsers',
          notes: 'Verify the release checklist across browsers.',
          owner: 'Katherine Johnson',
          priority: 'High',
          progress: '10%',
          status: 'Blocked',
          task: 'Cross-browser pass',
        },
      ],
    };
  }
  return row;
});

function CombinedPluginsStory() {
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
  const {filters, onFilterChange} = useTableFilterState();
  // Composition order: filter and sort operate on the root rows of the tree,
  // expansion flattens the visible rows, and pagination slices the flattened
  // output last (paginating before flattening would orphan child rows).
  const filteredRows = useMemo(
    () => filterData(combinedTaskTree, filters),
    [filters],
  );
  const sortable = useTableSortableState<TaskRow, string>({
    data: filteredRows,
    defaultSort: [{direction: 'ascending', sortKey: 'due'}],
  });
  const expansion = useTableRowExpansionState<TaskRow>({
    data: sortable.sortedData,
    defaultExpandedKeys: ['design'],
    getChildren: item => item.subtasks,
    getRowKey: item => item.id,
  });
  const selection = useTableSelectionState({
    data: expansion.data,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const pageSize = 3;
  const sortPlugin = useTableSortable<TaskRow>(sortable.sortConfig);
  const expansionPlugin = useTableRowExpansion(expansion.expansionConfig);
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
    totalItems: expansion.data.length,
    variant: 'compact',
  });
  return (
    <Table
      columns={filterColumns}
      data={paginateData(expansion.data, {page, pageSize})}
      idKey="id"
      plugins={{
        expansionPlugin,
        selectionPlugin,
        sortPlugin,
        filteringPlugin,
        paginationPlugin,
      }}
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

/**
 * Hover and striping apply to body rows only — the header and footer stay
 * unhighlighted because they are not interactive.
 */
export const HoverWithSections: Story = {
  render: () => (
    <Table hasHover isStriped>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Plan</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Starter</TableCell>
          <TableCell>Ready</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Growth</TableCell>
          <TableCell>Ready</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Enterprise</TableCell>
          <TableCell>Draft</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>3 plans</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
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

/**
 * Inline sizing remains on the table when using primitive children. When the
 * table is wider than its container, the built-in scroll region exposes every
 * column instead of compressing or clipping its content.
 */
export const ChildrenModeMinimumWidth: Story = {
  name: 'Children mode / Minimum width',
  render: () => (
    <div style={{maxWidth: '100%', width: '560px'}}>
      <Table
        label="Release readiness"
        style={{minWidth: '760px'}}
        verticalAlign="top">
        <TableHeader>
          <TableRow>
            <TableHeaderCell style={{width: '150px'}}>
              Workstream
            </TableHeaderCell>
            <TableHeaderCell style={{width: '130px'}}>Owner</TableHeaderCell>
            <TableHeaderCell style={{width: '170px'}}>Status</TableHeaderCell>
            <TableHeaderCell style={{width: '310px'}}>
              Next step
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Documentation</TableCell>
            <TableCell>Alex Morgan</TableCell>
            <TableCell>
              <Badge color="success" label="Ready for review" size="lg" />
            </TableCell>
            <TableCell>
              Publish the migration guide and confirm that every example uses
              the stable API.
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Accessibility</TableCell>
            <TableCell>Sam Rivera</TableCell>
            <TableCell>
              <Badge color="warning" label="Follow-up needed" size="lg" />
            </TableCell>
            <TableCell>
              Recheck keyboard navigation at compact viewport sizes before the
              release candidate is tagged.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const Sortable: Story = {
  render: () => <SortableStory />,
};

export const Selection: Story = {
  render: () => <SelectionStory />,
};

/**
 * Selection controls remain centered in rows with multi-line content, even
 * when the table's content cells use top alignment.
 */
export const SelectionMultilineRows: Story = {
  name: 'Selection / Multi-line rows',
  render: () => <MultilineSelectionStory />,
};

/**
 * Striped tables retain the active selection color because the quiet gray
 * selection fill would otherwise be indistinguishable from ordinary stripes.
 */
export const SelectionStripedRows: Story = {
  name: 'Selection / Striped rows',
  render: () => <StripedSelectionStory />,
};

/**
 * A consumer minimum width also holds when a plugin injects its own
 * fixed-width column: the effective floor is the larger of the consumer and
 * derived minimums, so the selection checkbox column cannot collapse the
 * table below the consumer's value.
 */
export const SelectionMinimumWidth: Story = {
  name: 'Selection / Minimum width',
  render: () => <SelectionMinimumWidthStory />,
};

/**
 * Hierarchical rows: `useTableRowExpansionState` flattens the currently
 * visible tree (its `data` result is what the Table renders) and
 * `useTableRowExpansion` adds the chevron control column, depth indentation
 * on the first content column, and the optional expand-all header toggle.
 */
export const RowExpansion: Story = {
  render: () => <RowExpansionStory />,
};

/**
 * With `hasRowClickExpansion`, clicking anywhere on an expandable row toggles
 * it (interactive content inside the row is ignored). `getExpanderLabel`
 * customizes each chevron's accessible name.
 */
export const RowExpansionRowClick: Story = {
  name: 'Row Expansion / Row click',
  render: () => <RowExpansionRowClickStory />,
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
