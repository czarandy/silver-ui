import {describe, expect, expectTypeOf, it} from 'vitest';
import type {TableCellProps} from 'components/Table/TableCell';
import type {TableHeaderCellProps} from 'components/Table/TableHeaderCell';
import type {TableRowProps} from 'components/Table/TableRow';
import type {
  BodyCellRenderProps,
  BodyRowRenderProps,
  HeaderCellRenderProps,
  HeaderRowRenderProps,
  TableCellComponentProps,
  TableHeaderCellComponentProps,
  TableRowComponentProps,
} from 'components/Table/types';

describe('Table plugin prop contracts', () => {
  it('only exposes supported row props', () => {
    const supportsOnClick: 'onClick' extends keyof BodyRowRenderProps['htmlProps']
      ? true
      : false = false;

    expectTypeOf<BodyRowRenderProps['htmlProps']>().toEqualTypeOf<
      Omit<TableRowProps, 'children' | 'ref'>
    >();
    expectTypeOf<HeaderRowRenderProps['htmlProps']>().toEqualTypeOf<
      Omit<TableRowProps, 'children' | 'ref'>
    >();
    expectTypeOf<TableRowComponentProps>().toEqualTypeOf<TableRowProps>();
    expect(supportsOnClick).toBe(false);
  });

  it('only exposes supported body cell props', () => {
    const supportsOnClick: 'onClick' extends keyof BodyCellRenderProps['htmlProps']
      ? true
      : false = false;

    expectTypeOf<BodyCellRenderProps['htmlProps']>().toEqualTypeOf<
      Omit<TableCellProps, 'children' | 'ref'>
    >();
    expectTypeOf<TableCellComponentProps>().toEqualTypeOf<TableCellProps>();
    expect(supportsOnClick).toBe(false);
  });

  it('only exposes supported header cell props', () => {
    const supportsOnClick: 'onClick' extends keyof HeaderCellRenderProps['htmlProps']
      ? true
      : false = false;

    expectTypeOf<HeaderCellRenderProps['htmlProps']>().toEqualTypeOf<
      Omit<TableHeaderCellProps, 'children' | 'ref' | 'title'>
    >();
    expectTypeOf<TableHeaderCellComponentProps>().toEqualTypeOf<TableHeaderCellProps>();
    expect(supportsOnClick).toBe(false);
  });
});
