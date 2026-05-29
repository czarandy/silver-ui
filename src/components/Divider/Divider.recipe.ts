import {cva, type RecipeVariantProps} from 'styled-system/css';

export const dividerRecipe = cva({
  base: {
    color: 'fg.muted',
  },
  variants: {
    orientation: {
      horizontal: {
        display: 'flex',
        alignItems: 'center',
        w: '100%',
      },
      vertical: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        h: '100%',
      },
    },
    variant: {
      subtle: {},
      strong: {},
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'subtle',
  },
});

export type DividerVariants = RecipeVariantProps<typeof dividerRecipe>;
