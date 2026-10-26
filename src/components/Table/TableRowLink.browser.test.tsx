import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';
import {Table} from 'components/Table/Table';
import {TableBody} from 'components/Table/TableBody';
import {TableCell} from 'components/Table/TableCell';
import {TableRow} from 'components/Table/TableRow';
import {TableRowLink} from 'components/Table/TableRowLink';

// Real-browser checks: jsdom neither navigates on a forwarded anchor click nor
// resolves the attribute-driven cursor styling.

function ThreadsTable(): React.JSX.Element {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>
            <TableRowLink href="#thread-1">Billing</TableRowLink>
          </TableCell>
          <TableCell>How do I bill?</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Unlinked</TableCell>
          <TableCell>Who am I?</TableCell>
        </TableRow>
      </TableBody>
    </Table>
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
  window.history.replaceState(null, '', window.location.pathname);
});

describe('TableRowLink', () => {
  it('navigates when the row surface is clicked', async () => {
    render(<ThreadsTable />);

    await userEvent.click(screen.getByText('How do I bill?'));
    expect(window.location.hash).toBe('#thread-1');
  });

  it('shows a pointer only on rows that contain a link', () => {
    render(<ThreadsTable />);

    expect(getComputedStyle(getRow('How do I bill?')).cursor).toBe('pointer');
    expect(getComputedStyle(getRow('Who am I?')).cursor).toBe('auto');
  });
});
