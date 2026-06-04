import {cva, type RecipeVariantProps} from 'styled-system/css';

export const skeletonRecipe = cva({
  base: {
    bg: 'skeleton',
    backgroundImage:
      'linear-gradient(90deg, token(colors.skeleton) 0%, token(colors.skeleton.shimmer) 50%, token(colors.skeleton) 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      backgroundImage: 'none',
    },
  },
  variants: {
    radius: {
      none: {borderRadius: 0},
      0: {borderRadius: 0},
      1: {borderRadius: 'xs'},
      2: {borderRadius: 'sm'},
      3: {borderRadius: 'md'},
      4: {borderRadius: 'lg'},
      rounded: {borderRadius: 'full'},
    },
  },
  defaultVariants: {
    radius: 3,
  },
});

export type SkeletonVariants = RecipeVariantProps<typeof skeletonRecipe>;
