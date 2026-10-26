import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef, MouseEvent as ReactMouseEvent} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {LinkProvider} from 'components/Link';
import {Table} from 'components/Table/Table';
import {TableBody} from 'components/Table/TableBody';
import {TableCell} from 'components/Table/TableCell';
import {TableHeader} from 'components/Table/TableHeader';
import {TableRow} from 'components/Table/TableRow';
import {TableRowLink} from 'components/Table/TableRowLink';
import type {TableColumn} from 'components/Table/types';

interface ThreadRow extends Record<string, unknown> {
  href: string | null;
  id: string;
  question: string;
  title: string;
}

const rows: ThreadRow[] = [
  {href: '/threads/1', id: '1', question: 'How do I bill?', title: 'Billing'},
  {href: null, id: '2', question: 'Who am I?', title: 'Unlinked'},
];

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

function renderThreads(
  onLinkClick: (event: ReactMouseEvent<HTMLElement>) => void = event => {
    event.preventDefault();
  },
) {
  const columns: TableColumn<ThreadRow>[] = [
    {
      header: 'Title',
      key: 'title',
      renderCell: row =>
        row.href == null ? (
          row.title
        ) : (
          <TableRowLink href={row.href} onClick={onLinkClick}>
            {row.title}
          </TableRowLink>
        ),
    },
    {header: 'Question', key: 'question'},
  ];
  return render(
    <LinkProvider component={RouterLink}>
      <Table columns={columns} data={rows} idKey="id" />
    </LinkProvider>,
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('TableRowLink', () => {
  it('renders through LinkProvider and marks only linked rows clickable', () => {
    renderThreads();

    const link = screen.getByRole('link', {name: 'Billing'});
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/threads/1');
    expect(getRow('Billing')).toHaveAttribute('data-has-row-link');
    expect(getRow('Unlinked')).not.toHaveAttribute('data-has-row-link');
  });

  it('forwards a click anywhere on the row to the link exactly once', async () => {
    const user = userEvent.setup();
    let clickedControl: EventTarget | null = null;
    const onLinkClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
      clickedControl = event.currentTarget;
    });
    renderThreads(onLinkClick);

    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).toHaveBeenCalledOnce();
    expect(clickedControl).toBe(screen.getByRole('link', {name: 'Billing'}));

    await user.click(screen.getByRole('link', {name: 'Billing'}));
    expect(onLinkClick).toHaveBeenCalledTimes(2);

    await user.click(screen.getByText('Who am I?'));
    expect(onLinkClick).toHaveBeenCalledTimes(2);
  });

  it('preserves modifier keys and forwards middle-click', () => {
    const onLinkClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    renderThreads(onLinkClick);
    const link = screen.getByRole('link', {name: 'Billing'});
    const linkDispatch = vi.spyOn(link, 'dispatchEvent');

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
    expect(linkDispatch).toHaveBeenCalledWith(
      expect.objectContaining({button: 1, type: 'auxclick'}),
    );
  });

  it('leaves nested controls and text selection independent of the row', async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    const onDelete = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TableRowLink href="/threads/1" onClick={onLinkClick}>
                Billing
              </TableRowLink>
            </TableCell>
            <TableCell>
              <span data-testid="question">How do I bill?</span>
              <button onClick={onDelete} type="button">
                Delete
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onLinkClick).not.toHaveBeenCalled();

    const question = screen.getByTestId('question');
    vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: question,
      focusNode: question,
      isCollapsed: false,
      toString: () => 'How do I bill?',
    } as unknown as Selection);
    fireEvent.click(question);
    expect(onLinkClick).not.toHaveBeenCalled();
  });

  it('leaves the row unclickable while the link is disabled or removed', async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn();
    const renderRow = (link: React.ReactNode) => (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>{link}</TableCell>
            <TableCell>How do I bill?</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const {rerender} = render(
      renderRow(
        <TableRowLink href="/threads/1" isDisabled onClick={onLinkClick}>
          Billing
        </TableRowLink>,
      ),
    );

    expect(getRow('How do I bill?')).not.toHaveAttribute('data-has-row-link');
    await user.click(screen.getByText('How do I bill?'));
    expect(onLinkClick).not.toHaveBeenCalled();

    rerender(
      renderRow(
        <TableRowLink href="/threads/1" onClick={onLinkClick}>
          Billing
        </TableRowLink>,
      ),
    );
    expect(getRow('How do I bill?')).toHaveAttribute('data-has-row-link');

    rerender(renderRow('Billing'));
    expect(getRow('How do I bill?')).not.toHaveAttribute('data-has-row-link');
  });

  it('throws in development when a row has more than one link', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>
                <TableRowLink href="/a">A</TableRowLink>
              </TableCell>
              <TableCell>
                <TableRowLink href="/b">B</TableRowLink>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>,
      ),
    ).toThrow('render at most one TableRowLink per row');
  });

  it('logs in production when a row has more than one link and keeps the first', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const user = userEvent.setup();
    const onFirstClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    const onSecondClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TableRowLink href="/a" onClick={onFirstClick}>
                A
              </TableRowLink>
            </TableCell>
            <TableCell>
              <TableRowLink href="/b" onClick={onSecondClick}>
                B
              </TableRowLink>
            </TableCell>
            <TableCell>Surface</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('render at most one TableRowLink per row'),
    );
    await user.click(screen.getByText('Surface'));
    expect(onFirstClick).toHaveBeenCalledOnce();
    expect(onSecondClick).not.toHaveBeenCalled();
  });

  it('throws outside a body row', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TableRowLink href="/a">Orphan</TableRowLink>)).toThrow(
      'TableRowLink must be rendered inside a TableRow',
    );
    expect(() =>
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>
                <TableRowLink href="/a">Header</TableRowLink>
              </TableCell>
            </TableRow>
          </TableHeader>
        </Table>,
      ),
    ).toThrow('TableRowLink must be rendered inside a TableRow');
  });
});
