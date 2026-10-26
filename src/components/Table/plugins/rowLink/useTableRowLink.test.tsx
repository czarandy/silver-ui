import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState, type ComponentPropsWithRef} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {LinkProvider} from 'components/Link';
import {Popover} from 'components/Popover';
import {Table} from 'components/Table/Table';
import {
  useTableRowExpansion,
  useTableRowExpansionState,
} from 'components/Table/plugins/expansion';
import {useTableRowLink} from 'components/Table/plugins/rowLink';
import {
  useTableSelection,
  useTableSelectionState,
} from 'components/Table/plugins/selection';
import type {TableColumn, TablePlugin} from 'components/Table/types';

interface ThreadRow extends Record<string, unknown> {
  href: string | null;
  id: string;
  question: string;
  subRows?: ThreadRow[];
  title: string;
}

const rows: ThreadRow[] = [
  {href: '/threads/1', id: '1', question: 'How do I bill?', title: 'Billing'},
  {href: null, id: '2', question: 'Who am I?', title: 'Unlinked'},
];

const columns: TableColumn<ThreadRow>[] = [
  {header: 'Title', key: 'title'},
  {header: 'Question', key: 'question'},
];

const preventNavigation = (event: Event): void => {
  event.preventDefault();
};

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-router-link data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

const NO_PLUGINS: Record<string, TablePlugin<ThreadRow>> = {};

function LinkedTable({
  columns: tableColumns = columns,
  columnKey = 'title',
  extraPlugins = NO_PLUGINS,
}: {
  columnKey?: string;
  columns?: TableColumn<ThreadRow>[];
  extraPlugins?: Record<string, TablePlugin<ThreadRow>>;
}): React.JSX.Element {
  const rowLink = useTableRowLink<ThreadRow>({
    columnKey,
    getRowHref: row => row.href,
  });
  return (
    <Table
      columns={tableColumns}
      data={rows}
      idKey="id"
      plugins={{...extraPlugins, rowLink}}
    />
  );
}

function getRow(text: string): HTMLTableRowElement {
  // eslint-disable-next-line testing-library/no-node-access -- the row is the clickable surface under test
  const row = screen.getByText(text).closest('tr');
  if (row == null) {
    throw new Error(`No row contains ${text}`);
  }
  return row;
}

/**
 * Records clicks that reach the link, cancelling their navigation so jsdom
 * does not attempt it.
 */
