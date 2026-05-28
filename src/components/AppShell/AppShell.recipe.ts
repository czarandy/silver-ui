import {cva, type RecipeVariantProps} from 'styled-system/css';

export const appShellRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  variants: {
    height: {
      fill: {
        h: '100dvh',
      },
      auto: {
        minH: '100dvh',
      },
    },
    variant: {
      wash: {
        bg: 'bg.subtle',
      },
      surface: {
        bg: 'bg',
      },
      section: {
        bg: 'bg',
      },
      elevated: {
        bg: 'bg.subtle',
      },
    },
  },
  defaultVariants: {
    height: 'fill',
    variant: 'elevated',
  },
});

export type AppShellVariants = RecipeVariantProps<typeof appShellRecipe>;
