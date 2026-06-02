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
      default: {
        bg: 'bg.subtle',
      },
      section: {
        bg: 'bg',
      },
    },
  },
  defaultVariants: {
    height: 'fill',
    variant: 'default',
  },
});

export type AppShellVariants = RecipeVariantProps<typeof appShellRecipe>;
