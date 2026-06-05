import {cva, type RecipeVariantProps} from 'styled-system/css';

export const stackRecipe = cva({
  base: {
    display: 'flex',
    minW: 0,
  },
  variants: {
    direction: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
    gap: {
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
    },
    wrap: {
      nowrap: {
        flexWrap: 'nowrap',
      },
      wrap: {
        flexWrap: 'wrap',
      },
      'wrap-reverse': {
        flexWrap: 'wrap-reverse',
      },
    },
  },
  defaultVariants: {
    direction: 'vertical',
    wrap: 'nowrap',
  },
});

export type StackVariants = RecipeVariantProps<typeof stackRecipe>;
