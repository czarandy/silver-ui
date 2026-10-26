import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useCallback,
  useMemo,
  useState,
  type ComponentPropsWithRef,
} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ClickableContainer} from 'components/Clickable/ClickableContainer';
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

const NO_KEYS: string[] = [];

function LinkedTable({
  columns: tableColumns = columns,
  columnKey = 'title',
  extraPlugins = NO_PLUGINS,
  ignoredColumnKeys = NO_KEYS,
}: {
  columnKey?: string;
  columns?: TableColumn<ThreadRow>[];
  extraPlugins?: Record<string, TablePlugin<ThreadRow>>;
  ignoredColumnKeys?: string[];
}): React.JSX.Element {
  const rowLink = useTableRowLink<ThreadRow>({
    columnKey,
    getRowHref: row => row.href,
    ignoredColumnKeys,
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

  it('throws in development when combined with row-click expansion, even with no linked row', () => {
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
        getRowHref: () => null,
      });
      return (
        <Table
          columns={columns}
          data={expansion.data}
          idKey="id"
          plugins={{expansion: expansionPlugin, rowLink}}
        />
      );
    }

    expect(() => render(<ExpandingLinkedTable />)).toThrow(
      'rows have more than one click action',
    );
  });

  it('logs in production when combined with row-click expansion and keeps the row link', async () => {
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
          plugins={{expansion: expansionPlugin, rowLink}}
        />
      );
    }
    render(<ExpandingLinkedTable />);
    const onLinkClick = spyOnLinkClicks();

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('rows have more than one click action'),
    );
    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();
    expect(onExpandedKeysChange).not.toHaveBeenCalled();
  });

  it('keeps the expansion chevron outside the link on child rows', () => {
    function ExpandedLinkedTable(): React.JSX.Element {
      const expansion = useTableRowExpansionState<ThreadRow>({
        data: [
          {
            ...rows[0],
            subRows: [
              {
                href: '/threads/3',
                id: '3',
                question: 'Nested?',
                subRows: [rows[1]],
                title: 'Child',
              },
            ],
          },
        ],
        defaultExpandedKeys: ['1'],
        getChildren: row => row.subRows,
        getRowKey: row => row.id,
      });
      const expansionPlugin = useTableRowExpansion<ThreadRow>(
        expansion.expansionConfig,
      );
      const rowLink = useTableRowLink<ThreadRow>({
        columnKey: 'title',
        getRowHref: row => row.href,
      });
      return (
        <Table
          columns={columns}
          data={expansion.data}
          idKey="id"
          plugins={{expansion: expansionPlugin, rowLink}}
        />
      );
    }
    render(<ExpandedLinkedTable />);

    const childLink = screen.getByRole('link', {name: 'Child'});
    expect(
      within(childLink).queryByRole('button', {hidden: true}),
    ).not.toBeInTheDocument();
    expect(
      within(getRow('Child')).getByRole('button', {name: 'Expand row'}),
    ).toBeInTheDocument();
  });

  it('leaves rows unclickable while the link column is absent', () => {
    const {rerender} = render(<LinkedTable columnKey="missing" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(getRow('Billing')).not.toHaveClass('silver-cursor_pointer');

    rerender(<LinkedTable columns={[columns[1]]} />);
    expect(getRow('How do I bill?')).not.toHaveClass('silver-cursor_pointer');

    rerender(<LinkedTable />);
    expect(getRow('Billing')).toHaveClass('silver-cursor_pointer');
  });

  it('renders inferred columns without data', () => {
    function InferredTable(): React.JSX.Element {
      const rowLink = useTableRowLink<ThreadRow>({
        columnKey: 'title',
        getRowHref: row => row.href,
      });
      return <Table data={[]} plugins={{rowLink}} />;
    }

    render(<InferredTable />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('picks up a new getRowHref when the plugins are memoized', async () => {
    const user = userEvent.setup();
    function MemoizedTable(): React.JSX.Element {
      const [prefix, setPrefix] = useState('/a');
      const getRowHref = useCallback(
        (row: ThreadRow) => (row.href == null ? null : `${prefix}/${row.id}`),
        [prefix],
      );
      const rowLink = useTableRowLink<ThreadRow>({
        columnKey: 'title',
        getRowHref,
      });
      const plugins = useMemo(() => ({rowLink}), [rowLink]);
      return (
        <>
          <button onClick={() => setPrefix('/b')} type="button">
            Switch
          </button>
          <Table columns={columns} data={rows} idKey="id" plugins={plugins} />
        </>
      );
    }
    render(<MemoizedTable />);
    expect(screen.getByRole('link', {name: 'Billing'})).toHaveAttribute(
      'href',
      '/a/1',
    );

    await user.click(screen.getByRole('button', {name: 'Switch'}));
    expect(screen.getByRole('link', {name: 'Billing'})).toHaveAttribute(
      'href',
      '/b/1',
    );
  });

  it('lets React handlers inside the row run without activating an enclosing surface', async () => {
    const user = userEvent.setup();
    const onQuestionClick = vi.fn();
    const onContainerClick = vi.fn();
    render(
      <ClickableContainer label="Card" onClick={onContainerClick}>
        <LinkedTable
          columns={[
            columns[0],
            {
              header: 'Question',
              key: 'question',
              renderCell: row => (
                // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- observes a React handler inside the row
                <span onClick={onQuestionClick}>{row.question}</span>
              ),
            },
          ]}
        />
      </ClickableContainer>,
    );
    const onLinkClick = spyOnLinkClicks();

    await user.click(screen.getByText('How do I bill?'));
    expect(onQuestionClick).toHaveBeenCalledOnce();
    expect(onLinkClick).toHaveBeenCalledOnce();
    expect(onContainerClick).not.toHaveBeenCalled();
  });

  it('leaves ignored columns, including their padding, to their own content', async () => {
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
              <button onClick={onArchive} type="button">
                Archive
              </button>
            ),
          },
        ]}
        ignoredColumnKeys={['actions']}
      />,
    );
    const onLinkClick = spyOnLinkClicks();

    const archive = screen.getAllByRole('button', {name: 'Archive'})[0];
    await user.click(archive);
    expect(onArchive).toHaveBeenCalledOnce();
    // eslint-disable-next-line testing-library/no-node-access -- clicks the cell padding around the button
    const actionsCell = archive.closest('td');
    if (actionsCell == null) {
      throw new Error('Archive is not in a cell');
    }
    fireEvent.click(actionsCell);
    expect(onLinkClick).not.toHaveBeenCalled();

    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();
  });

  it('opens a new tab for modifier and middle clicks on a plain link', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<LinkedTable />);

    fireEvent.click(screen.getByText('How do I bill?'), {ctrlKey: true});
    fireEvent(
      screen.getByText('How do I bill?'),
      new MouseEvent('auxclick', {bubbles: true, button: 1}),
    );
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/\/threads\/1$/),
      '_blank',
      'noopener',
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
