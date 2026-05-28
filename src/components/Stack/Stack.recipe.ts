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
