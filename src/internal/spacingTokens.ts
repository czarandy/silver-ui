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
