import {describe, expect, it} from 'vitest';
import {resolvePadding} from 'internal/spacingTokens';

describe('resolvePadding', () => {
  it('returns no padding when nothing is set', () => {
    expect(resolvePadding({})).toEqual({padding: undefined});
  });

  it('passes uniform padding through as the shorthand', () => {
    expect(resolvePadding({padding: 4})).toEqual({padding: 4});
  });

  it('expands axis padding onto both edges of the axis', () => {
    expect(resolvePadding({paddingBlock: 2, paddingInline: 6})).toEqual({
      paddingBlockEnd: 2,
      paddingBlockStart: 2,
      paddingInlineEnd: 6,
      paddingInlineStart: 6,
    });
  });

  it('lets axis padding override uniform padding', () => {
    expect(resolvePadding({padding: 1, paddingInline: 5})).toEqual({
      paddingBlockEnd: 1,
      paddingBlockStart: 1,
      paddingInlineEnd: 5,
      paddingInlineStart: 5,
    });
  });

  it('lets edge padding override axis and uniform padding', () => {
    expect(
      resolvePadding({
        padding: 1,
        paddingBlock: 3,
        paddingBlockEnd: 10,
        paddingInline: 2,
        paddingInlineStart: 8,
      }),
    ).toEqual({
      paddingBlockEnd: 10,
      paddingBlockStart: 3,
      paddingInlineEnd: 2,
      paddingInlineStart: 8,
    });
  });

  it('treats 0 as a set value rather than falling through', () => {
    expect(resolvePadding({padding: 4, paddingBlockStart: 0})).toEqual({
      paddingBlockEnd: 4,
      paddingBlockStart: 0,
      paddingInlineEnd: 4,
      paddingInlineStart: 4,
    });
  });

  it('leaves unset edges undefined without uniform padding', () => {
    expect(resolvePadding({paddingInlineEnd: 6})).toEqual({
      paddingBlockEnd: undefined,
      paddingBlockStart: undefined,
      paddingInlineEnd: 6,
      paddingInlineStart: undefined,
    });
  });
});
