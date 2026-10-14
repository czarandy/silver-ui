import {fireEvent, render, renderHook, screen} from '@testing-library/react';
import type {RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {useTableRowExpansion} from 'components/Table/plugins/expansion/useTableRowExpansion';
import {useTableSelection} from 'components/Table/plugins/selection/useTableSelection';
import type {BodyRowRenderProps} from 'components/Table/types';

describe('table plugin row refs', () => {
  it('composes selection and expansion with a cleanup-returning ref in either order', () => {
    const item = {id: 'row'};
    const onToggleRow = vi.fn();
    const {result} = renderHook(() => ({
      selection: useTableSelection({
        getIsAllSelected: () => true,
        getIsItemSelected: () => true,
        onSelectAll: vi.fn(),
        onSelectItem: vi.fn(),
      }),
      expansion: useTableRowExpansion({
        expandedKeys: new Set<string>(),
        getDepth: () => 0,
        getIsRowExpandable: () => true,
        getRowKey: (row: typeof item) => row.id,
        hasRowClickExpansion: true,
        onToggleRow,
      }),
    }));

    for (const plugins of [
      [result.current.selection, result.current.expansion],
      [result.current.expansion, result.current.selection],
    ]) {
      const cleanup = vi.fn();
      const ref = vi.fn<RefCallback<HTMLTableRowElement>>(() => cleanup);
      let props: BodyRowRenderProps = {
        children: <td>Row</td>,
        htmlProps: {},
        ref,
      };
      for (const plugin of plugins) {
        props = plugin.transformBodyRow?.(props, item, 0) ?? props;
      }
      const {unmount} = render(
        <table>
          <tbody>
            <tr ref={props.ref}>{props.children}</tr>
          </tbody>
        </table>,
      );
      const row = screen.getByRole('row');
      expect(row).toHaveAttribute('aria-selected', 'true');
      expect(ref).toHaveBeenCalledExactlyOnceWith(row);
      onToggleRow.mockClear();
      fireEvent.click(row);
      expect(onToggleRow).toHaveBeenCalledExactlyOnceWith('row');

      unmount();
      expect(cleanup).toHaveBeenCalledOnce();
      expect(ref).toHaveBeenCalledOnce();
      fireEvent.click(row);
      expect(onToggleRow).toHaveBeenCalledOnce();
    }
  });
});
