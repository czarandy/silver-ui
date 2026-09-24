/**
 * Spacing scale steps available as design tokens.
 *
 * Each value corresponds to a token in the Panda CSS spacing scale
 * (e.g. `spacing.2`, `spacing.4`).
 */
export type SpacingToken = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

/**
 * `gap` recipe variant map covering every `SpacingToken`. Share it between
 * recipes instead of enumerating the scale by hand (Panda statically resolves
 * imported constants): the `satisfies` clause fails to compile whenever a
 * token is added to or removed from `SpacingToken`, so the variant keys and
 * the prop type cannot drift apart.
 */
export const gapVariants = {
  0: {gap: '0'},
  0.5: {gap: '0.5'},
  1: {gap: '1'},
  1.5: {gap: '1.5'},
  2: {gap: '2'},
  3: {gap: '3'},
  4: {gap: '4'},
  5: {gap: '5'},
  6: {gap: '6'},
  8: {gap: '8'},
  10: {gap: '10'},
} as const satisfies Record<SpacingToken, {gap: string}>;

/**
 * `padding` recipe variant map covering every `SpacingToken`.
 *
 * Keep token-backed layout primitives on the same spacing scale by sharing
 * this map instead of repeating the variants in each recipe.
 */
export const paddingVariants = {
  0: {p: '0'},
  0.5: {p: '0.5'},
  1: {p: '1'},
  1.5: {p: '1.5'},
  2: {p: '2'},
  3: {p: '3'},
  4: {p: '4'},
  5: {p: '5'},
  6: {p: '6'},
  8: {p: '8'},
  10: {p: '10'},
} as const satisfies Record<SpacingToken, {p: string}>;

/**
 * Per-edge logical padding recipe variant maps covering every `SpacingToken`.
 *
 * These back the axis (`paddingInline`/`paddingBlock`) and per-edge padding
 * props. Components resolve the winning value for each edge with
 * `resolvePadding` and apply only these longhands, so a shorthand never has
 * to layer over a longhand in the atomic stylesheet.
 */
export const paddingBlockStartVariants = {
  0: {paddingBlockStart: '0'},
  0.5: {paddingBlockStart: '0.5'},
  1: {paddingBlockStart: '1'},
  1.5: {paddingBlockStart: '1.5'},
  2: {paddingBlockStart: '2'},
  3: {paddingBlockStart: '3'},
  4: {paddingBlockStart: '4'},
  5: {paddingBlockStart: '5'},
  6: {paddingBlockStart: '6'},
  8: {paddingBlockStart: '8'},
  10: {paddingBlockStart: '10'},
} as const satisfies Record<SpacingToken, {paddingBlockStart: string}>;

export const paddingBlockEndVariants = {
  0: {paddingBlockEnd: '0'},
  0.5: {paddingBlockEnd: '0.5'},
  1: {paddingBlockEnd: '1'},
  1.5: {paddingBlockEnd: '1.5'},
  2: {paddingBlockEnd: '2'},
  3: {paddingBlockEnd: '3'},
  4: {paddingBlockEnd: '4'},
  5: {paddingBlockEnd: '5'},
  6: {paddingBlockEnd: '6'},
  8: {paddingBlockEnd: '8'},
  10: {paddingBlockEnd: '10'},
} as const satisfies Record<SpacingToken, {paddingBlockEnd: string}>;

export const paddingInlineStartVariants = {
  0: {paddingInlineStart: '0'},
  0.5: {paddingInlineStart: '0.5'},
  1: {paddingInlineStart: '1'},
  1.5: {paddingInlineStart: '1.5'},
  2: {paddingInlineStart: '2'},
  3: {paddingInlineStart: '3'},
  4: {paddingInlineStart: '4'},
  5: {paddingInlineStart: '5'},
  6: {paddingInlineStart: '6'},
  8: {paddingInlineStart: '8'},
  10: {paddingInlineStart: '10'},
} as const satisfies Record<SpacingToken, {paddingInlineStart: string}>;

export const paddingInlineEndVariants = {
  0: {paddingInlineEnd: '0'},
  0.5: {paddingInlineEnd: '0.5'},
  1: {paddingInlineEnd: '1'},
  1.5: {paddingInlineEnd: '1.5'},
  2: {paddingInlineEnd: '2'},
  3: {paddingInlineEnd: '3'},
  4: {paddingInlineEnd: '4'},
  5: {paddingInlineEnd: '5'},
  6: {paddingInlineEnd: '6'},
  8: {paddingInlineEnd: '8'},
  10: {paddingInlineEnd: '10'},
} as const satisfies Record<SpacingToken, {paddingInlineEnd: string}>;

/**
 * Padding props shared by token-backed layout primitives. Resolution is
 * most-specific-wins: an edge prop beats its axis prop, which beats the
 * uniform `padding`.
 */
export interface PaddingProps {
  /**
   * Inner padding step applied to every edge.
   */
  padding?: SpacingToken;
  /**
   * Padding step for both block edges (top and bottom in horizontal writing
   * modes). Overrides `padding` on those edges.
   */
  paddingBlock?: SpacingToken;
  /**
   * Padding step for the block-end edge. Overrides `paddingBlock` and
   * `padding`.
   */
  paddingBlockEnd?: SpacingToken;
  /**
   * Padding step for the block-start edge. Overrides `paddingBlock` and
   * `padding`.
   */
  paddingBlockStart?: SpacingToken;
  /**
   * Padding step for both inline edges (left and right in horizontal writing
   * modes). Overrides `padding` on those edges.
   */
  paddingInline?: SpacingToken;
  /**
   * Padding step for the inline-end edge. Overrides `paddingInline` and
   * `padding`.
   */
  paddingInlineEnd?: SpacingToken;
  /**
   * Padding step for the inline-start edge. Overrides `paddingInline` and
   * `padding`.
   */
  paddingInlineStart?: SpacingToken;
}

/**
 * Recipe variant selections produced by `resolvePadding`. Either `padding`
 * alone is set, or only the per-edge longhands are — never both.
 */
export interface ResolvedPaddingVariants {
  padding?: SpacingToken;
  paddingBlockEnd?: SpacingToken;
  paddingBlockStart?: SpacingToken;
  paddingInlineEnd?: SpacingToken;
  paddingInlineStart?: SpacingToken;
}

/**
 * Resolves `PaddingProps` into recipe variant selections, picking the winning
 * token for each edge in one place (edge > axis > uniform).
 *
 * When only the uniform `padding` is set it is passed through as the single
 * `p` shorthand. As soon as any axis or edge prop is set, every edge is
 * resolved to a longhand and the shorthand is dropped, so the output never
 * depends on the atomic stylesheet's shorthand/longhand ordering.
 */
export function resolvePadding({
  padding,
  paddingBlock,
  paddingBlockEnd,
  paddingBlockStart,
  paddingInline,
  paddingInlineEnd,
  paddingInlineStart,
}: PaddingProps): ResolvedPaddingVariants {
  if (
    paddingBlock == null &&
    paddingBlockEnd == null &&
    paddingBlockStart == null &&
    paddingInline == null &&
    paddingInlineEnd == null &&
    paddingInlineStart == null
  ) {
    return {padding};
  }
  const block = paddingBlock ?? padding;
  const inline = paddingInline ?? padding;
  return {
    paddingBlockEnd: paddingBlockEnd ?? block,
    paddingBlockStart: paddingBlockStart ?? block,
    paddingInlineEnd: paddingInlineEnd ?? inline,
    paddingInlineStart: paddingInlineStart ?? inline,
  };
}
