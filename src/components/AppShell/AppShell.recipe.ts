import {cva, sva, type RecipeVariantProps} from 'styled-system/css';

// The main region is a surface in its own right: it paints a background and, in
// the elevated variant, a rounded corner. Its padding is an inset from its own
// edge, which no region above it can supply. That is why it is not a
// `LayoutContent`, whose padding belongs to the surrounding surface and so
// collapses against an adjacent header or footer.
export const appShellMainRecipe = cva({
  base: {
    flex: 1,
    minH: 0,
    minW: 0,
    overflow: 'clip',
  },
  variants: {
    isScrollable: {
      true: {overflow: 'auto'},
    },
  },
  defaultVariants: {
    isScrollable: true,
  },
});

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
