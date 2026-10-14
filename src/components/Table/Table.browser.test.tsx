import {render, screen, within} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Table} from 'components/Table/Table';
import {
  useTableSortable,
  type TableSortState,
} from 'components/Table/plugins/sortable';
import type {TableColumn, TableColumnAlign} from 'components/Table/types';

type SortState = 'unsorted' | 'ascending' | 'descending' | 'multi-sort';

interface Row extends Record<string, unknown> {
  amount: number;
  name: string;
}

function SortableTable({
  align,
  direction,
  state,
}: {
  align: TableColumnAlign | undefined;
  direction: 'ltr' | 'rtl';
  state: SortState;
}): React.JSX.Element {
  const columns: TableColumn<Row>[] = [
    {align, header: 'Amount', key: 'amount', sortable: true},
    {header: 'Name', key: 'name', sortable: true},
  ];
  const sort: TableSortState =
    state === 'unsorted'
      ? []
      : state === 'multi-sort'
        ? [
            {direction: 'ascending', sortKey: 'amount'},
            {direction: 'descending', sortKey: 'name'},
          ]
        : [{direction: state, sortKey: 'amount'}];
  const sortPlugin = useTableSortable<Row>({
    isMultiSortEnabled: true,
    onSortChange: () => {},
    sort,
  });

  return (
    <div dir={direction} style={{width: 480}}>
      <Table
        columns={columns}
        data={[{amount: 123, name: 'Ada'}]}
        plugins={{sortPlugin}}
      />
    </div>
  );
}

describe.each(['ltr', 'rtl'] as const)(
  'sortable header alignment in %s',
  direction => {
    describe.each([undefined, 'start', 'center', 'end'] as const)(
      'align=%s',
      align => {
        it.each(['unsorted', 'ascending', 'descending', 'multi-sort'] as const)(
          'aligns the label, icon and rank as a group when %s',
          state => {
            render(
              <SortableTable
                align={align}
                direction={direction}
                state={state}
              />,
            );

            const button = screen.getByRole('button', {
              name: /^Sort by Amount/,
            });
            const label = within(button)
              .getByText('Amount')
              .getBoundingClientRect();
            const icon = within(button).getByTestId('table-sort-icon-amount');
            const iconBox = icon.getBoundingClientRect();
            const boxes = [label, iconBox];
            if (state === 'multi-sort') {
              boxes.push(within(button).getByText('1').getBoundingClientRect());
            }
            const groupLeft = Math.min(...boxes.map(box => box.left));
            const groupRight = Math.max(...boxes.map(box => box.right));
            const buttonBox = button.getBoundingClientRect();

            // Leave enough free space for a misplaced group to be detectable.
            expect(buttonBox.width - (groupRight - groupLeft)).toBeGreaterThan(
              100,
            );
            if (align === 'center') {
              expect(
                Math.abs(
                  (groupLeft + groupRight) / 2 -
                    (buttonBox.left + buttonBox.right) / 2,
                ),
              ).toBeLessThan(1);
            } else {
              const isLeftAligned =
                (align !== 'end' && direction === 'ltr') ||
                (align === 'end' && direction === 'rtl');
              expect(
                Math.abs(
                  isLeftAligned
                    ? groupLeft - buttonBox.left
                    : groupRight - buttonBox.right,
                ),
              ).toBeLessThan(1);
            }

            // The icon follows the label in the logical inline direction.
            if (direction === 'ltr') {
              expect(iconBox.left).toBeGreaterThan(label.right);
            } else {
              expect(iconBox.right).toBeLessThan(label.left);
            }
            expect(icon).toHaveAttribute(
              'data-table-sort-icon-state',
              state === 'unsorted' ? 'inactive' : 'active',
            );
          },
        );
      },
    );
  },
);