function spyOnLinkClicks(): ReturnType<typeof vi.fn<(event: Event) => void>> {
  const onLinkClick = vi.fn<(event: Event) => void>(preventNavigation);
  const link = screen.getByRole('link', {name: 'Billing'});
  link.addEventListener('click', onLinkClick);
  return onLinkClick;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('useTableRowLink', () => {
  it('renders the column content as a LinkProvider link on linked rows only', () => {
    render(
      <LinkProvider component={RouterLink}>
        <LinkedTable />
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Billing'});
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/threads/1');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(getRow('Billing')).toHaveClass('silver-cursor_pointer');
    expect(getRow('Unlinked')).not.toHaveClass('silver-cursor_pointer');
  });

  it('forwards a click anywhere on the row to its link exactly once', async () => {
    const user = userEvent.setup();
    render(<LinkedTable />);
    const onLinkClick = spyOnLinkClicks();

    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('link', {name: 'Billing'}));
    expect(onLinkClick).toHaveBeenCalledTimes(2);

    await user.click(screen.getByText('Who am I?'));
    expect(onLinkClick).toHaveBeenCalledTimes(2);
  });

  it('preserves modifier keys and forwards middle-click', () => {
    render(<LinkedTable />);
    const onLinkClick = spyOnLinkClicks();
    const onLinkAuxClick = vi.fn();
    screen
      .getByRole('link', {name: 'Billing'})
      .addEventListener('auxclick', onLinkAuxClick);

    fireEvent.click(screen.getByText('How do I bill?'), {
      ctrlKey: true,
      metaKey: true,
    });
    expect(onLinkClick.mock.calls[0][0]).toMatchObject({
      ctrlKey: true,
      metaKey: true,
    });

    fireEvent(
      screen.getByText('How do I bill?'),
      new MouseEvent('auxclick', {bubbles: true, button: 1}),
    );
    expect(onLinkAuxClick).toHaveBeenCalledWith(
      expect.objectContaining({button: 1}),
    );
  });

  it('leaves nested controls, open popovers, and text selection independent', async () => {
    const user = userEvent.setup();
    const onArchive = vi.fn();
    render(
      <LinkedTable
        columns={[
          ...columns,
          {
            header: 'Actions',
            key: 'actions',
            renderCell: () => (
              <>
                <button onClick={onArchive} type="button">
                  Archive
                </button>
                <Popover content={<p>Popover body</p>} isOpen label="Details">
                  <button type="button">Details</button>
                </Popover>
              </>
            ),
          },
        ]}
      />,
    );
    const onLinkClick = spyOnLinkClicks();

    await user.click(screen.getAllByRole('button', {name: 'Archive'})[0]);
    expect(onArchive).toHaveBeenCalledOnce();
    fireEvent.click(screen.getAllByText('Popover body')[0]);
    expect(onLinkClick).not.toHaveBeenCalled();

    const question = screen.getByText('How do I bill?');
    vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: question,
      focusNode: question,
      isCollapsed: false,
      toString: () => 'How do I bill?',
    } as unknown as Selection);
    fireEvent.click(question);
    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('leaves the selection cell, including its padding, to the checkbox', async () => {
    const user = userEvent.setup();
    function SelectableLinkedTable(): React.JSX.Element {
      const [selectedKeys, setSelectedKeys] = useState(() => new Set<string>());
      const selection = useTableSelectionState({
        data: rows,
        idKey: 'id',
        selectedKeys,
        setSelectedKeys,
      });
      const selectionPlugin = useTableSelection(selection.selectionConfig);
      return <LinkedTable extraPlugins={{selectionPlugin}} />;
    }
    render(<SelectableLinkedTable />);
    const onLinkClick = spyOnLinkClicks();

    const checkbox = screen.getAllByRole('checkbox')[1];
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    // eslint-disable-next-line testing-library/no-node-access -- clicks the cell padding around the checkbox
    const selectionCell = checkbox.closest('td');
    if (selectionCell == null) {
      throw new Error('Checkbox is not in a cell');
    }
    fireEvent.click(selectionCell);
    expect(onLinkClick).not.toHaveBeenCalled();

    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();
  });

  it('throws in development when combined with row-click expansion', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function ExpandingLinkedTable(): React.JSX.Element {
      const expansion = useTableRowExpansionState<ThreadRow>({
        data: [{...rows[0], subRows: [rows[1]]}],
        getChildren: row => row.subRows,
        getRowKey: row => row.id,
      });
      const expansionPlugin = useTableRowExpansion<ThreadRow>({
        ...expansion.expansionConfig,
        hasRowClickExpansion: true,
      });
      const rowLink = useTableRowLink<ThreadRow>({
        columnKey: 'title',
        getRowHref: row => row.href,
      });
      return (
        <Table
          columns={columns}
          data={expansion.data}
          idKey="id"
          plugins={{expansionPlugin, rowLink}}
        />
      );
    }

    expect(() => render(<ExpandingLinkedTable />)).toThrow(
      'a row has two click actions',
    );
  });

  it('logs in production when combined with row-click expansion and keeps the first action', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const user = userEvent.setup();
    const onExpandedKeysChange = vi.fn();
    function ExpandingLinkedTable(): React.JSX.Element {
      const expansion = useTableRowExpansionState<ThreadRow>({
        data: [{...rows[0], subRows: [rows[1]]}],
        getChildren: row => row.subRows,
        getRowKey: row => row.id,
        onExpandedKeysChange,
      });
      const expansionPlugin = useTableRowExpansion<ThreadRow>({
        ...expansion.expansionConfig,
        hasRowClickExpansion: true,
      });
      const rowLink = useTableRowLink<ThreadRow>({
        columnKey: 'title',
        getRowHref: row => row.href,
      });
      return (
        <Table
          columns={columns}
          data={expansion.data}
          idKey="id"
          plugins={{expansionPlugin, rowLink}}
        />
      );
    }
    render(<ExpandingLinkedTable />);
    const onLinkClick = spyOnLinkClicks();

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('a row has two click actions'),
    );
    await user.click(screen.getByText('How do I bill?'));
    expect(onExpandedKeysChange).toHaveBeenCalledOnce();
    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('throws in development when the link column does not exist', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<LinkedTable columnKey="missing" />)).toThrow(
      'useTableRowLink: no column has the key "missing".',
    );
  });

  it('keeps forwarding after the table re-renders with the same rows', async () => {
    const user = userEvent.setup();
    const {rerender} = render(<LinkedTable />);
    rerender(<LinkedTable />);
    const onLinkClick = spyOnLinkClicks();

    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();
  });
});
