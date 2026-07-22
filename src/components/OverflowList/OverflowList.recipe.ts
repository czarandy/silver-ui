import {gapVariants, type SpacingToken} from 'internal/spacingTokens';
import {sva, type RecipeVariantProps} from 'styled-system/css';

// Both rows must share one gap so the hidden measurement row mirrors the
// visible row; the values come from the shared `gapVariants` map and the
// `satisfies` clause keeps the keys in lockstep with `SpacingToken`.
const gapSlotVariants = {
  0: {measure: gapVariants[0], root: gapVariants[0]},
  0.5: {measure: gapVariants[0.5], root: gapVariants[0.5]},
  1: {measure: gapVariants[1], root: gapVariants[1]},
  1.5: {measure: gapVariants[1.5], root: gapVariants[1.5]},
  2: {measure: gapVariants[2], root: gapVariants[2]},
  3: {measure: gapVariants[3], root: gapVariants[3]},
  4: {measure: gapVariants[4], root: gapVariants[4]},
  5: {measure: gapVariants[5], root: gapVariants[5]},
  6: {measure: gapVariants[6], root: gapVariants[6]},
  8: {measure: gapVariants[8], root: gapVariants[8]},
  10: {measure: gapVariants[10], root: gapVariants[10]},
} as const satisfies Record<SpacingToken, unknown>;

export const overflowListRecipe = sva({
  slots: ['root', 'measure', 'measureItem', 'measureIndicator'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      minW: 0,
    },
    measure: {
      position: 'absolute',
      visibility: 'hidden',
      h: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    },
    measureItem: {
      display: 'inline-flex',
    },
    measureIndicator: {
      display: 'inline-flex',
    },
  },
  variants: {
    fillsParent: {
      true: {
        root: {flex: '1 1 0'},
      },
      false: {},
    },
    gap: gapSlotVariants,
  },
  defaultVariants: {
    fillsParent: false,
    gap: 0,
  },
});

export type OverflowListVariants = RecipeVariantProps<
  typeof overflowListRecipe
>;
