import {cva, type RecipeVariantProps} from 'styled-system/css';

export const topNavRecipe = cva({
  base: {
    alignItems: 'center',
    w: '100%',
    p: '2',
    boxSizing: 'border-box',
  },
  variants: {
    layout: {
      flex: {
        display: 'flex',
      },
      grid: {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
      },
      mobile: {
        display: 'flex',
      },
    },
  },
  defaultVariants: {
    layout: 'flex',
  },
});

export type TopNavVariants = RecipeVariantProps<typeof topNavRecipe>;
