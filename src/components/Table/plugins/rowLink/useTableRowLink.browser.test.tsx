import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
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

function LinkedTable(): React.JSX.Element {
  const rowLink = useTableRowLink<Row>({
    columnKey: 'title',
    getRowHref: row => row.href,
  });
  return <Table columns={columns} data={rows} idKey="id" plugins={{rowLink}} />;
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
  window.history.replaceState(null, '', window.location.pathname);
});

describe('useTableRowLink', () => {
  it('navigates when the row surface is clicked', async () => {
    render(<LinkedTable />);

    // findBy waits out the header text's post-layout truncation update.
    await userEvent.click(await screen.findByText('How do I bill?'));
    expect(window.location.hash).toBe('#thread-1');
  });

  it('shows a pointer only on linked rows', () => {
    render(<LinkedTable />);

    expect(getComputedStyle(getRow('How do I bill?')).cursor).toBe('pointer');
    expect(getComputedStyle(getRow('Who am I?')).cursor).toBe('auto');
  });
});
