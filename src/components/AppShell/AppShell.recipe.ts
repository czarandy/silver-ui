import {sva, type RecipeVariantProps} from 'styled-system/css';

export const appShellRecipe = sva({
  slots: ['root', 'header'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
  },
  variants: {
    height: {
      fill: {
        root: {
          h: '100dvh',
        },
      },
      auto: {
        root: {
          minH: '100dvh',
        },
      },
    },
    variant: {
      default: {
        root: {
          bg: 'bg.subtle',
        },
      },
      section: {
        root: {
          bg: 'bg',
        },
      },
    },
    headerDivider: {
      true: {
        header: {
          borderBlockEndWidth: 'default',
          borderBlockEndStyle: 'solid',
          borderBlockEndColor: 'border',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    height: 'fill',
    variant: 'default',
    headerDivider: false,
  },
});

export type AppShellVariants = RecipeVariantProps<typeof appShellRecipe>;
