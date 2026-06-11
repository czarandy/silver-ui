import {sva, type RecipeVariantProps} from 'styled-system/css';

export const topNavHeadingRecipe = sva({
  slots: ['root', 'logo', 'text', 'endContent'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      minH: '8',
      px: '2',
      color: 'fg',
      textDecoration: 'none',
    },
    logo: {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      minW: 0,
    },
    endContent: {
      ms: 'auto',
      flexShrink: 0,
    },
  },
});

export type TopNavHeadingVariants = RecipeVariantProps<
  typeof topNavHeadingRecipe
>;
