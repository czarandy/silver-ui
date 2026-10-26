import {render, screen} from '@testing-library/react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {Table} from 'components/Table/Table';
import {useTableRowLink} from 'components/Table/plugins/rowLink';
import type {TableColumn} from 'components/Table/types';

// Real-browser checks: jsdom neither navigates on a forwarded anchor click nor
// resolves the row cursor styling.

interface Row extends Record<string, unknown> {
  href: string | null;
  id: string;
  question: string;
  title: string;
}

const columns: TableColumn<Row>[] = [
  {header: 'Title', key: 'title'},
  {header: 'Question', key: 'question'},
];

const rows: Row[] = [
  {href: '#thread-1', id: '1', question: 'How do I bill?', title: 'Billing'},
  {href: null, id: '2', question: 'Who am I?', title: 'Unlinked'},
];

function LinkedTable({
  data = rows,
  textOverflow,
}: {
  data?: Row[];
  textOverflow?: 'truncate' | 'wrap';
}): React.JSX.Element {
  const rowLink = useTableRowLink<Row>({
    columnKey: 'title',
    getRowHref: row => row.href,
  });
  return (
    <Table
      columns={columns}
      data={data}
      idKey="id"
      plugins={{rowLink}}
      textOverflow={textOverflow}
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

// Real clicks and the header text's post-layout truncation measurement reach
// React outside `act`, as they do in an app; without this, each such update
// logs an act warning.
beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.history.replaceState(null, '', window.location.pathname);
});

describe('useTableRowLink', () => {
  it('navigates when the row surface is clicked', async () => {
    render(<LinkedTable />);

    await userEvent.click(await screen.findByText('How do I bill?'));
    expect(window.location.hash).toBe('#thread-1');
  });

  it('opens a new tab, not the current one, for ctrl- and middle-clicks', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(<LinkedTable />);
    const question = await screen.findByText('How do I bill?');

    await userEvent.click(question, {modifiers: ['ControlOrMeta']});
    await userEvent.click(question, {button: 'middle'});
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenCalledWith(
      expect.stringMatching(/#thread-1$/),
      '_blank',
      'noopener',
    );
    expect(window.location.hash).toBe('');
  });

  it('shows a pointer only on linked rows', async () => {
    render(<LinkedTable />);
    await screen.findByText('How do I bill?');

    expect(getComputedStyle(getRow('How do I bill?')).cursor).toBe('pointer');
    expect(getComputedStyle(getRow('Who am I?')).cursor).toBe('auto');
  });

  it('renders the link without link styling', async () => {
    render(<LinkedTable />);

    const link = await screen.findByRole('link');
    // eslint-disable-next-line testing-library/no-node-access -- compares the link with its cell
    const cell = link.closest('td');
    if (cell == null) {
      throw new Error('The link is not in a cell');
    }
    await userEvent.hover(link);
    expect(getComputedStyle(link).color).toBe(getComputedStyle(cell).color);
    expect(getComputedStyle(link).textDecorationLine).toBe('none');
  });

  it('truncates the link text with an ellipsis inside its cell', async () => {
    render(
      <div style={{width: 320}}>
        <LinkedTable
          data={[
            {
              ...rows[0],
              title: 'Billing for a very long thread title that cannot fit',
            },
          ]}
          textOverflow="truncate"
        />
      </div>,
    );

    const link = await screen.findByRole('link');
    // eslint-disable-next-line testing-library/no-node-access -- measures the link against its cell
    const cell = link.closest('td');
    // eslint-disable-next-line testing-library/no-node-access -- the truncating text element
    const text = link.firstElementChild;
    if (cell == null || !(text instanceof HTMLElement)) {
      throw new Error('Missing link cell or text');
    }
    expect(link.getBoundingClientRect().right).toBeLessThanOrEqual(
      cell.getBoundingClientRect().right,
    );
    expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  });
});
