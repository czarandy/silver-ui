import {cva, type RecipeVariantProps} from 'styled-system/css';

export const layoutRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    minW: 0,
  },
  variants: {
    height: {
      fill: {
        h: '100%',
        minH: 0,
      },
      auto: {
        minH: '100%',
      },
    },
  },
  defaultVariants: {
    height: 'fill',
  },
});

export const layoutMiddleRecipe = cva({
  base: {
    display: 'flex',
    flex: 1,
    minH: 0,
    minW: 0,
  },
});

export type LayoutVariants = RecipeVariantProps<typeof layoutRecipe>;
