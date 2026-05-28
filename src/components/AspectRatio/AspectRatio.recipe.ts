import {cva, type RecipeVariantProps} from 'styled-system/css';

export const aspectRatioRecipe = cva({
  base: {
    position: 'relative',
    w: '100%',
    minH: 0,
    flexShrink: 0,
    overflow: 'clip',
  },
});

export type AspectRatioVariants = RecipeVariantProps<typeof aspectRatioRecipe>;
