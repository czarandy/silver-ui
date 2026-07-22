import {gapVariants, type SpacingToken} from 'internal/spacingTokens';
import {sva, type RecipeVariantProps} from 'styled-system/css';

// The message gap applies to the `inner` slot; the values come from the
// shared `gapVariants` map and the `satisfies` clause keeps the keys in
// lockstep with `SpacingToken`.
const gapSlotVariants = {
  0: {inner: gapVariants[0]},
  0.5: {inner: gapVariants[0.5]},
  1: {inner: gapVariants[1]},
  1.5: {inner: gapVariants[1.5]},
  2: {inner: gapVariants[2]},
  3: {inner: gapVariants[3]},
  4: {inner: gapVariants[4]},
  5: {inner: gapVariants[5]},
  6: {inner: gapVariants[6]},
  8: {inner: gapVariants[8]},
  10: {inner: gapVariants[10]},
} as const satisfies Record<SpacingToken, unknown>;

export const chatMessageListRecipe = sva({
  slots: ['root', 'inner', 'spacer', 'loadingTop', 'emptyState'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minH: 0,
    },
    inner: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minH: 0,
    },
    spacer: {
      flex: 1,
      minH: 0,
    },
    loadingTop: {
      display: 'flex',
      justifyContent: 'center',
      paddingBlock: '3',
    },
    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minH: 0,
    },
  },
  variants: {
    density: {
      compact: {
        inner: {gap: '2', paddingBlock: '2', paddingInline: '3'},
      },
      balanced: {
        inner: {gap: '4', paddingBlock: '4', paddingInline: '4'},
      },
      spacious: {
        inner: {gap: '6', paddingBlock: '6', paddingInline: '6'},
      },
    },
    gap: gapSlotVariants,
  },
  defaultVariants: {
    density: 'balanced',
  },
});

export type ChatMessageListVariants = RecipeVariantProps<
  typeof chatMessageListRecipe
>;
