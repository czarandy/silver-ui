import {cva, type RecipeVariantProps} from 'styled-system/css';

const paddingVariants = {
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
};

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
    padding: paddingVariants,
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

export const layoutRegionRecipe = cva({
  variants: {
    padding: paddingVariants,
  },
  defaultVariants: {
    padding: 4,
  },
});

export type LayoutVariants = RecipeVariantProps<typeof layoutRecipe>;
export type LayoutRegionVariants = RecipeVariantProps<
  typeof layoutRegionRecipe
>;
