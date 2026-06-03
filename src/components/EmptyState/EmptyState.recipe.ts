import {cva, type RecipeVariantProps} from 'styled-system/css';

export const emptyStateRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '4',
    w: 'full',
    px: '6',
    py: '8',
  },
  variants: {
    isCompact: {
      true: {
        gap: '2',
        px: '4',
        py: '4',
      },
      false: {},
    },
  },
  defaultVariants: {
    isCompact: false,
  },
});

export type EmptyStateVariants = RecipeVariantProps<typeof emptyStateRecipe>;
