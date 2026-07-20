import {sva, type RecipeVariantProps} from 'styled-system/css';

export const overflowListRecipe = sva({
  slots: ['root', 'measure', 'measureIndicator'],
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
    gap: {
      0: {root: {gap: '0'}, measure: {gap: '0'}},
      0.5: {root: {gap: '0.5'}, measure: {gap: '0.5'}},
      1: {root: {gap: '1'}, measure: {gap: '1'}},
      1.5: {root: {gap: '1.5'}, measure: {gap: '1.5'}},
      2: {root: {gap: '2'}, measure: {gap: '2'}},
      3: {root: {gap: '3'}, measure: {gap: '3'}},
      4: {root: {gap: '4'}, measure: {gap: '4'}},
      5: {root: {gap: '5'}, measure: {gap: '5'}},
      6: {root: {gap: '6'}, measure: {gap: '6'}},
      8: {root: {gap: '8'}, measure: {gap: '8'}},
      10: {root: {gap: '10'}, measure: {gap: '10'}},
    },
  },
  defaultVariants: {
    fillsParent: false,
    gap: 0,
  },
});

export type OverflowListVariants = RecipeVariantProps<
  typeof overflowListRecipe
>;
